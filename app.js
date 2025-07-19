const express = require('express');
const path = require('path');
const sslChecker = require('ssl-checker');
const moment = require('moment');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Helper function to get status color based on expiration days
function getStatusColor(daysUntilExpiry) {
    if (daysUntilExpiry < 0) return 'grey'; // Expired
    if (daysUntilExpiry < 3) return 'red';  // Less than 3 days
    if (daysUntilExpiry < 10) return 'orange'; // Less than 10 days
    if (daysUntilExpiry < 30) return 'yellow'; // Less than 30 days
    return 'green'; // Everything else
}

// Helper function to log check results
function logCheckResult(url, result, error = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        url: url,
        result: result,
        error: error
    };
    
    const logFileName = `ssl-check-${moment().format('YYYY-MM-DD')}.log`;
    const logPath = path.join(logsDir, logFileName);
    
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// API endpoint to check SSL certificate
app.post('/api/check-ssl', async (req, res) => {
    const { url } = req.body;
    
    try {
        // Remove protocol if present and extract hostname
        let hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        
        const result = await sslChecker(hostname);
        
        const daysUntilExpiry = result.daysRemaining;
        const status = getStatusColor(daysUntilExpiry);
        
        const response = {
            url: url,
            hostname: hostname,
            valid: result.valid,
            daysRemaining: result.daysRemaining,
            validFrom: result.validFrom,
            validTo: result.validTo,
            issuer: result.issuer,
            status: status,
            checked: true
        };
        
        logCheckResult(url, response);
        
        res.json(response);
    } catch (error) {
        const errorResponse = {
            url: url,
            error: error.message,
            checked: false,
            status: 'error'
        };
        
        logCheckResult(url, null, error.message);
        
        res.json(errorResponse);
    }
});

// API endpoint to get logs
app.get('/api/logs/:date?', (req, res) => {
    const date = req.params.date || moment().format('YYYY-MM-DD');
    const logFileName = `ssl-check-${date}.log`;
    const logPath = path.join(logsDir, logFileName);
    
    if (!fs.existsSync(logPath)) {
        return res.json({ logs: [], message: 'No logs found for this date' });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const logs = logContent.trim().split('\n').filter(line => line.trim()).map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            return null;
        }
    }).filter(log => log !== null);
    
    res.json({ logs: logs.reverse() }); // Most recent first
});

// Start server
app.listen(PORT, () => {
    console.log(`SSL Checker server running on port ${PORT}`);
});
