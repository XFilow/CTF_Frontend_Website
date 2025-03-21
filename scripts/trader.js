document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelectorAll('.sidebar-menu ul li a');
    const userIcon = document.getElementById('user-icon');
    const userMenuLogged = document.getElementById('user-menu-logged');
    const userMenuNotLogged = document.getElementById('user-menu-not-logged');
    const userDropdownToggle = document.getElementById('user-dropdown-toggle');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');

    let traderInfo = null;
    let binanceSocket = null;
    let accountSocket = null;
    let positionsChart = null;
    let profitLossChart = null;
    let cumulativeProfitChart = null;
    let markPriceMap = {};

    // Check for token and update UI
    checkUserStatus();
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-section');
            updateHeaderAndContent(event, contentId);
        });
    });

    function checkUserStatus() {
        const token = localStorage.getItem('token');
        if (!token) {
            showLoginMenu();
        } else {
            showLoadingState();
            updateUserInfo(token);
            updateDashboard();
        }
    }

    async function updateUserInfo(token) {
        traderInfo = await fetchUserInfo(token);
        if (traderInfo) {
            updateUserMenu(traderInfo);
        } else {
            showLoginMenu();
        }
    }

    function updateUserMenu(traderInfo) {
        const displayName = traderInfo.username || traderInfo.email;
        userDropdownToggle.textContent = displayName;
        userMenuLogged.style.display = 'flex';
        userMenuNotLogged.style.display = 'none';
    }

    function showLoginMenu() {
        userMenuLogged.style.display = 'none';
        userMenuNotLogged.style.display = 'flex';
    }

    function showLoadingState() {
        userMenuLogged.style.display = 'none';
        userMenuNotLogged.style.display = 'none';
    }

    async function fetchUserInfo(token) {
        //const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }

        try {
            const response = await fetch('http://localhost:5000/trader/info', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const traderInfo = await response.json();
                return traderInfo; // Return the user info
            } else {
                console.log('Not authenticated or error fetching data');
                return null; // Return null if there's an error
            }
        } catch (error) {
            console.error('Error fetching trader info:', error);
            return null; // Return null in case of an exception
        }
    }

    // Update body content and header title
    function updateHeaderAndContent(event, contentId) {
        event.preventDefault();

        const headerTitle = document.querySelector('.content-header h1');

        if (!contentId) return;

        stopWebSockets()

        const selectedText = event.currentTarget.textContent;
        headerTitle.textContent = selectedText;

        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        const sectionToShow = document.getElementById(contentId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }

        if (contentId === 'profile-section') {
            updateProfile()
        }
        else if (contentId === 'settings-section') {
            updateSettings()
        }        
        else if (contentId === 'dashboard-section') {
            updateDashboard()
        }
        else if (contentId === 'exchanges-section') {
            updateExchanges()
        }
        else if (contentId === 'analytics-section') {
            updateAnalytics()
        }
        else if (contentId === 'positions-section') {
            updatePositions()
        }
        else if (contentId === 'copy-trading-section') {
            updateCopyTrading()
        }
    }

    function updateProfile() {
        document.querySelector('.profile-username').textContent = traderInfo.username;
        document.querySelector('.profile-email').textContent = traderInfo.email;
        document.querySelector('.profile-registration').textContent = new Date(traderInfo.register_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    function updateSettings() {
        document.getElementById('change-password-form').classList.remove('active');
        document.getElementById('change-password').classList.add('active');
    }

    async function updateDashboard() {
        const gettingStartedCard = document.getElementById('getting-started-card');
        const emptyPortfolio = document.getElementById('empty-portfolio');
        const emptyProfitLoss = document.getElementById('empty-profit-loss');
        
        //document.getElementById('binance-portfolio').style.display = 'none';

        gettingStartedCard.style.display = 'none'
        emptyPortfolio.style.display = 'none'
        emptyProfitLoss.style.display = 'none'

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }
    
        try {
            // Fetch the list of exchanges
            const exchangeResponse = await fetch(`http://localhost:5000/trader/exchanges`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!exchangeResponse.ok) {
                console.error('Failed to fetch exchange data:', exchangeResponse.statusText);
                return;
            }
    
            // Extract JSON response
            const exchangeList = await exchangeResponse.json();
            //console.log(exchangeList);

            if (!Array.isArray(exchangeList) || exchangeList.length === 0) {
                console.log("No exchange data available.");
                gettingStartedCard.style.display = 'block';
                emptyPortfolio.style.display = 'block';
                emptyProfitLoss.style.display = 'block';
                return; // Exit early if no exchanges
            }
    
            // Fetch balance only if exchanges exist
            const balanceResponse = await fetch(`http://localhost:5000/trader/balance?exchange=${exchangeList.join(',')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!balanceResponse.ok) {
                console.error('Failed to fetch balance data:', balanceResponse.statusText);
                return;
            }
    
            const balanceData = await balanceResponse.json();
            let validExchangeFound = false;
    
            for (const exchange in balanceData) {
                if (balanceData.hasOwnProperty(exchange) && balanceData[exchange].message !== 'No exchange data' && Object.keys(balanceData[exchange]).length > 0) {
                    validExchangeFound = true;
                    const exchangeData = balanceData[exchange];
    
                    // Find the container dynamically
                    document.getElementById(`${exchange}-portfolio`).style.display = 'inline-block';
                    const exchangeFuturesBalance = document.getElementById(`${exchange}-balance`);
    
                    if (!exchangeFuturesBalance) {
                        console.log(`No container found for exchange: ${exchange}`);
                        continue;
                    }
    
                    // Clear existing balances
                    exchangeFuturesBalance.innerHTML = '';
    
                    // Populate balances
                    for (const asset in exchangeData) {
                        if (exchangeData.hasOwnProperty(asset) && parseFloat(exchangeData[asset]) > 0) {
                            const p = document.createElement('p');
                            p.textContent = `${exchangeData[asset]} ${asset.toUpperCase()}`;
                            exchangeFuturesBalance.appendChild(p);
                        }
                    }
                }
            }
    
            // Show "getting started" card if no valid exchange was found
            if (!validExchangeFound) {
                console.log("No exchange data available.");
                document.getElementById('getting-started-card').style.display = 'block';
            }
    
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }
    
    async function updateExchanges() {
        document.getElementById('new-exchange-container').classList.remove('active');
        document.getElementById('add-exchange-container').classList.add('active');
        document.getElementById('new-exchange').value = '';
        document.getElementById('new-exchange-account-name').value = '';
        document.getElementById('new-exchange-api-key').value = '';
        document.getElementById('new-exchange-api-secret').value = '';
        document.getElementById('exchange-message').textContent = '';
    
        // Update the table with the received data
        const tableBody = document.getElementById("exchanges-tbody");

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }
    
        try {
            // Fetch the list of exchanges
            const exchangeResponse = await fetch(`http://localhost:5000/trader/exchanges`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!exchangeResponse.ok) {
                console.error('Failed to fetch exchange data:', exchangeResponse.statusText);
                return;
            }
    
            // Extract JSON response
            const exchangeList = await exchangeResponse.json();
            //console.log(exchangeList);

            const response = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchangeList.join(',')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }
    
            const data = await response.json();
    
            // Clear existing table rows
            tableBody.innerHTML = "";
            let hasExchanges = false; // Flag to check if any exchanges exist

            // Iterate over each exchange response
            Object.entries(data).forEach(([exchange, exchangeData]) => {
                if (exchangeData.message === 'No exchange data' || Object.keys(exchangeData).length === 0) {
                    return; // Skip if no data
                }
    
                hasExchanges = true;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${exchangeData.exchange_name}</td>
                    <td>${exchangeData.account_name}</td>
                    <td>${exchangeData.api_key}</td>
                    <td>
                        <button class="table-edit-button" onclick="editExchange('${exchange}')">Edit</button>
                        <button class="table-delete-button" onclick="deleteExchange('${exchange}')">Delete</button>
                    </td>
                `;
    
                tableBody.appendChild(row);
            });
    
            // Only show "No exchanges connected" if no exchanges were found
            if (!hasExchanges) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No exchanges connected</td></tr>';
            }
            
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }

    async function updateAnalytics() {
        // Initialize with Weekly View (Last 7 Days)
        updatePositionsChart(7);
        updateProfitLossChart(7)
        updateCumulativeProfitChart(7);

        const analyticsTable = document.getElementById('binance-analytics-tbody');
        analyticsTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">TODO WORK</td></tr>';
    }

    // Fetch open positions data from API
    async function fetchOpenPositions(days) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/trader/open-positions?days=${days}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return await response.json();
        } catch (error) {
            console.error("Error fetching open positions:", error);
            return [];
        }
    }

    async function updatePositionsChart(days) {
        try {
            const data = await fetchOpenPositions(days) || [];
        
            if (data.length === 0) {
                console.log("No position data available.");
                return;
            }
    
            const canvas = document.getElementById("positions-chart");
            if (!canvas) {
                console.error("Chart element not found.");
                return;
            }
            const ctx = canvas.getContext("2d");
    
            if (positionsChart) {
                positionsChart.destroy(); // Destroy existing chart if it exists
            }
    
            const windowSize = getWindowSize(days);
    
            // Object to aggregate counts for each time period
            const aggregatedData = {};
    
            data.forEach(item => {
                const date = new Date(item.time);
                let label = formatLabel(date, windowSize);
                aggregatedData[label] = (aggregatedData[label] || 0) + 1; // Count positions
            });
    
            const labels = Object.keys(aggregatedData);
            const counts = labels.map(label => aggregatedData[label]);
    
            if (labels.length === 0) {
                console.log("No position data available after filtering.");
                return;
            }
    
            positionsChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Open Positions",
                        data: counts,
                        backgroundColor: "rgba(22, 142, 223, 0.6)",
                        borderColor: "rgb(22, 142, 223)",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: getAxisLabel(windowSize) } },
                        y: { title: { display: true, text: "Count" }, beginAtZero: true, 
                            ticks: {
                                callback: (value) => Number.isInteger(value) ? value : null, // Only show whole numbers
                                stepSize: function (context) {
                                    const maxValue = context.chart.scales.y.max; 
                                    return Math.ceil(maxValue / 10); // Adjust step size dynamically
                            }}
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error updating positions chart:", error);
        }
    }

    // Fetch trade profit-loss data from API
    async function fetchTradeProfits(days) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/trader/trade-profits?days=${days}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching trade profits:", error);
            return [];
        }
    }

    async function updateProfitLossChart(days) {
        try {
            const data = await fetchTradeProfits(days) || [];
    
            if (data.length === 0) {
                console.log("No profit/loss data available.");
                return;
            }
    
            const canvas = document.getElementById("profit-loss-chart");
            if (!canvas) {
                console.error("Profit-Loss Chart element not found.");
                return;
            }
            const ctx = canvas.getContext("2d");
    
            if (profitLossChart) {
                profitLossChart.destroy(); // Destroy existing chart if it exists
            }
    
            // Determine window size
            const windowSize = getWindowSize(days);
    
            // Aggregate profits by date/month/year
            const aggregatedProfits = {};
            data.forEach(trade => {
                const date = new Date(trade.closeTime);
                let label = formatLabel(date, windowSize);
                aggregatedProfits[label] = (aggregatedProfits[label] || 0) + parseFloat(trade.profitPercent);
            });
    
            const labels = Object.keys(aggregatedProfits);
            const profitData = labels.map(label => aggregatedProfits[label]);
    
            if (labels.length === 0) {
                console.log("No profit/loss data available after filtering.");
                return;
            }
    
            // Determine color based on overall profit trend
            const firstProfit = profitData.length > 0 ? profitData[0] : 0;
            const lastProfit = profitData.length > 0 ? profitData[profitData.length - 1] : 0;
            const isPositive = lastProfit >= firstProfit;

            const backgroundColor = isPositive ? "rgba(75, 190, 110, 0.3)" : "rgba(255, 100, 100, 0.3)";
            const borderColor = isPositive ? "rgb(75, 190, 110)" : "rgb(255, 100, 100)";

            profitLossChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Profit/Loss (%)",
                        data: profitData,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: getAxisLabel(windowSize) } },
                        y: {
                            title: { display: true, text: "Profit (%)" },
                            beginAtZero: true
                        }
                    }
                }
            });
    
        } catch (error) {
            console.error("Error updating profit/loss chart:", error);
        }
    }
    
    async function updateCumulativeProfitChart(days) {
        try {
            const data = await fetchTradeProfits(days) || [];
    
            if (data.length === 0) {
                console.log("No cumulative profit data available.");
                return;
            }
    
            const canvas = document.getElementById("cumulative-profit-chart");
            if (!canvas) {
                console.error("Cumulative Profit Chart element not found.");
                return;
            }
            const ctx = canvas.getContext("2d");
    
            if (cumulativeProfitChart) {
                cumulativeProfitChart.destroy(); // Destroy existing chart if it exists
            }
    
            // Determine window size
            const windowSize = getWindowSize(days);
    
            // Aggregate cumulative profits by date/month/year
            const aggregatedCumulative = {};
            data.forEach(trade => {
                const date = new Date(trade.closeTime);
                let label = formatLabel(date, windowSize);
                aggregatedCumulative[label] = parseFloat(trade.cumulativeProfit);
            });
    
            const labels = Object.keys(aggregatedCumulative);
            const cumulativeData = labels.map(label => aggregatedCumulative[label]);
    
            if (labels.length === 0) {
                console.log("No cumulative profit data available after filtering.");
                return;
            }
    
            // Determine color based on overall profit trend
            const firstProfit = cumulativeData.length > 0 ? cumulativeData[0] : 0;
            const lastProfit = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1] : 0;
            const isPositive = lastProfit >= firstProfit;

            const backgroundColor = isPositive ? "rgba(75, 190, 110, 0.3)" : "rgba(255, 100, 100, 0.3)";
            const borderColor = isPositive ? "rgb(75, 190, 110)" : "rgb(255, 100, 100)";

            cumulativeProfitChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Cumulative Profit (%)",
                        data: cumulativeData,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: getAxisLabel(windowSize) } },
                        y: {
                            title: { display: true, text: "Profit (%)" },
                            beginAtZero: true
                        }
                    }
                }
            });
    
        } catch (error) {
            console.error("Error updating cumulative profit chart:", error);
        }
    }   

    function getWindowSize(days) {
        if (days > 0 && days <= 30) return "1d";
        if (days > 30 && days <= 365) return "1mo";
        return "1y";
    }

    function formatLabel(date, windowSize) {
        if (windowSize === "1d") return date.toLocaleDateString();
        if (windowSize === "1mo") return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        return date.getFullYear().toString();
    }

    function getAxisLabel(windowSize) {
        return windowSize === "1d" ? "Date" : (windowSize === "1mo" ? "Month" : "Year");
    }

    async function updatePositions() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }
    
        try {
            document.getElementById('binance-positions-tbody').innerHTML = 
                '<tr><td colspan="8" style="text-align:center;">Loading positions...</td></tr>';
    
            // Ensure WebSockets are running
            if (!binanceSocket || !accountSocket) {
                startWebSockets();
            }
    
            // Fetch positions from API
            await fetchAndUpdatePositions();
    
        } catch (error) {
            console.error('Error updating positions:', error);
        }
    }
    
    function startWebSockets() {
        if (binanceSocket && binanceSocket.readyState === WebSocket.OPEN) {
            console.warn('MarkPrice WebSocket already running.');
        } else {
            binanceSocket = new WebSocket('wss://stream.binancefuture.com/ws/!markPrice@arr'); //wss://fstream.binance.com/ws/!markPrice@arr
    
            binanceSocket.onopen = () => console.log('MarkPrice WebSocket connected');
            binanceSocket.onclose = () => {
                console.warn('MarkPrice WebSocket closed');
                binanceSocket = null;
            };
            binanceSocket.onerror = (error) => {
                console.error('MarkPrice WebSocket error:', error);
                if (binanceSocket) {
                    binanceSocket.close();
                }
            };
    
            binanceSocket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                parsedData.forEach(update => {
                    markPriceMap[update.s] = parseFloat(update.p);
                });
                updateTablePrices();
            };
        }
    
        if (!accountSocket || accountSocket.readyState !== WebSocket.OPEN) {
            startAccountWebSocket();
        }
    }
    
    async function startAccountWebSocket() {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        try {
            const listenKeyResponse = await fetch('http://localhost:5000/trader/listen-key', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exchange: 'binance' })
            });
    
            if (!listenKeyResponse.ok) throw new Error('Failed to get listenKey');
    
            const listenKeyData = await listenKeyResponse.json();
            if (!listenKeyData.listenKey) throw new Error('No listenKey received');
    
            accountSocket = new WebSocket(`wss://stream.binancefuture.com/ws/${listenKeyData.listenKey}`); // wss://fstream.binance.com/ws/${listenKeyData.listenKey}
    
            accountSocket.onopen = () => console.log('Account WebSocket connected');
            accountSocket.onclose = () => {
                console.warn('Account WebSocket closed');
                accountSocket = null;
            };
            accountSocket.onerror = (error) => {
                console.error('Account WebSocket error:', error);
                if (accountSocket) {
                    accountSocket.close();
                }
            };
    
            accountSocket.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.e === 'ACCOUNT_UPDATE') {
                    console.log('Account WebSocket message received.');
                    await fetchAndUpdatePositions();
                }
            };
    
        } catch (error) {
            console.error('Error setting up Account WebSocket:', error);
        }
    }
    
    // Fetch latest positions from API
    async function fetchAndUpdatePositions() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn("No token found, user must log in.");
                return;
            }
    
            const response = await fetch('http://localhost:5000/trader/positions?exchange=binance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) throw new Error(`Failed to fetch positions: ${response.statusText}`);
    
            const data = await response.json();
            //console.log("Positions received:", data.positions);
            const openPositions = data.positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
            updatePositionsTable(openPositions);
    
        } catch (error) {
            console.error('Error fetching positions:', error);
        } 
    }
    
    // Updates table data
    function updatePositionsTable(positionData = []) {
        const positionsTable = document.getElementById('binance-positions-tbody');
    
        if (!positionData.length) {
            positionsTable.innerHTML = '<tr><td colspan="8" style="text-align:center;">No open positions</td></tr>';
            return;
        }
    
        let rows = '';
        positionData.forEach(pos => {
            const markPrice = markPriceMap[pos.symbol]?.toFixed(2) || "-";
            const pnl = parseFloat(pos.unrealizedProfit || "0");
            const margin = Math.abs(parseFloat(pos.positionAmt) * parseFloat(pos.entryPrice) / parseFloat(pos.leverage));
            const roi = margin !== 0 ? ((pnl / margin) * 100).toFixed(2) : '0.00';
    
            rows += `
                <tr id="row-${pos.symbol}">
                    <td>${pos.symbol}</td>
                    <td>${parseFloat(pos.positionAmt) > 0 ? 'Long' : 'Short'}</td>
                    <td>${pos.leverage}x</td>
                    <td>${pos.positionAmt} ${pos.symbol.replace("USDT", "")}</td>
                    <td>${parseFloat(pos.entryPrice).toString()}</td>
                    <td id="markPrice-${pos.symbol}">${markPrice}</td>
                    <td id="pnl-${pos.symbol}">${pnl.toFixed(2)} USDT</td>
                    <td id="roi-${pos.symbol}">${roi}%</td>
                </tr>
            `;
        });
    
        positionsTable.innerHTML = rows;
    }
    
    // Updates only the mark price, PNL, and ROI
    function updateTablePrices() {
        document.querySelectorAll('tr[id^="row-"]').forEach(row => {
            const symbol = row.id.replace('row-', '');
            if (!markPriceMap[symbol]) return;
    
            const markPrice = markPriceMap[symbol].toFixed(2);
            const entryPrice = parseFloat(row.cells[4].textContent);
            const positionAmt = parseFloat(row.cells[3].textContent);
            const leverage = parseFloat(row.cells[2].textContent);
    
            const pnl = (markPrice - entryPrice) * positionAmt;
            const margin = Math.abs(positionAmt * entryPrice / leverage);
            const roi = margin !== 0 ? ((pnl / margin) * 100).toFixed(2) : '0.00';
    
            row.querySelector(`#markPrice-${symbol}`).textContent = markPrice;
            row.querySelector(`#pnl-${symbol}`).textContent = pnl.toFixed(2) + " USDT";
            row.querySelector(`#roi-${symbol}`).textContent = roi + "%";
        });
    }
/*    
    let listenKeyInterval = null; // Store the interval ID

    function keepAliveListenKey() {
        setInterval(async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
    
            try {
                await fetch('http://localhost:5000/trader/listen-key', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ exchange: 'binance' })
                });
                console.log('Listen key refreshed');
            } catch (error) {
                console.error('Error refreshing listen key:', error);
            }
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    // Call this function to stop refreshing the listen key
    function stopListenKeyRefresh() {
        if (listenKeyInterval) {
            clearInterval(listenKeyInterval);
            listenKeyInterval = null;
            console.log('Stopped listen key refresh');
        }
    }
*/
    // Stop WebSockets when user leaves
    function stopWebSockets() {
        if (binanceSocket) {
            binanceSocket.close();
            binanceSocket = null;
            //console.log('Binance Socket closed');
        }
        if (accountSocket) {
            accountSocket.close();
            accountSocket = null;
            //console.log('Account Socket closed');
        }
    }
    
    async function updateCopyTrading() {
        const binanceBTCBot = document.getElementById('binance-btc-bot');
        const binanceETHBot = document.getElementById('binance-eth-bot');
        const noActiveBot = document.getElementById('no-active-bot');

        // Clear active bots
        binanceBTCBot.style.display = 'none';
        binanceETHBot.style.display = 'none';
        noActiveBot.style.display = 'block';

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }

        try {
            // Fetch the list of exchanges
            const exchangeResponse = await fetch(`http://localhost:5000/trader/exchanges`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!exchangeResponse.ok) {
                console.error('Failed to fetch exchange data:', exchangeResponse.statusText);
                return;
            }
    
            // Extract JSON response
            const exchangeList = await exchangeResponse.json();
            //console.log(exchangeList);

            const response = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchangeList.join(',')}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }

            const data = await response.json();
            //console.log('Updated Exchange Data:', data); // Debugging

            // Iterate over each exchange response
            Object.entries(data).forEach(([exchange, exchangeData]) => {
                if (exchangeData.message === 'No exchange data' || Object.keys(exchangeData).length === 0) {
                    return; // Skip if no data
                }

                if (exchange.toLowerCase() === 'binance') {
                    if (exchangeData.btc_bot) {
                        noActiveBot.style.display = 'none';
                        binanceBTCBot.style.display = 'inline-block';
                    }
                    if (exchangeData.eth_bot) {
                        noActiveBot.style.display = 'none';
                        binanceETHBot.style.display = 'inline-block';
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }

    // Sidebar expansion
    sidebarToggle.addEventListener('click', function() {
        const menuTexts = document.querySelectorAll('.sidebar-menu a span');
        const sidebarTitle = document.querySelector('.sidebar-title');
        const mainContent = document.getElementById('main-content');
        const sidebar = document.querySelector('.sidebar');

        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
        document.body.classList.toggle('icons-only');

        sidebarTitle.style.display = sidebarTitle.style.display === 'none' ? 'block' : 'none';
        menuTexts.forEach(text => {
            text.style.display = text.style.display === 'none' ? 'inline' : 'none';
        });
    });

    function toggleDropdownMenu() {
        userDropdownMenu.style.display = userDropdownMenu.style.display === 'block' ? 'none' : 'block';
    }

    // User menu
    userDropdownToggle.addEventListener('click', toggleDropdownMenu);
    userIcon.addEventListener('click', toggleDropdownMenu);

    // Event content handler
    userDropdownMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function(event) {
            const contentId = event.currentTarget.getAttribute('data-section');
            const logoutOption = document.getElementById('logout-option');
            
            if (event.currentTarget === logoutOption) {
                localStorage.removeItem('token');
                console.log('Logged out');
                window.location.href = 'login?message=logout';
            } else if (contentId) {
                updateHeaderAndContent(event, contentId);
            }

            userDropdownMenu.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (!userDropdownToggle.contains(event.target) && !userIcon.contains(event.target) && !userDropdownMenu.contains(event.target)) {
            userDropdownMenu.style.display = 'none';
        }
    });

    // Handle the profile changes
    document.getElementById('save-profile-button').addEventListener('click', async function() {
        const newUsername = document.getElementById('change-name').value.trim();
        const nameTakenError = document.getElementById('name-taken-error');
        const pictureInput = document.getElementById('change-picture');
        const fileSizeError = document.getElementById('file-size-error');
        const newPicture = pictureInput.files.length > 0 ? pictureInput.files[0] : null;
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }
        
        try {
            // Change username
            if (newUsername) {
                const response = await fetch('http://localhost:5000/trader/username', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newUsername })
                });

                if (response.ok) {
                    nameTakenError.textContent = ''; // Clear any previous error message
                    userDropdownToggle.textContent = newUsername;
                    document.querySelector('.profile-username').textContent = newUsername;
                    console.log('Profile has been updated.');
                } else {
                    const errorData = await response.json();
                    nameTakenError.textContent = errorData.message;
                    console.error(`Failed to update profile: ${errorData.message}`);
                }
            }

            // Change picture
            if (newPicture) {
                const maxSizeKB = 300; // Max size in kilobytes

                if (newPicture.size > maxSizeKB * 1024) {
                    fileSizeError.textContent = 'File size exceeds 300KB';
                } else {
                    fileSizeError.textContent = ''; // Clear any previous error message

                    // Read and display the image
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        userIcon.src = e.target.result;
                    };
                    reader.readAsDataURL(newPicture);
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    });

    // Terminate Account
    document.getElementById('terminate-profile-button').addEventListener('click', async function() {
        const confirmed = confirm('Are you sure you want to terminate your account? This action cannot be undone.');

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }
        
        if (confirmed) {
            try {
                const response = await fetch('http://localhost:5000/trader/terminate-account', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Clear local storage or perform any other cleanup
                    localStorage.removeItem('token');
                    alert('Your account has been terminated.');
                    window.location.href = 'login?message=account-terminated';
                } else {
                    const errorData = await response.json();
                    alert(`Failed to terminate account: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error terminating account:', error);
                alert('An error occurred while terminating your account.');
            }
        }
    });

    // Change password button
    document.getElementById('change-password-button').addEventListener('click', function() {
        document.getElementById('change-password').classList.remove('active');
        document.getElementById('change-password-form').classList.add('active');
    });

    // Save new password button
    document.getElementById('save-password-button').addEventListener('click', async function() {
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmNewPassword = document.getElementById('confirm-new-password').value.trim();
        const statusMessage = document.getElementById('change-password-message');

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null; // Return null if the user is not logged in
        }

        // Reset message
        statusMessage.textContent = '';
        statusMessage.style.display = 'flex'
        statusMessage.style.color = 'red';

        try {
            // Basic validation
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                statusMessage.textContent = 'All fields are required';
                return;
            }

            if (newPassword !== confirmNewPassword) {
                statusMessage.textContent = 'New passwords do not match';
                return;
            }

            if (newPassword.length < 7) {
                statusMessage.textContent = 'Password must have at least 7 characters';
                return;
            }
       
            // Send the password update request
            const response = await fetch('http://localhost:5000/trader/password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();
            if (!response.ok) {
                statusMessage.textContent = result.message || 'Failed to update password.';
                return;
            }
            
            statusMessage.style.color = 'lime';
            statusMessage.textContent = 'Password updated successfully';
        
        } catch (error) {
            console.error('Error updating password:', error);
            statusMessage.textContent = 'An error occurred please try again';
        }
    });
    
    // Titles toggle
    document.querySelectorAll('.card-title').forEach(title => {
        title.addEventListener('click', function() {
            const card = this.closest('.card'); // Find the parent card
            // Select all the target content elements inside the card
            const contents = card.querySelectorAll('.card-content, .getting-started-content, .copy-trading-content, .table-content');    
            contents.forEach(content => {
                content.classList.toggle('collapsed');
            });
    
            this.classList.toggle('collapsed');
        });
    });

    // Add exchange button
    document.getElementById('add-exchange-button').addEventListener('click', function () {
        document.getElementById('add-exchange-container').classList.remove('active');
        document.getElementById('new-exchange-container').classList.add('active');
    });

    // New Exchange API form submission
    document.getElementById('new-api-exchange').addEventListener('submit', async function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the form elements
        const exchangeMessageContainer = document.getElementById('exchange-message');
        const exchange = document.getElementById('new-exchange').value.trim();
        const accountName = document.getElementById('new-exchange-account-name').value.trim();
        const apiKey = document.getElementById('new-exchange-api-key').value.trim();
        const apiSecret = document.getElementById('new-exchange-api-secret').value.trim();

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null;
        }

        try {
            // Validate the form fields
            if (!exchange || !accountName || !apiKey || !apiSecret) {
                exchangeMessageContainer.textContent = 'All fields are required';
                exchangeMessageContainer.style.color = 'red';
                //exchangeMessageContainer.style.borderColor = 'red';
                exchangeMessageContainer.style.display = 'block';
                //alert('All fields are required to create a new API.');
                return;
            }

            const getResponse = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (getResponse.ok) {
                const exchangeData = await getResponse.json();
            
                if (exchangeData[exchange] && exchangeData[exchange].exchange_name) {
                    if (exchange === exchangeData[exchange].exchange_name.toLowerCase()) {
                        // Confirm before deleting
                        const confirmEdit = confirm(`Are you sure you want to edit the current ${exchangeData[exchange].exchange_name} API?`);
                        if (!confirmEdit) return;
                    }
                }
            }

            const postResponse = await fetch('http://localhost:5000/trader/exchange', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange,
                    accountName,
                    apiKey,
                    apiSecret
                })
            });

            const data = await postResponse.json();
            if (!postResponse.ok) {
                throw new Error(data.error || 'Failed to save API credentials');
            }
        
            updateExchanges();
        }
        catch(error) {
            console.error('Error:', error);
            exchangeMessageContainer.textContent = error.message;
            exchangeMessageContainer.style.color = 'red';
            exchangeMessageContainer.style.display = 'block';
        }
    });

    // Edit API button
    window.editExchange = async function(exchange) {
        document.getElementById('add-exchange-container').classList.remove('active');
        document.getElementById('new-exchange-container').classList.add('active');
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return null;
        }

        try {
            const response = await fetch(`http://localhost:5000/trader/exchange?exchange=${exchange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch exchange data:', response.statusText);
                return;
            }

            const exchangeData = await response.json();
            //console.log('Exchange Data:', exchangeData);
        
            if (exchangeData) {
                // Pre-fill the form with the current data
                document.getElementById('new-exchange').value = exchange;
                document.getElementById('new-exchange-account-name').value = exchangeData[exchange].account_name;
                document.getElementById('new-exchange-api-key').value = exchangeData[exchange].api_key;
                document.getElementById('new-exchange-api-secret').value = exchangeData[exchange].api_secret;
            }
        } catch (error) {
            console.error('Error fetching exchange data:', error);
        }
    }

    // Delete API button
    window.deleteExchange = async function(exchange) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        // Confirm before deleting
        const confirmDelete = confirm(`Are you sure you want to delete the ${exchange.charAt(0).toUpperCase() + exchange.slice(1)} API?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/trader/exchange`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exchange })
            });

            if (!response.ok) {
                console.error('Failed to delete exchange data:', response.statusText);
                return;
            }

            console.log(`${exchange} API key deleted successfully!`);
            
            // Remove the deleted exchange row from the table
            const tableBody = document.getElementById("exchanges-tbody");
            const rows = tableBody.getElementsByTagName("tr");

            for (let i = 0; i < rows.length; i++) {
                const rowExchange = rows[i].children[0].textContent.trim().toLowerCase();
                if (rowExchange === exchange.toLowerCase()) {
                    tableBody.removeChild(rows[i]);
                    break;
                }
            }

            // Hide table if no data is left
            if (tableBody.children.length === 0) {
                tableBody.classList.remove("has-data");
            }
            
            updateExchanges();

        } catch (error) {
            console.error('Error deleting exchange data:', error);
        }
    }

    // Update Positions Histogram Analytics
    document.getElementById("btc-positions-timeRange").addEventListener("change", (event) => {
        const days = parseInt(event.target.value);
        updatePositionsChart(days);
    });

    // Update Profit-Loss Chart Analytics
    document.getElementById("btc-profit-loss-timeRange").addEventListener("change", (event) => {
        const days = parseInt(event.target.value);
        updateProfitLossChart(days);
    });

    // Update Cumulative Profit Chart Analytics
    document.getElementById("btc-cumulative-profit-timeRange").addEventListener("change", (event) => {
        const days = parseInt(event.target.value);
        updateCumulativeProfitChart(days);
    });
    
    // Copy-trade Binance BTC 
    document.getElementById('binance-btc-copy-button').addEventListener('click', async function() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        try {
            // Send the password update request
            const response = await fetch('http://localhost:5000/trader/copy-trade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange: 'binance',
                    coin: 'btc'
                })
            });

            if (!response.ok) {
                console.error('Failed to copy-trade BTC:', response.statusText);
                return;
            }

            //const result = await response.json();
            //console.log('Copy-trading BTC successful:', result);

            // Show BTC bot UI
            document.getElementById('no-active-bot').style.display = 'none';
            document.getElementById('binance-btc-bot').style.display = 'inline-block';

        } catch (error) {
            console.error('Error copy-trading BTC:', error);
        }
    });

    // Copy-trade Binance ETH 
    document.getElementById('binance-eth-copy-button').addEventListener('click', async function() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        try {
            // Send the password update request
            const response = await fetch('http://localhost:5000/trader/copy-trade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange: 'binance',
                    coin: 'eth'
                })
            });

            if (!response.ok) {
                console.error('Failed to copy-trade ETH:', response.statusText);
                return;
            }

            //const result = await response.json();
            //console.log('Copy-trading ETH successful:', result);

            // Show ETH bot UI
            document.getElementById('no-active-bot').style.display = 'none';
            document.getElementById('binance-eth-bot').style.display = 'inline-block';

        } catch (error) {
            console.error('Error copy-trading ETH:', error);
        }
    });
    
    // Cancel-trade Binance BTC 
    document.getElementById('cancel-binance-btc-bot').addEventListener('click', async function() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        try {
            // Send the password update request
            const response = await fetch('http://localhost:5000/trader/cancel-trade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange: 'binance',
                    coin: 'btc'
                })
            });

            if (!response.ok) {
                console.error('Failed to cancel-trade BTC:', response.statusText);
                return;
            }

            //const result = await response.json();
            //console.log('Cancel-trading BTC successful:', result);

            // Clear BTC bot UI
            updateCopyTrading();
            //document.getElementById('binance-btc-bot').style.display = 'none';

        } catch (error) {
            console.error('Error cancel-trading BTC:', error);
        }
    });

    // Cancel-trade Binance ETH 
    document.getElementById('cancel-binance-eth-bot').addEventListener('click', async function() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User is not logged in');
            return;
        }

        try {
            // Send the password update request
            const response = await fetch('http://localhost:5000/trader/cancel-trade', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchange: 'binance',
                    coin: 'eth'
                })
            });

            if (!response.ok) {
                console.error('Failed to cancel-trade ETH:', response.statusText);
                return;
            }

            //const result = await response.json();
            //console.log('Cancel-trading ETH successful:', result);

            // Clear ETH bot UI
            updateCopyTrading();
            //document.getElementById('binance-eth-bot').style.display = 'none';

        } catch (error) {
            console.error('Error cancel-trading ETH:', error);
        }
    });
        
});