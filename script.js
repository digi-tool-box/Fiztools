// PDF Tools Play - Main JavaScript File
// Updated for individual tool pages

// Global Variables
let imageFiles = [];
let pdfFiles = [];
let currentPdf = null;
let pageImages = [];
let currentScale = 0.5;
let currentLayout = 'grid';
let currentQuality = 2;

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

// Initialize the application based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Set up PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }
    
    // Initialize based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('image-to-pdf.html') || currentPage === '/' || currentPage.endsWith('index.html')) {
        initializeImageToPDF();
    } else if (currentPage.includes('pdf-merger.html')) {
        initializePDFMerger();
    } else if (currentPage.includes('all-in-one.html')) {
        initializeAllInOne();
    }
    
    // Initialize common elements
    initializeCommonElements();
    
    console.log('PDF Tools Play initialized successfully');
});

// Initialize common elements across all pages
function initializeCommonElements() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const nav = document.querySelector('.nav');
            nav.classList.toggle('show');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
            document.querySelector('.nav')?.classList.remove('show');
        }
    });
    
    // Update range values if they exist on the page
    updateRangeValues();
    
    // Initialize dropdowns
    initializeDropdowns();
}

// Initialize dropdown menus
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown > a');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = dropdown.parentElement;
                parent.classList.toggle('active');
            }
        });
    });
}

// Initialize Image to PDF page
function initializeImageToPDF() {
    console.log('Initializing Image to PDF');
    
    // DOM Elements
    const imageInput = document.getElementById('image-input');
    const convertBtn = document.getElementById('convert-btn');
    const clearImagesBtn = document.getElementById('clear-images-btn');
    const imageUploadArea = document.getElementById('image-upload-area');
    
    // Event Listeners
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    if (convertBtn) {
        convertBtn.addEventListener('click', convertImagesToPDF);
    }
    
    if (clearImagesBtn) {
        clearImagesBtn.addEventListener('click', clearAllImages);
    }
    
    // Initialize drag and drop
    if (imageUploadArea) {
        setupDragAndDrop(imageUploadArea, 'image');
    }
    
    // Initialize range value displays
    const marginSlider = document.getElementById('margin');
    const qualitySlider = document.getElementById('image-quality');
    
    if (marginSlider) {
        marginSlider.addEventListener('input', () => {
            updateRangeValue('margin-value', marginSlider.value + ' mm');
        });
    }
    
    if (qualitySlider) {
        qualitySlider.addEventListener('input', () => {
            updateRangeValue('quality-value', qualitySlider.value + '%');
        });
    }
}

// Initialize PDF Merger page
function initializePDFMerger() {
    console.log('Initializing PDF Merger');
    
    // DOM Elements
    const pdfInput = document.getElementById('pdf-input');
    const mergeBtn = document.getElementById('merge-btn');
    const clearPdfsBtn = document.getElementById('clear-pdfs-btn');
    const pdfUploadArea = document.getElementById('pdf-upload-area');
    
    // Event Listeners
    if (pdfInput) {
        pdfInput.addEventListener('change', handlePDFUpload);
    }
    
    if (mergeBtn) {
        mergeBtn.addEventListener('click', mergePDFs);
    }
    
    if (clearPdfsBtn) {
        clearPdfsBtn.addEventListener('click', clearAllPDFs);
    }
    
    // Initialize drag and drop
    if (pdfUploadArea) {
        setupDragAndDrop(pdfUploadArea, 'pdf');
    }
}

// Initialize All in One page
function initializeAllInOne() {
    console.log('Initializing All in One');
    
    // DOM Elements
    const allInOneInput = document.getElementById('allinone-input');
    const scaleSlider = document.getElementById('scaleSlider');
    const qualitySlider = document.getElementById('qualitySlider');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const resetAllInOneBtn = document.getElementById('resetAllInOneBtn');
    const gridLayoutBtn = document.getElementById('gridLayoutBtn');
    const horizontalLayoutBtn = document.getElementById('horizontalLayoutBtn');
    const verticalLayoutBtn = document.getElementById('verticalLayoutBtn');
    const allInOneUploadArea = document.getElementById('allinone-upload-area');
    
    // Event Listeners
    if (allInOneInput) {
        allInOneInput.addEventListener('change', handleAllInOneUpload);
    }
    
    if (scaleSlider) {
        scaleSlider.addEventListener('input', handleAllInOneScaleChange);
    }
    
    if (qualitySlider) {
        qualitySlider.addEventListener('input', handleAllInOneQualityChange);
    }
    
    if (downloadPngBtn) {
        downloadPngBtn.addEventListener('click', downloadAllInOneAsPng);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadAllInOneAsPdf);
    }
    
    if (resetAllInOneBtn) {
        resetAllInOneBtn.addEventListener('click', resetAllInOneViewer);
    }
    
    if (gridLayoutBtn) {
        gridLayoutBtn.addEventListener('click', () => setAllInOneLayout('grid'));
    }
    
    if (horizontalLayoutBtn) {
        horizontalLayoutBtn.addEventListener('click', () => setAllInOneLayout('horizontal'));
    }
    
    if (verticalLayoutBtn) {
        verticalLayoutBtn.addEventListener('click', () => setAllInOneLayout('vertical'));
    }
    
    // Initialize drag and drop
    if (allInOneUploadArea) {
        setupDragAndDrop(allInOneUploadArea, 'allinone');
    }
}

// Setup drag and drop for an area
function setupDragAndDrop(area, type) {
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.style.borderColor = '#4361ee';
        area.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
    });
    
    area.addEventListener('dragleave', () => {
        area.style.borderColor = '';
        area.style.backgroundColor = '';
    });
    
    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.borderColor = '';
        area.style.backgroundColor = '';
        
        const files = Array.from(e.dataTransfer.files);
        
        switch(type) {
            case 'image':
                handleImageFiles(files);
                break;
            case 'pdf':
                handlePDFFiles(files, 'merge');
                break;
            case 'allinone':
                handleAllInOneFiles(files.slice(0, 1));
                break;
        }
    });
}

// Update range value displays
function updateRangeValues() {
    updateRangeValue('margin-value', document.getElementById('margin')?.value + ' mm' || '10 mm');
    updateRangeValue('quality-value', document.getElementById('image-quality')?.value + '%' || '90%');
    updateRangeValue('scaleValue', document.getElementById('scaleSlider')?.value + '%' || '50%');
    
    const qualitySlider = document.getElementById('qualitySlider');
    if (qualitySlider) {
        const qualityLabels = ['Low', 'High', 'Maximum'];
        updateRangeValue('qualityValue', qualityLabels[qualitySlider.value - 1]);
    }
}

function updateRangeValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Toast notification system
function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = toastId;
    toast.innerHTML = `
        <i class="fas ${iconMap[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeToast(toastId);
    }, 5000);
}

// Remove toast notification
function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Add CSS for slideOut animation if not already added
if (!document.querySelector('#slideOutStyle')) {
    const style = document.createElement('style');
    style.id = 'slideOutStyle';
    style.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ========== IMAGE TO PDF FUNCTIONS ==========

// Handle image file upload
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    handleImageFiles(files);
}

// Process image files
function handleImageFiles(files) {
    const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        
        if (!isValidType) {
            showToast('Invalid File', `${file.name} is not a supported image format.`, 'warning');
            return false;
        }
        
        if (!isValidSize) {
            showToast('File Too Large', `${file.name} exceeds 10MB limit.`, 'warning');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Check total image count
    if (imageFiles.length + validFiles.length > 20) {
        showToast('Limit Exceeded', 'Maximum 20 images allowed.', 'warning');
        validFiles.splice(20 - imageFiles.length);
    }
    
    // Add new images to the array
    imageFiles.push(...validFiles);
    
    // Update UI
    updateImageList();
    document.getElementById('image-preview-section').style.display = 'block';
    document.getElementById('convert-btn').disabled = imageFiles.length === 0;
    
    // Reset file input
    document.getElementById('image-input').value = '';
    
    showToast('Success', `Added ${validFiles.length} image(s).`, 'success');
}

// Update image list UI
function updateImageList() {
    const imageList = document.getElementById('image-list');
    if (!imageList) return;
    
    imageList.innerHTML = '';
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.setAttribute('data-index', index);
            imageItem.draggable = true;
            
            imageItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="image-preview">
                <div class="image-info">
                    <div class="image-name" title="${file.name}">${file.name}</div>
                    <div class="image-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="image-remove" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            imageList.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    });
    
    // Initialize Sortable for reordering
    if (imageFiles.length > 1 && typeof Sortable !== 'undefined') {
        new Sortable(imageList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function(evt) {
                // Reorder the imageFiles array
                const movedItem = imageFiles.splice(evt.oldIndex, 1)[0];
                imageFiles.splice(evt.newIndex, 0, movedItem);
                updateImageList();
            }
        });
    }
}

// Remove single image
function removeImage(index) {
    imageFiles.splice(index, 1);
    updateImageList();
    
    if (imageFiles.length === 0) {
        document.getElementById('image-preview-section').style.display = 'none';
        document.getElementById('convert-btn').disabled = true;
    }
}

// Clear all images
function clearAllImages() {
    imageFiles = [];
    document.getElementById('image-preview-section').style.display = 'none';
    document.getElementById('convert-btn').disabled = true;
    updateImageList();
    showToast('Cleared', 'All images removed.', 'info');
}

// Convert images to PDF
async function convertImagesToPDF() {
    if (imageFiles.length === 0) {
        showToast('No Images', 'Please upload images first.', 'warning');
        return;
    }
    
    const loadingElement = document.getElementById('image-loading');
    const convertBtn = document.getElementById('convert-btn');
    
    if (!loadingElement || !convertBtn) return;
    
    // Show loading state
    loadingElement.style.display = 'flex';
    convertBtn.disabled = true;
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: document.getElementById('orientation').value,
            unit: 'mm',
            format: document.getElementById('page-size').value === 'Fit' ? undefined : document.getElementById('page-size').value.toLowerCase()
        });
        
        const margin = parseInt(document.getElementById('margin').value);
        const quality = parseInt(document.getElementById('image-quality').value) / 100;
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            
            // Add new page for all images except the first
            if (i > 0) {
                pdf.addPage();
            }
            
            // Create image from file
            const img = await loadImage(file);
            
            // Calculate dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            let imgWidth, imgHeight;
            
            if (document.getElementById('page-size').value === 'Fit') {
                // Fit to page with margins
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                imgWidth = img.width * ratio;
                imgHeight = img.height * ratio;
            } else {
                // Scale to fit within page with margins
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                imgWidth = img.width * ratio;
                imgHeight = img.height * ratio;
            }
            
            // Center image on page
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            
            // Add image to PDF
            pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
            
            // Update loading message
            loadingElement.querySelector('span').textContent = `Processing image ${i + 1} of ${imageFiles.length}...`;
        }
        
        // Download the PDF
        pdf.save(`converted-images-${Date.now()}.pdf`);
        
        showToast('Success', 'PDF created and downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        showToast('Error', 'Failed to create PDF. Please try again.', 'error');
    } finally {
        // Hide loading state
        loadingElement.style.display = 'none';
        convertBtn.disabled = false;
    }
}

// Load image from file
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========== PDF MERGER FUNCTIONS ==========

// Handle PDF file upload for merging
function handlePDFUpload(e) {
    const files = Array.from(e.target.files);
    handlePDFFiles(files, 'merge');
}

// Process PDF files
async function handlePDFFiles(files, action) {
    const validFiles = files.filter(file => {
        const isValidType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
        
        if (!isValidType) {
            showToast('Invalid File', `${file.name} is not a PDF file.`, 'warning');
            return false;
        }
        
        if (!isValidSize) {
            showToast('File Too Large', `${file.name} exceeds 50MB limit.`, 'warning');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length === 0) return;
    
    if (action === 'merge') {
        // Check total PDF count for merger
        if (pdfFiles.length + validFiles.length > 10) {
            showToast('Limit Exceeded', 'Maximum 10 PDFs allowed for merging.', 'warning');
            validFiles.splice(10 - pdfFiles.length);
        }
        
        // Add new PDFs to the array
        pdfFiles.push(...validFiles);
        
        // Update UI
        updatePDFList();
        document.getElementById('pdf-preview-section').style.display = 'block';
        document.getElementById('merge-btn').disabled = pdfFiles.length === 0;
        
        // Calculate total pages
        await calculateTotalPages();
        
        // Reset file input
        document.getElementById('pdf-input').value = '';
        
        showToast('Success', `Added ${validFiles.length} PDF(s).`, 'success');
    }
}

// Update PDF list UI for merger
function updatePDFList() {
    const pdfList = document.getElementById('pdf-list');
    if (!pdfList) return;
    
    pdfList.innerHTML = '';
    
    pdfFiles.forEach((file, index) => {
        const pdfItem = document.createElement('div');
        pdfItem.className = 'pdf-item';
        pdfItem.setAttribute('data-index', index);
        pdfItem.draggable = true;
        
        pdfItem.innerHTML = `
            <div class="pdf-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="pdf-info">
                <div class="pdf-name" title="${file.name}">${file.name}</div>
                <div class="pdf-details">
                    <span>${formatFileSize(file.size)}</span>
                    <span>Pages: <span class="page-count" id="page-count-${index}">Loading...</span></span>
                </div>
            </div>
            <button class="pdf-remove" onclick="removePDF(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        pdfList.appendChild(pdfItem);
    });
    
    // Initialize Sortable for reordering
    if (pdfFiles.length > 1 && typeof Sortable !== 'undefined') {
        new Sortable(pdfList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function(evt) {
                // Reorder the pdfFiles array
                const movedItem = pdfFiles.splice(evt.oldIndex, 1)[0];
                pdfFiles.splice(evt.newIndex, 0, movedItem);
                updatePDFList();
                calculateTotalPages();
            }
        });
    }
}

// Calculate total pages for all PDFs
async function calculateTotalPages() {
    let totalPages = 0;
    
    for (let i = 0; i < pdfFiles.length; i++) {
        try {
            const arrayBuffer = await pdfFiles[i].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pageCount = pdf.numPages;
            
            totalPages += pageCount;
            
            // Update individual page count
            const pageCountElement = document.getElementById(`page-count-${i}`);
            if (pageCountElement) {
                pageCountElement.textContent = pageCount;
            }
        } catch (error) {
            console.error(`Error loading PDF ${pdfFiles[i].name}:`, error);
            const pageCountElement = document.getElementById(`page-count-${i}`);
            if (pageCountElement) {
                pageCountElement.textContent = 'Error';
            }
        }
    }
    
    // Update total pages display
    const totalPagesElement = document.getElementById('total-pages');
    if (totalPagesElement) {
        totalPagesElement.textContent = totalPages;
    }
}

// Remove single PDF
function removePDF(index) {
    pdfFiles.splice(index, 1);
    updatePDFList();
    
    if (pdfFiles.length === 0) {
        document.getElementById('pdf-preview-section').style.display = 'none';
        document.getElementById('merge-btn').disabled = true;
        document.getElementById('total-pages').textContent = '0';
    } else {
        calculateTotalPages();
    }
}

// Clear all PDFs
function clearAllPDFs() {
    pdfFiles = [];
    document.getElementById('pdf-preview-section').style.display = 'none';
    document.getElementById('merge-btn').disabled = true;
    document.getElementById('total-pages').textContent = '0';
    updatePDFList();
    showToast('Cleared', 'All PDFs removed.', 'info');
}

// Merge PDFs
async function mergePDFs() {
    if (pdfFiles.length === 0) {
        showToast('No PDFs', 'Please upload PDFs first.', 'warning');
        return;
    }
    
    if (pdfFiles.length === 1) {
        showToast('Info', 'Only one PDF selected. Downloading original.', 'info');
        downloadFile(pdfFiles[0], `merged-${Date.now()}.pdf`);
        return;
    }
    
    const loadingElement = document.getElementById('merge-loading');
    const mergeBtn = document.getElementById('merge-btn');
    
    if (!loadingElement || !mergeBtn) return;
    
    // Show loading state
    loadingElement.style.display = 'flex';
    mergeBtn.disabled = true;
    
    try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < pdfFiles.length; i++) {
            const file = pdfFiles[i];
            loadingElement.querySelector('span').textContent = `Merging PDF ${i + 1} of ${pdfFiles.length}...`;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        // Save merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        
        // Download the merged PDF
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merged-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Success', 'PDFs merged and downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        showToast('Error', 'Failed to merge PDFs. Please try again.', 'error');
    } finally {
        // Hide loading state
        loadingElement.style.display = 'none';
        mergeBtn.disabled = false;
    }
}

// ========== ALL IN ONE PAGE FUNCTIONS ==========

// Handle All in One PDF upload
function handleAllInOneUpload(e) {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        handleAllInOneFiles([file]);
    } else {
        showToast('Invalid File', 'Please select a valid PDF file.', 'warning');
    }
}

// Process All in One PDF files
async function handleAllInOneFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check file size
    if (file.size > 50 * 1024 * 1024) {
        showToast('File Too Large', 'PDF file exceeds 50MB limit.', 'warning');
        return;
    }
    
    try {
        // Show loading state
        const loadingElement = document.getElementById('allinone-loading');
        const progressElement = document.getElementById('allinone-progress');
        const uploadArea = document.getElementById('allinone-upload-area');
        
        if (!loadingElement || !progressElement || !uploadArea) return;
        
        loadingElement.style.display = 'block';
        progressElement.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Read the file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF
        currentPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // Update UI with file info
        document.getElementById('allinone-filename').textContent = file.name;
        document.getElementById('allinone-pagecount').textContent = `${currentPdf.numPages} page${currentPdf.numPages !== 1 ? 's' : ''}`;
        
        // Reset scale and quality
        currentScale = 0.5;
        document.getElementById('scaleSlider').value = 50;
        document.getElementById('scaleValue').textContent = '50%';
        
        // Render all pages and create combined image
        await renderAllPagesAllInOne();
        await createCombinedCanvasAllInOne();
        
        // Show the preview and actions
        document.getElementById('allinone-preview').style.display = 'block';
        document.getElementById('allinone-actions').style.display = 'flex';
        loadingElement.style.display = 'none';
        progressElement.style.display = 'none';
        
        showToast('Success', `PDF processed successfully: ${currentPdf.numPages} pages`, 'success');
    } catch (error) {
        console.error('Error processing PDF for All in One:', error);
        showToast('Error', 'Error loading PDF. Please try another file.', 'error');
        resetAllInOneViewer();
    }
}

// Handle All in One scale change
function handleAllInOneScaleChange() {
    currentScale = parseInt(document.getElementById('scaleSlider').value) / 100;
    document.getElementById('scaleValue').textContent = `${document.getElementById('scaleSlider').value}%`;
    
    if (currentPdf) {
        rerenderCombinedCanvasAllInOne();
    }
}

// Handle All in One quality change
function handleAllInOneQualityChange() {
    currentQuality = parseInt(document.getElementById('qualitySlider').value);
    const qualityLabels = ['Low', 'High', 'Maximum'];
    document.getElementById('qualityValue').textContent = qualityLabels[currentQuality - 1];
    
    if (currentPdf) {
        rerenderCombinedCanvasAllInOne();
    }
}

// Set All in One layout
function setAllInOneLayout(layout) {
    currentLayout = layout;
    
    // Update active button
    document.getElementById('gridLayoutBtn').classList.toggle('active', layout === 'grid');
    document.getElementById('horizontalLayoutBtn').classList.toggle('active', layout === 'horizontal');
    document.getElementById('verticalLayoutBtn').classList.toggle('active', layout === 'vertical');
    
    // Re-render if we have a PDF
    if (currentPdf) {
        rerenderCombinedCanvasAllInOne();
    }
}

// Render all pages for All in One
async function renderAllPagesAllInOne() {
    // Clear previous page images
    pageImages = [];
    
    // Calculate quality multiplier
    const qualityMultiplier = currentQuality === 1 ? 1 : currentQuality === 2 ? 1.5 : 2;
    
    // Render pages sequentially
    for (let i = 1; i <= currentPdf.numPages; i++) {
        try {
            // Update progress
            const progress = (i / currentPdf.numPages) * 100;
            document.getElementById('allinone-progress-bar').style.width = `${progress}%`;
            
            // Get the page
            const page = await currentPdf.getPage(i);
            
            // Set up canvas for rendering with quality multiplier
            const viewport = page.getViewport({ scale: currentScale * qualityMultiplier });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });
            
            // Set higher resolution for better quality
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render the page
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Store the image data
            pageImages.push({
                canvas: canvas,
                width: canvas.width,
                height: canvas.height,
                pageNum: i
            });
        } catch (error) {
            console.error(`Error rendering page ${i}:`, error);
        }
    }
}

// Create combined canvas for All in One
async function createCombinedCanvasAllInOne() {
    if (pageImages.length === 0) return;
    
    const combinedCanvas = document.getElementById('combinedCanvas');
    const ctx = combinedCanvas.getContext('2d');
    
    // Calculate dimensions based on layout
    let canvasWidth, canvasHeight;
    let positions = [];
    
    if (currentLayout === 'grid') {
        // Grid layout: arrange in rows and columns
        const cols = Math.ceil(Math.sqrt(pageImages.length));
        const rows = Math.ceil(pageImages.length / cols);
        
        // Find max width and height for grid cells
        let maxWidth = 0;
        let maxHeight = 0;
        
        pageImages.forEach(img => {
            maxWidth = Math.max(maxWidth, img.width);
            maxHeight = Math.max(maxHeight, img.height);
        });
        
        // Add some padding
        const padding = 20;
        const cellWidth = maxWidth + padding;
        const cellHeight = maxHeight + padding;
        
        canvasWidth = cols * cellWidth + padding;
        canvasHeight = rows * cellHeight + padding;
        
        // Calculate positions for each image
        pageImages.forEach((img, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = col * cellWidth + padding;
            const y = row * cellHeight + padding;
            
            positions.push({ x, y });
        });
    } else if (currentLayout === 'horizontal') {
        // Horizontal layout: all images in one row
        let totalWidth = 0;
        let maxHeight = 0;
        
        pageImages.forEach(img => {
            totalWidth += img.width;
            maxHeight = Math.max(maxHeight, img.height);
        });
        
        // Add padding between images and around edges
        const padding = 20;
        canvasWidth = totalWidth + (pageImages.length + 1) * padding;
        canvasHeight = maxHeight + 2 * padding;
        
        // Calculate positions for each image
        let currentX = padding;
        pageImages.forEach(img => {
            positions.push({ 
                x: currentX, 
                y: padding 
            });
            currentX += img.width + padding;
        });
    } else if (currentLayout === 'vertical') {
        // Vertical layout: all images in one column
        let maxWidth = 0;
        let totalHeight = 0;
        
        pageImages.forEach(img => {
            maxWidth = Math.max(maxWidth, img.width);
            totalHeight += img.height;
        });
        
        // Add padding between images and around edges
        const padding = 20;
        canvasWidth = maxWidth + 2 * padding;
        canvasHeight = totalHeight + (pageImages.length + 1) * padding;
        
        // Calculate positions for each image
        let currentY = padding;
        pageImages.forEach(img => {
            positions.push({ 
                x: padding, 
                y: currentY 
            });
            currentY += img.height + padding;
        });
    }
    
    // Set canvas dimensions
    combinedCanvas.width = canvasWidth;
    combinedCanvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw all page images
    pageImages.forEach((img, index) => {
        const pos = positions[index];
        ctx.drawImage(img.canvas, pos.x, pos.y);
    });
}

// Re-render the combined canvas for All in One
async function rerenderCombinedCanvasAllInOne() {
    if (!currentPdf) return;
    
    const loadingElement = document.getElementById('allinone-loading');
    const previewElement = document.getElementById('allinone-preview');
    
    if (!loadingElement || !previewElement) return;
    
    loadingElement.style.display = 'block';
    previewElement.style.display = 'none';
    
    // Re-render all pages with new scale
    await renderAllPagesAllInOne();
    await createCombinedCanvasAllInOne();
    
    loadingElement.style.display = 'none';
    previewElement.style.display = 'block';
}

// Download All in One as PNG
function downloadAllInOneAsPng() {
    if (!currentPdf) return;
    
    try {
        const combinedCanvas = document.getElementById('combinedCanvas');
        
        // Create download link
        const link = document.createElement('a');
        const filename = document.getElementById('allinone-filename').textContent.replace('.pdf', '') + '-collage.png';
        link.download = filename;
        link.href = combinedCanvas.toDataURL('image/png', 1.0); // Maximum quality
        link.click();
        
        showToast('Success', 'PNG downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading PNG:', error);
        showToast('Error', 'Error downloading PNG. Please try again.', 'error');
    }
}

// Download All in One as PDF
function downloadAllInOneAsPdf() {
    if (!currentPdf) return;
    
    try {
        const combinedCanvas = document.getElementById('combinedCanvas');
        
        // Use html2canvas to capture the canvas as an image
        html2canvas(combinedCanvas, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Create PDF with jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            
            const filename = document.getElementById('allinone-filename').textContent.replace('.pdf', '') + '-collage.pdf';
            pdf.save(filename);
            
            showToast('Success', 'PDF downloaded successfully!', 'success');
        });
    } catch (error) {
        console.error('Error downloading PDF:', error);
        showToast('Error', 'Error downloading PDF. Please try again.', 'error');
    }
}

// Reset All in One viewer
function resetAllInOneViewer() {
    currentPdf = null;
    pageImages = [];
    document.getElementById('allinone-input').value = '';
    document.getElementById('allinone-preview').style.display = 'none';
    document.getElementById('allinone-actions').style.display = 'none';
    document.getElementById('allinone-upload-area').style.display = 'block';
    document.getElementById('allinone-loading').style.display = 'none';
    document.getElementById('allinone-progress').style.display = 'none';
    document.getElementById('allinone-progress-bar').style.width = '0%';
}

// ========== UTILITY FUNCTIONS ==========

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download file helper
function downloadFile(file, filename) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}