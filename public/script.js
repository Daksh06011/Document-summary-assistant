// DOM Elements
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const browseFilesBtn = document.getElementById('browseFilesBtn');
const processBtn = document.getElementById('processBtn');
const summaryLength = document.getElementById('summaryLength');
const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const extractedText = document.getElementById('extractedText');
const generatedSummary = document.getElementById('generatedSummary');
const newDocumentBtn = document.getElementById('newDocumentBtn');

// State
let selectedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupDragAndDrop();
});

// Event Listeners
function setupEventListeners() {
    browseFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    processBtn.addEventListener('click', processDocument);
    newDocumentBtn.addEventListener('click', resetApp);
    summaryLength.addEventListener('change', updateProcessButton);
}

// Drag and Drop Setup
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0];
        updateDropArea();
        updateProcessButton();
    }
}

function updateDropArea() {
    const dropContent = dropArea.querySelector('.drop-content');
    dropContent.innerHTML = `
        <div class="upload-icon">📄</div>
        <h3>${selectedFile.name}</h3>
        <p>${formatFileSize(selectedFile.size)}</p>
        <button id="removeFileBtn" class="remove-file-btn">Remove File</button>
    `;

    document.getElementById('removeFileBtn').addEventListener('click', removeFile);
}

function removeFile() {
    selectedFile = null;
    resetDropArea();
    updateProcessButton();
}

function resetDropArea() {
    const dropContent = dropArea.querySelector('.drop-content');
    dropContent.innerHTML = `
        <div class="upload-icon">📁</div>
        <h3>Drag & Drop your file here</h3>
        <p>or</p>
        <button id="browseFilesBtn" class="file-input-label" type="button">
            Browse Files
        </button>
        <input
            type="file"
            id="fileInput"
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.gif"
            hidden
        />
    `;
    document.getElementById('browseFilesBtn').addEventListener('click', () => fileInput.click());
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

function updateProcessButton() {
    processBtn.disabled = !selectedFile;
    processBtn.textContent = selectedFile ? 'Process Document' : 'Select a file first';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Process Document
async function processDocument() {
    if (!selectedFile) return;

    showLoading();
    animateProgress();

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('summaryLength', summaryLength.value);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error processing document:', error);
        showError('Failed to process document. Please try again.');
    } finally {
        hideLoading();
    }
}

function animateProgress() {
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;

        progressBar.style.width = progress + '%';

        if (progress < 30) {
            loadingText.textContent = 'Uploading document...';
        } else if (progress < 60) {
            loadingText.textContent = 'Extracting text...';
        } else if (progress < 90) {
            loadingText.textContent = 'Generating summary...';
        }

        if (progress >= 90) {
            clearInterval(interval);
            loadingText.textContent = 'Finalizing...';
        }
    }, 500);
}

function showLoading() {
    resultsSection.style.display = 'block';
    loading.style.display = 'block';
    results.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    results.style.display = 'block';
}

function displayResults(data) {
    extractedText.textContent = data.extractedText || 'No text extracted';
    generatedSummary.textContent = data.summary || 'No summary generated';

    // Add copy buttons
    addCopyButton(extractedText, 'Copy Text');
    addCopyButton(generatedSummary, 'Copy Summary');

    // Add download button
    addDownloadButton(data.summary);
}

function addCopyButton(container, buttonText) {
    const copyBtn = document.createElement('button');
    copyBtn.textContent = buttonText;
    copyBtn.className = 'copy-btn';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(container.textContent).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = buttonText, 2000);
        });
    });
    container.parentNode.insertBefore(copyBtn, container.nextSibling);
}

function addDownloadButton(summary) {
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Summary';
    downloadBtn.className = 'download-btn';
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'summary.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    generatedSummary.parentNode.appendChild(downloadBtn);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    resultsSection.insertBefore(errorDiv, resultsSection.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function resetApp() {
    selectedFile = null;
    resetDropArea();
    updateProcessButton();
    resultsSection.style.display = 'none';
    extractedText.textContent = '';
    generatedSummary.textContent = '';

    // Remove copy and download buttons
    document.querySelectorAll('.copy-btn, .download-btn').forEach(btn => btn.remove());
}
