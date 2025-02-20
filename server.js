const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { customAlphabet } = require('nanoid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

// Load environment variables from the protected.env file
dotenv.config({ path: './protected.env' });

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Remove .html extension
app.get('/:page', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', `${req.params.page}.html`));
});

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify Database Connection
pool.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) {
        console.error('Error connecting to the database:', error);
    } else {
        console.log('Database connection successful');
    }
});

// Middleware for input validation
const validateRegisterInput = (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    // Check if password has at least 7 letters/numbers
    if (password.length < 7) {
        return res.status(400).json({ message: 'Password must be at least 7 characters long' });
    }
    next();
};

// Function to generate a random 6-digit code
const nanoid = customAlphabet('1234567890', 6);

// Function to send verification email
const transporter = nodemailer.createTransport({
    service: 'protonmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Sign Up - Verification Code',
        text: `Welcome to the Crypto Trading Flow community!\n\nYou must verify your email ${email} in order to activate your account.\n\nYour verification code is: ${code}\n\nThis code will expire in 1 hour.\n\nBest Regards,\nCTF Team\nhttps://cryptotradingflow.com`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Function to encrypt the data
const algorithm = 'aes-256-cbc';

// Convert the hex string to a buffer
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

const encryptData = (data) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Function to decrypt the data
const decryptData = (encryptedData, iv) => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Register Route
app.post('/register', validateRegisterInput, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email already exists in the users table
        const [existingUser] = await pool.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if email already exists in the pending_users table
        const [existingPendingUser] = await pool.promise().query(
            'SELECT * FROM pending_users WHERE email = ?',
            [email]
        );
        if (existingPendingUser.length > 0) {
            return res.status(400).json({ message: 'Verification code already sent to this email' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a verification code
        const code = nanoid();

        // Encrypt the verification code
        const { iv, encryptedData } = encryptData(code);

        // Set the expiration time to 1 hour from now
        const expiration = new Date(Date.now() + 3600000); // 1 hour from now

        // Insert the user and verification code into the pending_users table
        await pool.promise().query(
            'INSERT INTO pending_users (email, password, code, iv, expiration) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, encryptedData, iv, expiration]
        );

        // Send the verification email
        sendVerificationEmail(email, code);

        res.status(201).json({ message: 'Verification code sent to email' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error); // Added error logging
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify code endpoint
app.post('/verify-code', async (req, res) => {
    const { code, email } = req.body;

    try {
        // Check if the code is valid and not expired
        const [rows] = await pool.promise().query(
            'SELECT * FROM pending_users WHERE email = ? AND expiration > NOW()',
            [email]
        );
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const { password, iv, code: encryptedCode } = rows[0];

        // Decrypt the stored code
        const decryptedCode = decryptData(encryptedCode, iv);

        // Check if the provided code matches the decrypted code
        if (code !== decryptedCode) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        // Insert the user into the users table
        await pool.promise().query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, password]
        );

        // Delete the user from the pending_users table
        await pool.promise().query(
            'DELETE FROM pending_users WHERE email = ?',
            [email]
        );

        res.status(200).json({ message: 'Email verified successfully. Registration complete!' });
    } catch (error) {
        console.error('Error during code verification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));