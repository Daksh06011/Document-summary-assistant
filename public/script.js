class DocumentSummaryApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.selectedFile = null;
    }

    initializeElements() {
        this.dropArea = document.getElementById('dropArea');
        this.fileInput = document.getElementById('fileInput');
        this.processBtn = document.getElementById('processBtn');
        this.summaryLength = document.getElementById('summaryLength');
        this.resultsSection = document.getElementById('resultsSection');
        this.loading = document.getElementById('loading');
        this.results = document.getElementById('results');
        this.extractedText = document.getElementById('extractedText');
        this.generatedSummary = document.getElementById('generatedSummary');
        this.newDocumentBtn = document.getElementById('newDocumentBtn');
    }

    setupEventListeners() {
        // Drag and drop events
        this.dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropArea.classList.add('dragover');
        });

        this.dropArea.addEventListener('dragleave', () => {
            this.dropArea.classList.remove('dragover');
        });

        this.dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Click on browse files button to trigger file input
        const browseFilesBtn = document.getElementById('browseFilesBtn');
        if (this.browseFilesClickHandler) {
            browseFilesBtn.removeEventListener('click', this.browseFilesClickHandler);
        }
        this.browseFilesClickHandler = function(event) {
            event.stopPropagation();
            this.fileInput.click();
        }.bind(this);
        browseFilesBtn.addEventListener('click', this.browseFilesClickHandler);

        // Process button
        this.processBtn.addEventListener('click', () => {
            this.processDocument();
        });

        // New document button
        this.newDocumentBtn.addEventListener('click', () => {
            this.resetUI();
        });
    }

    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
            this.showError('Invalid file type. Please upload a PDF or image file.');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File too large. Maximum size is 10MB.');
            return;
        }

        this.selectedFile = file;
        this.updateDropArea(file.name);
        this.processBtn.disabled = false;
    }

    updateDropArea(fileName) {
        this.dropArea.innerHTML = `
            <div class="drop-content">
                <div class="upload-icon">✅</div>
                <h3>File Selected</h3>
                <p>${fileName}</p>
                <p><small>Click to choose a different file</small></p>
            </div>
        `;
        
        // Remove any existing click event listener before adding a new one
        if (this.dropAreaClickHandler) {
            this.dropArea.removeEventListener('click', this.dropAreaClickHandler);
        }
        this.dropAreaClickHandler = function(event) {
            event.stopPropagation();
            this.fileInput.click();
        }.bind(this);
        this.dropArea.addEventListener('click', this.dropAreaClickHandler);
    }

    async processDocument() {
        if (!this.selectedFile) return;

        this.showLoading();
        
        const formData = new FormData();
        formData.append('document', this.selectedFile);
        formData.append('summaryLength', this.summaryLength.value);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showResults(data);
            } else {
                this.showError(data.error || 'Failed to process document');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    showLoading() {
        this.resultsSection.style.display = 'block';
        this.loading.style.display = 'block';
        this.results.style.display = 'none';
        this.processBtn.disabled = true;
    }

    showResults(data) {
        this.loading.style.display = 'none';
        this.results.style.display = 'block';
        
        // Display extracted text
        this.extractedText.textContent = data.extractedText || 'No text could be extracted.';
        
        // Display summary
        this.generatedSummary.textContent = data.summary || 'No summary could be generated.';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        alert('Error: ' + message);
        this.resetUI();
    }

    resetUI() {
        this.selectedFile = null;
        this.processBtn.disabled = true;
        this.resultsSection.style.display = 'none';
        
        // Reset drop area
        this.dropArea.innerHTML = `
            <div class="drop-content">
                <div class="upload-icon">📁</div>
                <h3>Drag & Drop your file here</h3>
                <p>or</p>
                <button id="browseFilesBtn" class="file-input-label" type="button">
                    Browse Files
                </button>
            </div>
        `;
        
        // Re-add event listeners
        const browseFilesBtn = document.getElementById('browseFilesBtn');
        if (this.browseFilesClickHandler) {
            browseFilesBtn.removeEventListener('click', this.browseFilesClickHandler);
        }
        this.browseFilesClickHandler = function(event) {
            event.stopPropagation();
            this.fileInput.click();
        }.bind(this);
        browseFilesBtn.addEventListener('click', this.browseFilesClickHandler);
        
        // Reset file input
        this.fileInput.value = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentSummaryApp();
});

// Add some utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
