/**
 * Creates and manages a resizable split view between sidebar and preview
 * @param {Object} options - Configuration options
 * @param {string} options.sidebarSelector - CSS selector for the sidebar element
 * @param {string} options.previewSelector - CSS selector for the preview element
 * @param {number} options.initialSplitPercentage - Initial split position (percentage)
 * @param {number} options.minSidebarWidth - Minimum sidebar width in percentage
 * @param {number} options.maxSidebarWidth - Maximum sidebar width in percentage
 */
export function initSplitView(options = {}) {
    const {
        sidebarSelector = '#sidebar',
        previewSelector = '#preview',
        initialSplitPercentage = 25,
        minSidebarWidth = 15,
        maxSidebarWidth = 50
    } = options;

    const sidebar = document.querySelector(sidebarSelector);
    const preview = document.querySelector(previewSelector);
    
    // Create divider element
    const divider = document.createElement('div');
    divider.id = 'divider';
    divider.className = 'divider';
    document.body.appendChild(divider);
    
    // Set initial positions
    updateSplitPosition(initialSplitPercentage);
    
    // Variables for tracking drag state
    let isDragging = false;
    let startX, startSidebarWidth;

    // Handle divider dragging
    divider.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startSidebarWidth = sidebar.offsetWidth;
        document.body.classList.add('resizing');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = startSidebarWidth + deltaX;
        const containerWidth = document.body.clientWidth;
        
        // Calculate sidebar width as percentage
        let sidebarPercentage = (newWidth / containerWidth) * 100;
        
        // Apply constraints
        sidebarPercentage = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, sidebarPercentage));
        
        updateSplitPosition(sidebarPercentage);
        
        // Prevent text selection during drag
        e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.classList.remove('resizing');
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const currentPercentage = (sidebar.offsetWidth / document.body.clientWidth) * 100;
        updateSplitPosition(currentPercentage);
    });

    /**
     * Updates the position of the sidebar, divider, and preview
     * @param {number} sidebarWidthPercentage - Width of sidebar as percentage
     */
    function updateSplitPosition(sidebarWidthPercentage) {
        // Update sidebar width
        sidebar.style.width = `${sidebarWidthPercentage}%`;
        
        // Update divider position
        divider.style.left = `${sidebarWidthPercentage}%`;
        
        // Update preview position and width
        preview.style.left = `calc(${sidebarWidthPercentage}% + 6px)`;
        preview.style.width = `calc(${100 - sidebarWidthPercentage}% - 6px)`;
    }

    // Return methods to control the split view
    return {
        setSplitPosition: updateSplitPosition,
        getSplitPosition: () => (sidebar.offsetWidth / document.body.clientWidth) * 100
    };
}