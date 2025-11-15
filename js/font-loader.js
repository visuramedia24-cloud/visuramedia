/**
 * CSS Font Loading API Implementation
 * Prevents layout shift by controlling font loading and applying fonts only when ready
 * Uses the FontFace API for precise control over font loading behavior
 */

(function() {
    'use strict';

    // Check if Font Loading API is supported
    if (!('fonts' in document)) {
        console.warn('Font Loading API not supported, falling back to CSS font-display');
        return;
    }

    // Critical fonts for hero section (load immediately)
    const criticalFonts = [
        {
            family: 'Playfair Display',
            weight: '900',
            url: 'assets/fonts/playfair-900-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Inter',
            weight: '400',
            url: 'assets/fonts/inter-400-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Inter',
            weight: '600',
            url: 'assets/fonts/inter-600-latin.woff2',
            format: 'woff2'
        }
    ];

    // Non-critical fonts (load after critical fonts)
    const nonCriticalFonts = [
        {
            family: 'Inter',
            weight: '300',
            url: 'assets/fonts/inter-300-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Inter',
            weight: '500',
            url: 'assets/fonts/inter-500-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Inter',
            weight: '700',
            url: 'assets/fonts/inter-700-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Playfair Display',
            weight: '400',
            url: 'assets/fonts/playfair-400-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Playfair Display',
            weight: '700',
            url: 'assets/fonts/playfair-700-latin.woff2',
            format: 'woff2'
        },
        {
            family: 'Playfair Display',
            weight: '800',
            url: 'assets/fonts/playfair-800-latin.woff2',
            format: 'woff2'
        }
    ];

    /**
     * Load a single font using the Font Loading API
     * @param {Object} fontConfig - Font configuration object
     * @returns {Promise<FontFace>}
     */
    function loadFont(fontConfig) {
        const fontFace = new FontFace(
            fontConfig.family,
            `url(${fontConfig.url}) format('${fontConfig.format}')`,
            {
                weight: fontConfig.weight,
                style: 'normal',
                display: 'swap'
            }
        );

        return fontFace.load().then(function(loadedFont) {
            document.fonts.add(loadedFont);
            return loadedFont;
        });
    }

    /**
     * Load multiple fonts in parallel
     * @param {Array} fonts - Array of font configuration objects
     * @returns {Promise<Array>}
     */
    function loadFonts(fonts) {
        return Promise.all(fonts.map(loadFont));
    }

    /**
     * Add a class to document when fonts are loaded
     * This allows CSS to apply font-dependent styles only when ready
     */
    function markFontsLoaded(fontType) {
        document.documentElement.classList.add(`fonts-${fontType}-loaded`);
    }

    /**
     * Initialize font loading
     */
    function initFontLoading() {
        // Add initial class to indicate fonts are loading
        document.documentElement.classList.add('fonts-loading');

        // Load critical fonts first (for hero section)
        loadFonts(criticalFonts)
            .then(function() {
                markFontsLoaded('critical');
                console.log('✓ Critical fonts loaded (Playfair 900, Inter 400, Inter 600)');
                
                // Remove loading class
                document.documentElement.classList.remove('fonts-loading');
                
                // Load non-critical fonts after critical ones
                return loadFonts(nonCriticalFonts);
            })
            .then(function() {
                markFontsLoaded('all');
                console.log('✓ All fonts loaded successfully');
            })
            .catch(function(error) {
                console.error('Font loading error:', error);
                document.documentElement.classList.add('fonts-failed');
                document.documentElement.classList.remove('fonts-loading');
            });
    }

    // Start loading fonts when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFontLoading);
    } else {
        initFontLoading();
    }

    // Expose font loading status for debugging
    window.fontLoadingStatus = {
        isCriticalLoaded: function() {
            return document.documentElement.classList.contains('fonts-critical-loaded');
        },
        isAllLoaded: function() {
            return document.documentElement.classList.contains('fonts-all-loaded');
        },
        hasFailed: function() {
            return document.documentElement.classList.contains('fonts-failed');
        }
    };

})();
