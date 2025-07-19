# 🔒 SSL Certificate Checker

A modern, web-based SSL certificate expiration monitoring tool built with Express.js and EJS. Monitor your websites' SSL certificates and get visual alerts for expiring certificates with automatic local logging.

## ✨ Features

- **🎯 Visual Status Indicators**: Color-coded status system for certificate expiration dates
  - 🟢 **Green**: 30+ days until expiration (Good)
  - 🟡 **Yellow**: 10-30 days until expiration (Warning) 
  - 🟠 **Orange**: 3-10 days until expiration (Alert)
  - 🔴 **Red**: 0-3 days until expiration (Critical)
  - ⚫ **Grey**: Certificate already expired

- **💾 Local Storage**: All URLs are stored in browser's localStorage for persistence
- **⏱️ Bulk Checking**: Check all URLs with a 1-second delay between each check
- **📝 Comprehensive Logging**: All SSL checks are logged locally with timestamps
- **📱 Responsive Design**: Modern, mobile-friendly UI with beautiful gradients
- **🔄 Individual & Batch Checks**: Check certificates individually or all at once
- **📊 Detailed Certificate Info**: View issuer, expiration dates, and validity periods

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ssl-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 Usage

### Adding URLs
1. Enter a URL in the input field (supports both `example.com` and `https://example.com` formats)
2. Click "Add URL" or press Enter
3. URLs are automatically saved to localStorage

### Checking SSL Certificates
- **Individual Check**: Click the "Check" button next to any URL
- **Bulk Check**: Click "Check All SSL Certificates" to check all URLs with 1-second intervals
- **Visual Progress**: Progress bar shows current checking status

### Viewing Logs
1. Select a date using the date picker (defaults to today)
2. Click "Load Logs" to view all SSL checks for that date
3. Logs show timestamps, URLs, results, and any errors

### Managing URLs
- **Remove Single URL**: Click the "Remove" button next to any URL
- **Clear All**: Use the "Clear All" button to remove all URLs (requires confirmation)

## 📁 Project Structure

```
ssl-checker/
├── app.js                 # Main Express server
├── package.json          # Dependencies and scripts
├── views/
│   └── index.ejs         # Main HTML template
├── public/
│   ├── styles.css        # Styling and responsive design
│   └── script.js         # Frontend JavaScript logic
├── logs/                 # Auto-generated SSL check logs
├── README.md            # This file
├── LICENSE              # Project license
└── .gitignore          # Git ignore rules
```

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Templating**: EJS (Embedded JavaScript)
- **SSL Checking**: ssl-checker npm package
- **Date Handling**: Moment.js
- **Storage**: Browser localStorage
- **Styling**: CSS3 with Flexbox/Grid, Font Awesome icons

## 📊 API Endpoints

- `POST /api/check-ssl` - Check SSL certificate for a single URL
- `GET /api/logs/:date?` - Retrieve logs for a specific date

## 🎨 Color Scheme & Status Legend

The application uses an intuitive color system for immediate visual feedback:

| Status | Color | Days Remaining | Description |
|--------|-------|----------------|-------------|
| Good | Green | 30+ days | Certificate is valid for more than 30 days |
| Warning | Yellow | 10-30 days | Certificate expires within 30 days |
| Alert | Orange | 3-10 days | Certificate expires within 10 days |
| Critical | Red | 0-3 days | Certificate expires very soon |
| Expired | Grey | < 0 days | Certificate has already expired |

## 🔧 Configuration

The application runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 📝 Logging

All SSL certificate checks are automatically logged to the `logs/` directory with the following format:
- **Filename**: `ssl-check-YYYY-MM-DD.log`
- **Format**: JSON entries with timestamp, URL, result, and any errors
- **Retention**: Logs are kept indefinitely (manual cleanup required)

## 🚀 Development

For development with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## 📱 Mobile Support

The application is fully responsive and works great on:
- Desktop computers
- Tablets
- Smartphones
- Progressive Web App (PWA) ready

## 🔐 Security Notes

- The application only checks SSL certificate information (read-only)
- No sensitive data is stored on the server
- URLs are stored locally in the browser's localStorage
- Logs contain only certificate metadata, no private information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

If you encounter any issues or have questions:
1. Check the browser console for any error messages
2. Ensure all dependencies are properly installed
3. Verify that the target URLs are accessible and have SSL certificates
4. Check the logs directory for detailed error information

---

**Made with ❤️ for SSL certificate monitoring**