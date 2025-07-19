class SSLChecker {
    constructor() {
        this.urls = this.getStoredUrls();
        this.isChecking = false;
        this.initializeEventListeners();
        this.renderUrls();
        this.setTodayAsDefaultLogDate();
    }

    // Local Storage Management
    getStoredUrls() {
        const stored = localStorage.getItem('ssl-checker-urls');
        return stored ? JSON.parse(stored) : [];
    }

    saveUrls() {
        localStorage.setItem('ssl-checker-urls', JSON.stringify(this.urls));
        this.updateUrlCount();
    }

    // Event Listeners
    initializeEventListeners() {
        document.getElementById('addUrlBtn').addEventListener('click', () => this.addUrl());
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addUrl();
        });
        document.getElementById('checkAllBtn').addEventListener('click', () => this.checkAllUrls());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllUrls());
        document.getElementById('loadLogsBtn').addEventListener('click', () => this.loadLogs());
    }

    // URL Management
    addUrl() {
        const urlInput = document.getElementById('urlInput');
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Check if URL already exists
        if (this.urls.some(item => item.url === url)) {
            alert('URL already exists');
            return;
        }

        // Add new URL
        const urlItem = {
            id: Date.now(),
            url: url,
            status: null,
            lastChecked: null,
            details: null
        };

        this.urls.push(urlItem);
        this.saveUrls();
        this.renderUrls();
        urlInput.value = '';
    }

    removeUrl(id) {
        if (confirm('Are you sure you want to remove this URL?')) {
            this.urls = this.urls.filter(url => url.id !== id);
            this.saveUrls();
            this.renderUrls();
        }
    }

    clearAllUrls() {
        if (confirm('Are you sure you want to clear all URLs?')) {
            this.urls = [];
            this.saveUrls();
            this.renderUrls();
        }
    }

    // SSL Checking
    async checkAllUrls() {
        if (this.isChecking || this.urls.length === 0) return;

        this.isChecking = true;
        this.showProgressBar();
        this.updateCheckAllButton(true);

        const total = this.urls.length;
        let completed = 0;

        for (let i = 0; i < this.urls.length; i++) {
            const urlItem = this.urls[i];
            
            // Update progress
            this.updateProgress(completed, total);
            
            try {
                // Add visual feedback
                this.setUrlChecking(urlItem.id, true);
                
                const result = await this.checkSingleUrl(urlItem.url);
                
                // Update URL data
                urlItem.status = result.status;
                urlItem.lastChecked = new Date().toISOString();
                urlItem.details = result;
                
                this.setUrlChecking(urlItem.id, false);
                this.renderSingleUrl(urlItem);
                
            } catch (error) {
                urlItem.status = 'error';
                urlItem.lastChecked = new Date().toISOString();
                urlItem.details = { error: error.message };
                
                this.setUrlChecking(urlItem.id, false);
                this.renderSingleUrl(urlItem);
            }

            completed++;
            
            // Add 1 second delay between checks (except for the last one)
            if (i < this.urls.length - 1) {
                await this.delay(1000);
            }
        }

        this.updateProgress(total, total);
        this.saveUrls();
        
        // Hide progress bar after a short delay
        setTimeout(() => {
            this.hideProgressBar();
            this.updateCheckAllButton(false);
            this.isChecking = false;
        }, 1000);
    }

    async checkSingleUrl(url) {
        const response = await fetch('/api/check-ssl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            throw new Error('Failed to check SSL certificate');
        }

        return await response.json();
    }

    // UI Updates
    renderUrls() {
        const urlsList = document.getElementById('urlsList');
        
        if (this.urls.length === 0) {
            urlsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-link"></i>
                    <p>No URLs added yet. Add your first URL above to get started!</p>
                </div>
            `;
            this.updateUrlCount();
            return;
        }

        urlsList.innerHTML = this.urls.map(urlItem => this.generateUrlHtml(urlItem)).join('');
        this.updateUrlCount();
    }

    renderSingleUrl(urlItem) {
        const urlElement = document.querySelector(`[data-url-id="${urlItem.id}"]`);
        if (urlElement) {
            urlElement.outerHTML = this.generateUrlHtml(urlItem);
        }
    }

    generateUrlHtml(urlItem) {
        const statusClass = urlItem.status || '';
        const isChecking = urlItem.checking || false;
        
        let statusText = 'Not checked';
        let detailsHtml = '';

        if (isChecking) {
            statusText = '<span class="spinner"></span> Checking...';
        } else if (urlItem.details) {
            if (urlItem.details.error) {
                statusText = `Error: ${urlItem.details.error}`;
            } else if (urlItem.details.checked) {
                const days = urlItem.details.daysRemaining;
                const expDate = new Date(urlItem.details.validTo).toLocaleDateString();
                
                if (days < 0) {
                    statusText = `Expired ${Math.abs(days)} days ago`;
                } else if (days === 0) {
                    statusText = 'Expires today';
                } else if (days === 1) {
                    statusText = 'Expires in 1 day';
                } else {
                    statusText = `Expires in ${days} days`;
                }

                detailsHtml = `
                    <div class="url-details">
                        Expires: ${expDate} | Issuer: ${urlItem.details.issuer || 'Unknown'} | 
                        Last checked: ${new Date(urlItem.lastChecked).toLocaleString()}
                    </div>
                `;
            }
        }

        return `
            <div class="url-item ${statusClass} ${isChecking ? 'checking' : ''}" data-url-id="${urlItem.id}">
                <div class="url-info">
                    <div class="url-name">${urlItem.url}</div>
                    <div class="url-status">${statusText}</div>
                    ${detailsHtml}
                </div>
                <div class="url-actions">
                    <button class="btn btn-success btn-small" onclick="sslChecker.openDnsCheck('${urlItem.url}')" title="Check DNS ACME Challenge">
                        <i class="fas fa-globe"></i> DNS
                    </button>
                    <button class="btn btn-info btn-small" onclick="sslChecker.checkSingleUrlManual(${urlItem.id})">
                        <i class="fas fa-sync-alt"></i> Check
                    </button>
                    <button class="btn btn-danger btn-small" onclick="sslChecker.removeUrl(${urlItem.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }

    async checkSingleUrlManual(id) {
        const urlItem = this.urls.find(u => u.id === id);
        if (!urlItem || this.isChecking) return;

        try {
            this.setUrlChecking(id, true);
            
            const result = await this.checkSingleUrl(urlItem.url);
            
            urlItem.status = result.status;
            urlItem.lastChecked = new Date().toISOString();
            urlItem.details = result;
            
            this.setUrlChecking(id, false);
            this.renderSingleUrl(urlItem);
            this.saveUrls();
            
        } catch (error) {
            urlItem.status = 'error';
            urlItem.lastChecked = new Date().toISOString();
            urlItem.details = { error: error.message };
            
            this.setUrlChecking(id, false);
            this.renderSingleUrl(urlItem);
            this.saveUrls();
        }
    }

    setUrlChecking(id, isChecking) {
        const urlItem = this.urls.find(u => u.id === id);
        if (urlItem) {
            urlItem.checking = isChecking;
            this.renderSingleUrl(urlItem);
        }
    }

    updateUrlCount() {
        document.getElementById('urlCount').textContent = this.urls.length;
    }

    updateCheckAllButton(isChecking) {
        const btn = document.getElementById('checkAllBtn');
        if (isChecking) {
            btn.innerHTML = '<span class="spinner"></span> Checking...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Check All SSL Certificates';
            btn.disabled = false;
        }
    }

    // Progress Bar
    showProgressBar() {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.display = 'block';
    }

    hideProgressBar() {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.display = 'none';
    }

    updateProgress(current, total) {
        const progressFill = document.querySelector('.progress-fill');
        const progressCount = document.getElementById('progressCount');
        const progressTotal = document.getElementById('progressTotal');
        
        const percentage = (current / total) * 100;
        progressFill.style.width = percentage + '%';
        progressCount.textContent = current;
        progressTotal.textContent = total;
    }

    // Logging
    setTodayAsDefaultLogDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('logDate').value = today;
    }

    async loadLogs() {
        const date = document.getElementById('logDate').value;
        if (!date) return;

        try {
            const response = await fetch(`/api/logs/${date}`);
            const data = await response.json();
            
            this.renderLogs(data.logs, data.message);
        } catch (error) {
            console.error('Failed to load logs:', error);
            this.renderLogs([], 'Failed to load logs');
        }
    }

    renderLogs(logs, message) {
        const logsContainer = document.getElementById('logsContainer');
        
        if (logs.length === 0) {
            logsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>${message || 'No logs found for this date'}</p>
                </div>
            `;
            return;
        }

        logsContainer.innerHTML = logs.map(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            const isError = log.error || (log.result && log.result.error);
            const statusClass = isError ? 'log-error' : 'log-success';
            
            let content = `<span class="log-timestamp">[${timestamp}]</span> ${log.url}`;
            
            if (isError) {
                content += ` - ERROR: ${log.error || log.result.error}`;
            } else if (log.result && log.result.checked) {
                const days = log.result.daysRemaining;
                content += ` - ${days} days remaining (${log.result.status})`;
            }
            
            return `<div class="log-entry ${statusClass}">${content}</div>`;
        }).join('');
    }

    // DNS Checking
    openDnsCheck(url) {
        // Extract the domain from the URL
        let domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        
        // Remove www. prefix if present
        domain = domain.replace(/^www\./, '');
        
        // Construct the DNS check URL for ACME challenge
        const dnsCheckUrl = `https://www.whatsmydns.net/#TXT/_acme-challenge.${domain}`;
        
        // Open in new tab
        window.open(dnsCheckUrl, '_blank');
    }

    // Utilities
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
const sslChecker = new SSLChecker();
