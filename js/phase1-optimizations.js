// ====================================
// PHASE 1 OPTIMIZATIONS
// Add these to your main.js file
// ====================================

// ====================================
// 1. LAZY LOAD ANIME.JS (Below-the-fold only)
// ====================================
let animeLoaded = false;

function loadAnimeJS() {
  return new Promise((resolve) => {
    if (window.anime) {
      animeLoaded = true;
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    script.onload = () => {
      animeLoaded = true;
      console.log('✅ Anime.js loaded lazily');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Anime.js');
      resolve(); // Resolve anyway to not block
    };
    document.head.appendChild(script);
  });
}

// Trigger Anime.js load when user scrolls past hero
function initLazyAnimeJS() {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;
  
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && !animeLoaded) {
        loadAnimeJS().then(() => {
          // Initialize complex animations that need Anime.js
          initComplexAnimations();
        });
        heroObserver.disconnect();
      }
    });
  }, { threshold: 0 });
  
  heroObserver.observe(heroSection);
}

function initComplexAnimations() {
  if (!window.anime) return;
  
  // Add your complex Anime.js animations here
  // Example: Timeline animations for sections below the fold
  console.log('🎬 Complex animations initialized');
}

// ====================================
// 2. LAZY LOAD EMAILJS (On form interaction)
// ====================================
let emailJSLoaded = false;

function loadEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) {
      emailJSLoaded = true;
      return resolve();
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      // Initialize EmailJS
      if (window.emailjs) {
        emailjs.init('vWZ-BeU-BTyPN2wWq');
        emailJSLoaded = true;
        console.log('✅ EmailJS loaded and initialized');
      }
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Failed to load EmailJS');
      resolve();
    };
    document.head.appendChild(script);
  });
}

function initLazyEmailJS() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  // Load EmailJS on first interaction with form
  const loadOnInteraction = () => {
    if (!emailJSLoaded) {
      console.log('📧 Loading EmailJS...');
      loadEmailJS();
    }
  };
  
  // Listen for any form interaction
  contactForm.addEventListener('focusin', loadOnInteraction, { once: true, capture: true });
  contactForm.addEventListener('mouseenter', loadOnInteraction, { once: true });
}

// ====================================
// 3. SMART CUSTOM CURSOR (Device detection)
// ====================================
function initCustomCursor() {
    // Detect device capabilities
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Enable custom cursor if:
    // 1. Device has hover capability (desktop/laptop)
    // 2. Has fine pointer control (mouse/trackpad)
    // 3. Touch is NOT the primary input
    // 4. Not a mobile device
    const shouldEnableCursor = hasHover && hasPointer && !isTouchPrimary && !isMobile;
    
    if (!shouldEnableCursor) {
        console.log('🖱️ Custom cursor disabled: Touch/mobile device detected');
        return;
    }
    
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    if (!cursor || !cursorDot) return;
    
    console.log('🖱️ Custom cursor enabled');
    
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    
    // Detect if tablet for simplified animation
    const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
    
    if (isTablet) {
        // Simplified cursor for tablets (less CPU intensive)
        const mousemoveHandler = (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        };
        registerEventHandler(document, 'mousemove', mousemoveHandler);
    } else {
        // Full smooth animation for desktop
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.3;
            cursorY += (mouseY - cursorY) * 0.3;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        const mousemoveHandler = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        registerEventHandler(document, 'mousemove', mousemoveHandler);
    }
    
    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn-primary, .faq-question, .luxury-nav-link');
    interactiveElements.forEach(el => {
        const hoverEnter = () => cursor.classList.add('hover');
        const hoverLeave = () => cursor.classList.remove('hover');
        registerEventHandler(el, 'mouseenter', hoverEnter);
        registerEventHandler(el, 'mouseleave', hoverLeave);
    });
}

// ====================================
// 4. FLOATING NAV - INTERSECTION OBSERVER (Hero observation approach)
// ====================================
function initFloatingNav() {
    if (!cachedElements.luxuryNav) return;
    
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Check for Intersection Observer support
    if ('IntersectionObserver' in window) {
        // Modern approach - observe hero section directly
        const observer = new IntersectionObserver(([entry]) => {
            // When hero is out of view, show scrolled nav
            if (!entry.isIntersecting) {
                cachedElements.luxuryNav.classList.add('scrolled');
            } else {
                cachedElements.luxuryNav.classList.remove('scrolled');
            }
        }, { 
            threshold: 0,
            rootMargin: '-100px 0px 0px 0px' // Trigger 100px before hero leaves viewport
        });
        
        observer.observe(heroSection);
        registerObserver(observer);
        
        console.log('🔍 Floating nav using Intersection Observer');
        
    } else {
        // Fallback for old browsers (IE11, etc.)
        console.warn('⚠️ IntersectionObserver not supported, using scroll fallback');
        
        let lastScrollTop = 0;
        const scrollHandler = throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                cachedElements.luxuryNav.classList.add('scrolled');
            } else {
                cachedElements.luxuryNav.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        }, 100);
        
        registerEventHandler(window, 'scroll', scrollHandler, { passive: true });
    }
}

// ====================================
// 5. NAVIGATION HIGHLIGHT - INTERSECTION OBSERVER
// ====================================
function initNavigationHighlight() {
    if (cachedElements.sections.length === 0 || cachedElements.navLinks.length === 0) return;
    
    if (!('IntersectionObserver' in window)) {
        console.warn('⚠️ IntersectionObserver not supported for nav highlight');
        return;
    }
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -66% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Update active nav link
                cachedElements.navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    cachedElements.sections.forEach(section => observer.observe(section));
    registerObserver(observer);
    
    console.log('🔍 Navigation highlight using Intersection Observer');
}

// ====================================
// 6. CONDITIONAL FEATURE LOADING
// ====================================
function initConditionalFeatures() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    console.log(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'}, Touch: ${isTouch}`);
    
    // Desktop-only features
    if (!isMobile && !isTouch) {
        initCustomCursor();
        initParallax();
        initEnhancedInteractions();
        initResultCards();
        
        // Lazy load background effects
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && typeof window.initBackgroundEffects === 'function') {
                    window.initBackgroundEffects();
                    observer.disconnect();
                }
            });
        }, { rootMargin: '200px' });
        
        const testimonialSection = document.querySelector('.testimonials-section');
        if (testimonialSection) {
            observer.observe(testimonialSection);
        }
    }
}

// ====================================
// UPDATED INITIALIZATION
// ====================================
// Replace your DOMContentLoaded event with this:
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Phase 1 Optimizations Active');
    
    // Cache DOM elements
    cacheDOM();
    cacheLayoutCalculations();
    initLayoutRecalculation();

    // PRIORITY: Lazy load hero background for optimal TTI
    lazyLoadHeroBackground();

    // Core features (always load)
    initScrollAnimations();
    initCounters();
    initFAQ();
    initProcessSteps();
    
    // Navigation with Intersection Observer
    initFloatingNav();
    initLuxuryNavigation();
    initSmoothScrolling();
    initNavigationHighlight();
    
    // Form handling
    initForms();
    
    // Lazy load third-party scripts
    initLazyAnimeJS();
    initLazyEmailJS();
    
    // Conditional features based on device
    initConditionalFeatures();
    
    // Component animations
    initComponentCircleAnimation();
    
    // Page transitions
    initPageTransitions();
    
    console.log('✅ Initialization complete');
});

// ====================================
// REMOVE FROM window.addEventListener('load')
// ====================================
// DELETE these lines from your existing main.js (around line 652-656):
/*
window.addEventListener('load', () => {
    if (window.anime) {
        window.anime.timeline()
            .add({ targets: '.hero-bg .container > *', ... })
            .add({ targets: '.hero-bg .grid > *', ... });
    }
});
*/
// Hero animations now handled by CSS in tailwind-input.css
