/* ==============================================
   CRITICAL CLS FIX - JavaScript Loading Timing
   REPLACE: DOMContentLoaded handler in js/main.js
   ============================================== */

// FIND THIS CODE (around line 700 in main.js):
/*
document.addEventListener('DOMContentLoaded', function() {
    
    cacheDOM();
    cacheLayoutCalculations();
    initLayoutRecalculation();
    lazyLoadHeroBackground();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('loading');
        });
    });

    setTimeout(() => {
        initScrollAnimations();
    }, 50);
    // ... rest of code
});
*/

// REPLACE WITH THIS OPTIMIZED VERSION:

document.addEventListener('DOMContentLoaded', function() {
    
    // Cache DOM elements first
    cacheDOM();
    cacheLayoutCalculations();
    initLayoutRecalculation();

    // CRITICAL: Wait for fonts before removing loading class
    const criticalFontsLoaded = Promise.all([
        // Load critical fonts used in hero
        document.fonts.load('700 1em "Playfair Display"'),
        document.fonts.load('900 1em "Playfair Display"'),
        document.fonts.load('700 1em Inter'),
        document.fonts.load('400 1em Inter')
    ]).catch((error) => {
        console.warn('Font loading timeout - proceeding anyway', error);
        // Return resolved promise to continue
        return Promise.resolve();
    });

    // Add timeout fallback (max 3 seconds wait for fonts)
    const fontLoadTimeout = new Promise(resolve => {
        setTimeout(() => {
            console.warn('Font loading timeout reached');
            resolve();
        }, 3000);
    });

    // Race between font loading and timeout
    Promise.race([criticalFontsLoaded, fontLoadTimeout]).then(() => {
        // Wait for next frame to ensure layout is stable
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // NOW safe to remove loading class
                document.documentElement.classList.remove('loading');
                console.log('✅ Loading class removed - fonts ready');
                
                // Initialize scroll animations after fonts settle
                setTimeout(() => {
                    initScrollAnimations();
                }, 50);
            });
        });
    });

    // Lazy load hero background for optimal TTI
    lazyLoadHeroBackground();
    
    // Core features (independent of loading class)
    initCounters();
    initFAQ();
    initProcessSteps();
    
    // Navigation
    initFloatingNav();
    initLuxuryNavigation();
    initSmoothScrolling();
    initNavigationHighlight();
    
    // Form handling
    initForms();
    
    // Lazy load third-party scripts
    initLazyAnimeJS();
    initLazyEmailJS();
    
    // Conditional features
    initConditionalFeatures();
    
    // Component animations
    initComponentCircleAnimation();
    
    // Page transitions
    initPageTransitions();
});

/* ==============================================
   ADDITIONAL: Enhanced font loading detection
   ============================================== */

// Add this function BEFORE DOMContentLoaded
function checkFontLoadingStatus() {
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            console.log('✅ All fonts loaded successfully');
            document.documentElement.classList.add('fonts-loaded');
        }).catch((error) => {
            console.error('❌ Font loading failed:', error);
            document.documentElement.classList.add('fonts-failed');
        });
    } else {
        console.warn('⚠️ Font Loading API not supported');
        document.documentElement.classList.add('fonts-failed');
    }
}

// Call immediately
checkFontLoadingStatus();

/* ==============================================
   USAGE INSTRUCTIONS
   ============================================== */

// 1. Find the DOMContentLoaded event listener in js/main.js (around line 700)
// 2. Replace the ENTIRE handler function with the code above
// 3. Make sure to keep all the existing init functions (they're all listed)
// 4. Test thoroughly after applying
