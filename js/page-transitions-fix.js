// SIMPLIFIED PAGE TRANSITIONS FIX
// This file temporarily disables page transitions to ensure links work

(function() {
    // Disable the problematic page transitions
    window.initPageTransitions = function() {
        console.log('✅ Page transitions temporarily disabled - links should work now');
        
        // Clean up any stuck overlays
        const removeStuckOverlay = () => {
            const overlay = document.querySelector('[style*="z-index: 9999"]');
            if (overlay) {
                overlay.remove();
                console.log('Removed stuck overlay');
            }
        };
        
        window.addEventListener('pageshow', removeStuckOverlay);
        removeStuckOverlay(); // Clean on load
        
        // Allow all links to work normally without transitions
        console.log('All .html links will now work without page transitions');
    };
    
    console.log('Page transitions fix loaded');
})();
