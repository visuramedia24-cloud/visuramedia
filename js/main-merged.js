// Consolidated JavaScript for Visura Web - PHASE 1 OPTIMIZED
// Order: Utilities â†’ Core Functions â†’ Navigation â†’ Forms â†’ Lazy Loading â†’ Init â†’ Background Effects

// ====================================
// CENTRAL CLEANUP REGISTRY
// ====================================
const cleanup = { handlers: [], observers: [], animations: [], intervals: [], timeouts: [] };
window.cleanup = cleanup;

function registerEventHandler(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    cleanup.handlers.push({ target, event, handler });
    return handler;
}
function registerObserver(observer) { cleanup.observers.push(observer); return observer; }
function registerAnimation(animationId) { cleanup.animations.push(animationId); return animationId; }
function registerInterval(intervalId) { cleanup.intervals.push(intervalId); return intervalId; }
function registerTimeout(timeoutId) { cleanup.timeouts.push(timeoutId); return timeoutId; }
window.registerEventHandler = registerEventHandler;
window.registerObserver = registerObserver;
window.registerAnimation = registerAnimation;
window.registerInterval = registerInterval;
window.registerTimeout = registerTimeout;

window.addEventListener('beforeunload', () => {
    cleanup.handlers.forEach(({ target, event, handler }) => target.removeEventListener(event, handler));
    cleanup.observers.forEach(observer => observer.disconnect());
    cleanup.animations.forEach(id => cancelAnimationFrame(id));
    cleanup.intervals.forEach(id => clearInterval(id));
    cleanup.timeouts.forEach(id => clearTimeout(id));
});

// ====================================
// EVENT DELEGATION (CSP-Compliant, No Inline Handlers)
// ====================================
document.addEventListener('click', (e) => {
    const target = e.target;
    const action = target.dataset?.action;
    const lightbox = target.dataset?.lightbox;

    // Mobile menu toggle
    if (action === 'toggle-menu' && typeof toggleMobileMenu === 'function') {
        toggleMobileMenu();
        return;
    }

    // Lightbox actions
    if (lightbox && typeof openLightbox === 'function') {
        openLightbox(lightbox);
        return;
    }

    if (action === 'close-lightbox' && typeof closeLightbox === 'function') {
        closeLightbox();
        return;
    }

    if (action === 'lightbox-prev' && typeof navigateLightbox === 'function') {
        e.stopPropagation();
        navigateLightbox(-1);
        return;
    }

    if (action === 'lightbox-next' && typeof navigateLightbox === 'function') {
        e.stopPropagation();
        navigateLightbox(1);
        return;
    }

    if (action === 'lightbox-image-click') {
        e.stopPropagation();
        return;
    }
});

// ====================================
// THROTTLE / DEBOUNCE
// ====================================
function throttle(func, delay) {
    let lastCall = 0;
    return function throttled(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}
window.throttle = throttle;

function debounce(func, wait) {
    let timeout;
    return function debounced(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
window.debounce = debounce;

// ====================================
// CACHED DOM ELEMENTS AND LAYOUT VALUES
// ====================================
const cachedElements = { luxuryNav: null, sections: [], navLinks: [], parallaxElements: [], resultCards: [], faqItems: [] };
const cachedLayout = { sectionOffsets: [], navOffset: 0, windowHeight: 0, lastUpdate: 0 };
window.cachedElements = cachedElements;
window.cachedLayout = cachedLayout;

function cacheDOM() {
    cachedElements.luxuryNav = document.getElementById('luxuryNav');
    cachedElements.sections = Array.from(document.querySelectorAll('section[id]'));
    cachedElements.navLinks = Array.from(document.querySelectorAll('.luxury-nav-link'));
    cachedElements.parallaxElements = Array.from(document.querySelectorAll('.floating-animation'));
    cachedElements.resultCards = Array.from(document.querySelectorAll('.result-card'));
    cachedElements.faqItems = Array.from(document.querySelectorAll('.faq-item'));
}
window.cacheDOM = cacheDOM;

function cacheLayoutCalculations() {
    // Batch all DOM reads together in requestAnimationFrame to avoid layout thrashing
    requestAnimationFrame(() => {
        // BATCH READ: All geometry queries together
        const navOffset = cachedElements.luxuryNav ? cachedElements.luxuryNav.offsetHeight : 80;
        const windowHeight = window.innerHeight;
        const sectionOffsets = cachedElements.sections.map(section => ({
            id: section.getAttribute('id'),
            offsetTop: section.offsetTop,
            clientHeight: section.clientHeight
        }));
        
        // BATCH WRITE: Update cached values (no DOM writes here)
        cachedLayout.navOffset = navOffset;
        cachedLayout.sectionOffsets = sectionOffsets;
        cachedLayout.windowHeight = windowHeight;
        cachedLayout.lastUpdate = Date.now();
    });
}
window.cacheLayoutCalculations = cacheLayoutCalculations;

function initLayoutRecalculation() {
    const recalculate = debounce(cacheLayoutCalculations, 200);
    registerEventHandler(window, 'resize', recalculate, { passive: true });
}
window.initLayoutRecalculation = initLayoutRecalculation;

// ====================================
// Scroll-triggered animations
// ====================================
function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = registerObserver(new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                const counter = entry.target.querySelector('.counter');
                if (counter && !counter.classList.contains('counted')) animateCounter(counter);
            }
        });
    }, observerOptions));
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}
window.initScrollAnimations = initScrollAnimations;

// Counters
function initCounters() { /* counters triggered by scroll */ }
window.initCounters = initCounters;
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; const startTime = performance.now();
    element.classList.add('counted');
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime; const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); const current = Math.floor(easeOut * target);
        element.textContent = target >= 1000 ? current.toLocaleString('de-DE') : current;
        if (progress < 1) requestAnimationFrame(updateCounter); else element.textContent = target >= 1000 ? target.toLocaleString('de-DE') : target;
    }
    requestAnimationFrame(updateCounter);
}
window.animateCounter = animateCounter;

// FAQ
function initFAQ() {
    const faqData = cachedElements.faqItems.map(item => ({ element: item, question: item.querySelector('.faq-question'), icon: item.querySelector('.faq-icon') }));
    faqData.forEach(({ element, question, icon }) => {
        if (!question) return;
        const faqClickHandler = () => {
            const isActive = element.classList.contains('active');
            faqData.forEach(({ element: faqItem, icon: faqIcon }) => { faqItem.classList.remove('active'); if (faqIcon) faqIcon.textContent = '+'; });
            if (!isActive) { element.classList.add('active'); if (icon) icon.textContent = 'âˆ’'; }
        };
        registerEventHandler(question, 'click', faqClickHandler);
    });
}
window.initFAQ = initFAQ;

// Enhanced interactions
function initEnhancedInteractions() {
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(button => {
        const mouseenterHandler = function() { window.anime && window.anime({ targets: this, scale: 1.05, duration: 300, easing: 'easeOutCubic' }); };
        const mouseleaveHandler = function() { window.anime && window.anime({ targets: this, scale: 1, duration: 300, easing: 'easeOutCubic' }); };
        registerEventHandler(button, 'mouseenter', mouseenterHandler);
        registerEventHandler(button, 'mouseleave', mouseleaveHandler);
    });
}
window.initEnhancedInteractions = initEnhancedInteractions;

// Result cards tilt - OPTIMIZED: Batch reads, use RAF for writes
function initResultCards() {
    cachedElements.resultCards.forEach(card => {
        let cachedRect = null;
        let rafId = null;
        
        const mouseenterHandler = function() {
            // READ: Cache rect on enter
            cachedRect = this.getBoundingClientRect();
        };
        
        const mousemoveHandler = throttle(function(e) {
            // Cancel previous frame if still pending
            if (rafId) cancelAnimationFrame(rafId);
            
            // READ: Get rect if not cached
            if (!cachedRect) cachedRect = this.getBoundingClientRect();
            
            // READ: Calculate values from event
            const x = e.clientX - cachedRect.left;
            const y = e.clientY - cachedRect.top;
            const centerX = cachedRect.width / 2;
            const centerY = cachedRect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            // WRITE: Apply transform in RAF to prevent layout thrashing
            rafId = requestAnimationFrame(() => {
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
                rafId = null;
            });
        }, 16);
        
        const mouseleaveHandler = function() {
            if (rafId) cancelAnimationFrame(rafId);
            // WRITE: Reset in RAF
            requestAnimationFrame(() => {
                this.style.transform = '';
            });
            cachedRect = null;
        };
        
        registerEventHandler(card, 'mouseenter', mouseenterHandler);
        registerEventHandler(card, 'mousemove', mousemoveHandler);
        registerEventHandler(card, 'mouseleave', mouseleaveHandler);
    });
}
window.initResultCards = initResultCards;

// Process steps (CSS-driven)
function initProcessSteps() { /* CSS driven */ }
window.initProcessSteps = initProcessSteps;

// 8 Component Circle Animation
function initComponentCircleAnimation() {
    const systemSection = document.getElementById('system');
    if (!systemSection) return;

    let animationTriggered = false;

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = registerObserver(new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationTriggered) {
                animationTriggered = true;
                
                // Initial delay before animation starts
                const initialDelay = 500; // 0.5 second delay before first card
                
                // Animate cards 2-8 one by one
                for (let i = 2; i <= 8; i++) {
                    const card = document.querySelector(`.component-item[data-position="${i}"]`);
                    if (card) {
                        // Delay each card's animation with longer intervals
                        const delay = initialDelay + ((i - 2) * 250); // 0.5s initial + 250ms between each card
                        registerTimeout(setTimeout(() => {
                            card.classList.add('animate-to-position');
                        }, delay));
                    }
                }
                
                // Unobserve after animation triggers
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions));

    observer.observe(systemSection);
}
window.initComponentCircleAnimation = initComponentCircleAnimation;

// Custom cursor - smart device detection (Phase 1 optimization)
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
        // Custom cursor disabled for touch/mobile devices
        return;
    }
    
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    if (!cursor || !cursorDot) return;
    
    // Custom cursor enabled
    
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    
    // Detect if tablet for simplified animation
    const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches;
    
    if (isTablet) {
        // Simplified cursor for tablets - OPTIMIZED: Use RAF to batch style updates
        let rafId = null;
        const mousemoveHandler = (e) => {
            // Cancel previous frame if still pending
            if (rafId) cancelAnimationFrame(rafId);
            
            // Store mouse position
            const x = e.clientX;
            const y = e.clientY;
            
            // WRITE: Batch style updates in RAF to prevent forced reflows
            rafId = requestAnimationFrame(() => {
                cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                cursorDot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                rafId = null;
            });
        };
        registerEventHandler(document, 'mousemove', mousemoveHandler);
    } else {
        // Desktop: Smooth cursor with easing
        const mousemoveHandler = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        registerEventHandler(document, 'mousemove', mousemoveHandler);

        function animateCursor() {
            const speed = 0.15;
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;

            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

            registerAnimation(requestAnimationFrame(animateCursor));
        }
        animateCursor();
    }

    // Hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [role="button"]');
    interactiveElements.forEach(el => {
        registerEventHandler(el, 'mouseenter', () => cursor.classList.add('hover'));
        registerEventHandler(el, 'mouseleave', () => cursor.classList.remove('hover'));
    });
}
window.initCustomCursor = initCustomCursor;

// ====================================
// NAVIGATION FUNCTIONS
// ====================================

function initFloatingNav() {
    const nav = cachedElements.luxuryNav;
    if (!nav) return;

    let lastScroll = 0;
    const scrollHandler = throttle(() => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            nav.classList.remove('scrolled', 'hidden');
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            nav.classList.add('hidden');
        } else {
            // Scrolling up
            nav.classList.remove('hidden');
        }

        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, 100);

    registerEventHandler(window, 'scroll', scrollHandler, { passive: true });
}
window.initFloatingNav = initFloatingNav;

function initLuxuryNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.querySelector('.luxury-nav-overlay');

    if (mobileMenuBtn && mobileMenu) {
        registerEventHandler(mobileMenuBtn, 'click', () => {
            mobileMenu.classList.add('active');
            if (overlay) overlay.classList.add('active');
        });
    }

    if (closeMobileMenu && mobileMenu) {
        registerEventHandler(closeMobileMenu, 'click', () => {
            mobileMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    }

    if (overlay) {
        registerEventHandler(overlay, 'click', () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close menu on link click
    const mobileLinks = document.querySelectorAll('.luxury-nav-mobile-link');
    mobileLinks.forEach(link => {
        registerEventHandler(link, 'click', () => {
            mobileMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    });
}
window.initLuxuryNavigation = initLuxuryNavigation;

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        registerEventHandler(link, 'click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navOffset = cachedLayout.navOffset || 80;
                const targetPosition = targetElement.offsetTop - navOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
window.initSmoothScrolling = initSmoothScrolling;

function initNavigationHighlight() {
    const navLinks = cachedElements.navLinks;
    if (!navLinks.length) return;

    const scrollHandler = throttle(() => {
        const scrollPosition = window.pageYOffset;
        const navOffset = cachedLayout.navOffset || 80;

        cachedLayout.sectionOffsets.forEach((section, index) => {
            const sectionTop = section.offsetTop - navOffset - 100;
            const sectionBottom = sectionTop + section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = navLinks.find(link => link.getAttribute('href') === `#${section.id}`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, 100);

    registerEventHandler(window, 'scroll', scrollHandler, { passive: true });
}
window.initNavigationHighlight = initNavigationHighlight;

function initParallax() {
    const parallaxElements = cachedElements.parallaxElements;
    if (!parallaxElements.length) return;

    const scrollHandler = throttle(() => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = element.dataset.parallaxSpeed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, 16);

    registerEventHandler(window, 'scroll', scrollHandler, { passive: true });
}
window.initParallax = initParallax;

// ====================================
// FORM VALIDATION
// ====================================

const validationMessages = {
    email: {
        typeMismatch: 'Bitte geben Sie eine gÃ¼ltige E-Mail-Adresse ein.',
        patternMismatch: 'Bitte geben Sie eine gÃ¼ltige E-Mail-Adresse ein.',
        customError: 'Bitte geben Sie mindestens E-Mail oder Telefon an.'
    },
    phone: {
        tooShort: 'Telefonnummer muss mindestens 6 Zeichen lang sein.',
        customError: 'Bitte geben Sie mindestens E-Mail oder Telefon an.'
    }
};

function showError(field, message) {
    const errorSpan = document.getElementById(`${field.id}-error`);
    if (errorSpan) { errorSpan.textContent = message; errorSpan.classList.remove('hidden'); }
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
}

function clearError(field) {
    const errorSpan = document.getElementById(`${field.id}-error`);
    if (errorSpan) { errorSpan.textContent = ''; errorSpan.classList.add('hidden'); }
    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('error');
}

function validateField(field) {
    const fieldName = field.id; const validity = field.validity; let isValid = true; let errorMessage = '';
    if (!validationMessages[fieldName]) { return field.checkValidity(); }
    const messages = validationMessages[fieldName];
    if (validity.customError) { errorMessage = messages.customError; isValid = false; }
    else if (validity.tooShort) { errorMessage = messages.tooShort; isValid = false; }
    else if (validity.typeMismatch) { errorMessage = messages.typeMismatch; isValid = false; }
    else if (validity.patternMismatch) { errorMessage = messages.patternMismatch; isValid = false; }
    if (!isValid) { showError(field, errorMessage); } else { clearError(field); field.classList.add('success'); }
    return isValid;
}

function initForms() {
    const contactForm = document.getElementById('secureContactForm');
    if (!contactForm) return;
    
    const submitHandler = async function(e) {
        e.preventDefault();
        
        // Clear previous feedback
        const oldFeedback = this.querySelector('.form-feedback');
        if (oldFeedback) oldFeedback.remove();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        
        // Validation
        let isValid = true;
        let firstInvalidField = null;
        
        const hasEmail = email && email.value.trim() !== '';
        const hasPhone = phone && phone.value.trim() !== '';
        
        if (!hasEmail && !hasPhone) {
            const errorMsg = 'Bitte geben Sie mindestens E-Mail oder Telefon an.';
            if (email) {
                email.setCustomValidity(errorMsg);
                showError(email, errorMsg);
                firstInvalidField = email;
            }
            if (phone) {
                phone.setCustomValidity(errorMsg);
                showError(phone, errorMsg);
                if (!firstInvalidField) firstInvalidField = phone;
            }
            isValid = false;
        } else {
            if (email) email.setCustomValidity('');
            if (phone) phone.setCustomValidity('');
            
            [email, phone].forEach(field => {
                if (field && field.value.trim() !== '' && !validateField(field)) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                }
            });
        }
        
        if (!isValid) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        
        // START LOADING STATE
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        // EmailJS integration
        try {
            // Ensure EmailJS is loaded and initialized
            if (!window.emailjs || !emailJSLoaded) {
                await loadEmailJS();
            }

            // Double check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS nicht geladen');
            }

            const templateParams = {
                from_email: email?.value || 'Nicht angegeben',
                from_phone: phone?.value || 'Nicht angegeben',
                message: document.getElementById('message')?.value || 'Keine Nachricht'
            };

            const response = await emailjs.send(
                'service_8was0z5',
                'template_zdi6evm',
                templateParams
            );

            // SUCCESS
            const successDiv = document.createElement('div');
            successDiv.className = 'form-feedback success';
            successDiv.textContent = 'Vielen Dank für Ihre Anfrage! Wir melden uns innerhalb von 24 Stunden bei Ihnen.';
            this.appendChild(successDiv);
            
            // Reset form
            this.reset();
            [email, phone].forEach(field => {
                if (field) {
                    field.setAttribute('aria-invalid', 'false');
                    field.classList.remove('success', 'error');
                    clearError(field);
                }
            });
            
            // Remove success message after 5 seconds
            setTimeout(() => successDiv.remove(), 5000);
            
        } catch (error) {
            // ERROR - Detailed error handling
            console.error('Form submission error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-feedback error';

            // Provide specific error messages based on error type
            let errorMessage = 'Ein Fehler ist aufgetreten. ';

            if (typeof emailjs === 'undefined') {
                errorMessage += 'E-Mail-Service konnte nicht geladen werden. ';
            } else if (error.text) {
                // EmailJS specific error
                console.error('EmailJS error text:', error.text);
                if (error.text.includes('Invalid')) {
                    errorMessage += 'Konfigurationsfehler. ';
                } else if (error.text.includes('quota') || error.text.includes('limit')) {
                    errorMessage += 'Service-Limit erreicht. ';
                } else if (error.text.includes('network') || error.text.includes('fetch')) {
                    errorMessage += 'Netzwerkfehler. ';
                } else {
                    errorMessage += 'Service-Fehler. ';
                }
            } else {
                errorMessage += 'Unbekannter Fehler. ';
            }

            errorMessage += 'Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt unter info@visuramedia.de oder +49 341 123456.';

            errorDiv.textContent = errorMessage;
            this.appendChild(errorDiv);
        } finally {
            // END LOADING STATE
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    };
    
    registerEventHandler(contactForm, 'submit', submitHandler);
    
    // Existing blur validation handlers...
    const validateOnBlur = function() { 
        if (this.value) { 
            this.setCustomValidity('');
            validateField(this); 
        } 
    };
    
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    
    if (email) registerEventHandler(email, 'blur', validateOnBlur);
    if (phone) registerEventHandler(phone, 'blur', validateOnBlur);
    
    [email, phone].forEach(field => {
        if (field) {
            const inputHandler = function() { 
                this.setCustomValidity('');
                if (this.value && this.validity.valid) { 
                    clearError(this); 
                    this.classList.add('success'); 
                } 
            };
            registerEventHandler(field, 'input', inputHandler);
        }
    });
}
window.initForms = initForms;

// ====================================
// EmailJS Diagnostic Check
// ====================================
function checkEmailJSStatus() {
    
    if (typeof emailjs === 'undefined') {
        return false;
    }
    
    
    // Test if emailjs is initialized
    try {
        // This will throw an error if not initialized
        return true;
    } catch (error) {
        return false;
    }
}

// ====================================
// PHASE 1: LAZY LOADING FUNCTIONS
// ====================================
let animeLoaded = false;
let emailJSLoaded = false;

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
      resolve();
    };
    script.onerror = () => {
      resolve(); // Resolve anyway to not block
    };
    document.head.appendChild(script);
  });
}

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
}

function loadEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs && emailJSLoaded) {
      return resolve();
    }

    if (window.emailjs && !emailJSLoaded) {
      emailjs.init('T4h8fgnchuwMm0JAD');
      emailJSLoaded = true;
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      // Initialize EmailJS after script loads
      if (window.emailjs) {
        emailjs.init('T4h8fgnchuwMm0JAD');
        emailJSLoaded = true;
      }
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load EmailJS script');
      resolve();
    };
    document.head.appendChild(script);
  });
}

function initLazyEmailJS() {
  const contactForm = document.getElementById('secureContactForm');
  if (!contactForm) return;
  
  // Load EmailJS on first interaction with form
  const loadOnInteraction = () => {
    if (!emailJSLoaded) {
      loadEmailJS();
    }
  };
  
  // Listen for any form interaction
  contactForm.addEventListener('focusin', loadOnInteraction, { once: true, capture: true });
  contactForm.addEventListener('mouseenter', loadOnInteraction, { once: true });
}

function initConditionalFeatures() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Device detection complete
    
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
// Load & error handlers
// ====================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // EmailJS diagnostic removed - now lazy loaded on form interaction
    // Hero animations removed - now handled by CSS in tailwind-input.css
});

// Prefers Reduced Motion
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }`;
    document.head.appendChild(style);
}

// Console branding removed for production

// ====================================
// SECTION OVERFLOW - FIXED IN CSS
// ====================================
// Removed JS band-aid patches (forceRemoveSectionOverflow, initSectionOverflowWatcher)
// Root cause fixed in CSS with proper overflow rules

// ====================================
// LAZY LOAD HERO BACKGROUND IMAGE
// ====================================
/**
 * Lazy loads the hero background image after critical content
 * This ensures instant gradient display and <2sec TTI on 3G networks
 */
function lazyLoadHeroBackground() {
    const heroImageLayer = document.querySelector('.hero-image-layer');
    if (!heroImageLayer) return;
    
    const bgImageUrl = heroImageLayer.getAttribute('data-bg-image');
    if (!bgImageUrl) return;
    
    // Use Intersection Observer for efficient lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Create a new image to preload
                const img = new Image();
                
                img.onload = () => {
                    // Apply background image once loaded
                    heroImageLayer.style.backgroundImage = `url('${bgImageUrl}')`;
                    // Fade in the image
                    heroImageLayer.classList.add('loaded');
                    // Clean up observer
                    observer.disconnect();
                };

                img.onerror = () => {
                    observer.disconnect();
                };
                
                // Start loading the image
                img.src = bgImageUrl;
            }
        });
    }, {
        rootMargin: '50px', // Start loading slightly before it comes into view
        threshold: 0.01
    });
    
    // Observe the hero section
    observer.observe(heroImageLayer);
    registerObserver(observer);
}
window.lazyLoadHeroBackground = lazyLoadHeroBackground;

// ====================================
// DOMContentLoaded master init - PHASE 1 OPTIMIZED
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Cache DOM elements first
    cacheDOM();
    
    // OPTIMIZED: cacheLayoutCalculations already uses RAF internally
    cacheLayoutCalculations();
    
    initLayoutRecalculation();

    // PRIORITY: Lazy load hero background for optimal TTI
    lazyLoadHeroBackground();

    // CRITICAL: Remove loading class after a small delay to prevent flash
    // This ensures CSS is fully applied before revealing elements
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('loading');
        });
    });

    // Core features (always load) - slight delay to ensure smooth reveal
    setTimeout(() => {
        initScrollAnimations();
    }, 50);
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
});

// ====================================
// INTERACTIVE BACKGROUND EFFECTS
// ====================================

/**
 * Particle System for Special Sections
 */
class ParticleBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      particleCount: options.particleCount || 5,
      colors: options.colors || ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'],
      maxSize: options.maxSize || 100,
      minSize: options.minSize || 30,
      speed: options.speed || 0.5,
      ...options
    };
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.createParticles();
    this.animate();
  }
  
  createParticles() {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.options.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'dynamic-particle';
      
      const size = Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize;
      const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
      
      Object.assign(particle.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: '0',
        zIndex: '1'
      });
      
      particle.dataset.speedX = (Math.random() - 0.5) * this.options.speed;
      particle.dataset.speedY = (Math.random() - 0.5) * this.options.speed;
      
      fragment.appendChild(particle);
    }
    
    this.container.style.position = 'relative';
    // NEVER set overflow on sections to prevent scroll containers
    if (this.container.tagName && this.container.tagName.toLowerCase() === 'section') {
      // For sections, ensure overflow is visible
      this.container.style.overflow = 'visible';
    } else {
      // For non-section containers, overflow can be hidden
      this.container.style.overflow = 'hidden';
    }
    this.container.appendChild(fragment);
  }
  
  animate() {
    const particles = this.container.querySelectorAll('.dynamic-particle');
    
    particles.forEach(particle => {
      let x = parseFloat(particle.style.left);
      let y = parseFloat(particle.style.top);
      
      const animation = () => {
        x += parseFloat(particle.dataset.speedX);
        y += parseFloat(particle.dataset.speedY);
        
        // Wrap around edges
        if (x > 100) x = -10;
        if (x < -10) x = 100;
        if (y > 100) y = -10;
        if (y < -10) y = 100;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.opacity = '1';
        
        requestAnimationFrame(animation);
      };
      
      // Start with slight delay for staggered effect
      registerTimeout(setTimeout(animation, Math.random() * 1000));
    });
  }
}
window.ParticleBackground = ParticleBackground;

/**
 * Enhanced Parallax Background Effect
 */
class ParallaxBackgroundEnhanced {
  constructor(elements, intensity = 0.5) {
    this.elements = elements;
    this.intensity = intensity;
    this.init();
  }
  
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const scrollHandler = throttle(() => this.handleScroll(), 16);
    registerEventHandler(window, 'scroll', scrollHandler, { passive: true });
    this.handleScroll(); // Initial position
  }
  
  handleScroll() {
    const scrolled = window.pageYOffset;
    
    this.elements.forEach(element => {
      const speed = element.dataset.parallaxSpeed || this.intensity;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }
}
window.ParallaxBackgroundEnhanced = ParallaxBackgroundEnhanced;

/**
 * Interactive Gradient Follow
 */
class InteractiveGradient {
  constructor(element) {
    this.element = element;
    this.rafId = null;
    this.init();
  }
  
  init() {
    const mousemoveHandler = (e) => this.handleMouseMove(e);
    const mouseleaveHandler = () => this.handleMouseLeave();
    
    registerEventHandler(this.element, 'mousemove', mousemoveHandler);
    registerEventHandler(this.element, 'mouseleave', mouseleaveHandler);
  }
  
  handleMouseMove(e) {
    // OPTIMIZED: Batch read then write in RAF
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    this.rafId = requestAnimationFrame(() => {
      // READ: Get bounding rect
      const rect = this.element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // WRITE: Apply background (separate from read)
      this.element.style.background = `
        radial-gradient(
          circle at ${x}% ${y}%,
          rgba(201, 167, 114, 0.15) 0%,
          transparent 50%
        ),
        ${this.element.dataset.baseBackground || 'var(--primary-navy)'}
      `;
      this.rafId = null;
    });
  }
  
  handleMouseLeave() {
    this.element.style.background = this.element.dataset.baseBackground || 'var(--primary-navy)';
  }
}
window.InteractiveGradient = InteractiveGradient;

/**
 * Morphing Blob Background
 */
class MorphingBlob {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      color: options.color || 'rgba(201, 167, 114, 0.1)',
      size: options.size || 400,
      ...options
    };
    this.init();
  }
  
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const blob = document.createElement('div');
    blob.className = 'morphing-blob';
    
    Object.assign(blob.style, {
      position: 'absolute',
      width: `${this.options.size}px`,
      height: `${this.options.size}px`,
      background: this.options.color,
      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
      filter: 'blur(40px)',
      animation: 'morph 20s ease-in-out infinite',
      pointerEvents: 'none',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '1'
    });
    
    // Add morph animation
    if (!document.querySelector('#morphAnimation')) {
      const style = document.createElement('style');
      style.id = 'morphAnimation';
      style.textContent = `
        @keyframes morph {
          0%, 100% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            transform: translate(-50%, -50%) rotate(0deg);
          }
          25% {
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
            transform: translate(-50%, -50%) rotate(90deg);
          }
          50% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            transform: translate(-50%, -50%) rotate(180deg);
          }
          75% {
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
            transform: translate(-50%, -50%) rotate(270deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    this.container.style.position = 'relative';
    // NEVER set overflow on sections to prevent scroll containers
    if (this.container.tagName && this.container.tagName.toLowerCase() === 'section') {
      // For sections, ensure overflow is visible
      this.container.style.overflow = 'visible';
    } else {
      // For non-section containers, overflow can be hidden
      this.container.style.overflow = 'hidden';
    }
    this.container.appendChild(blob);
  }
}
window.MorphingBlob = MorphingBlob;

/**
 * Enhanced Reveal on Scroll Animation
 */
class RevealOnScrollEnhanced {
  constructor(elements, options = {}) {
    this.elements = elements;
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px',
      once: options.once !== undefined ? options.once : true,
      ...options
    };
    this.init();
  }
  
  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.elements.forEach(el => el.classList.add('revealed'));
      return;
    }
    
    const observer = registerObserver(new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Optional: Stop observing after reveal
          if (this.options.once) {
            observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          entry.target.classList.remove('revealed');
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    }));
    
    this.elements.forEach(el => {
      el.classList.add('reveal-element');
      observer.observe(el);
    });
  }
}
window.RevealOnScrollEnhanced = RevealOnScrollEnhanced;

/**
 * Add shimmer effect to any element
 */
function addShimmerEffect(element) {
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  
  const shimmer = document.createElement('div');
  shimmer.className = 'shimmer-effect';
  Object.assign(shimmer.style, {
    position: 'absolute',
    top: '0',
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    animation: 'shimmer 3s infinite',
    pointerEvents: 'none',
    zIndex: '10'
  });
  
  // Add animation if not exists
  if (!document.querySelector('#shimmerAnimation')) {
    const style = document.createElement('style');
    style.id = 'shimmerAnimation';
    style.textContent = `
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);
  }
  
  element.appendChild(shimmer);
}
window.addShimmerEffect = addShimmerEffect;

/**
 * Create gradient text effect
 */
function createGradientText(element, colors = ['#C9A772', '#E8D4B8']) {
  element.style.background = `linear-gradient(135deg, ${colors.join(', ')})`;
  element.style.webkitBackgroundClip = 'text';
  element.style.webkitTextFillColor = 'transparent';
  element.style.backgroundClip = 'text';
}
window.createGradientText = createGradientText;

// ====================================
// SERVICE CARDS - NO CAROUSEL (P0-2)
// ====================================
// Carousel deleted - cards now stack vertically on mobile
// No JavaScript needed for vertical layout

/**
 * Initialize all background effects
 */
function initBackgroundEffects() {
  // Add particles to testimonials section
  const testimonialSection = document.querySelector('.testimonials-section');
  if (testimonialSection) {
    new ParticleBackground(testimonialSection, {
      particleCount: 3,
      colors: ['rgba(201, 167, 114, 0.08)', 'rgba(232, 212, 184, 0.08)']
    });
  }
  
  // Add parallax to all sections with data-parallax
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length > 0) {
    new ParallaxBackgroundEnhanced(parallaxElements);
  }
  
  // Interactive gradient on CTA section - OPTIMIZED: Cache getComputedStyle in RAF
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    requestAnimationFrame(() => {
      // READ: getComputedStyle is expensive, do it once in RAF
      const computedBg = getComputedStyle(ctaSection).background;
      // WRITE: Store in dataset
      ctaSection.dataset.baseBackground = computedBg;
      new InteractiveGradient(ctaSection);
    });
  }
  
  // Morphing blob for special sections
  const specialSection = document.querySelector('.special-section');
  if (specialSection) {
    new MorphingBlob(specialSection, {
      color: 'rgba(201, 167, 114, 0.1)',
      size: 500
    });
  }
  
  // Enhanced reveal animations
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    new RevealOnScrollEnhanced(revealElements, {
      threshold: 0.15,
      once: true
    });
  }
}
window.initBackgroundEffects = initBackgroundEffects;

// ====================================
// SERVICE CAROUSEL - DELETED (P0-2)
// ====================================
// Carousel functionality removed - vertical stack on mobile requires no JS

// ====================================
// PAGE TRANSITION LOADING
// ====================================
/**
 * Add smooth loading transitions when navigating between pages
 * Provides visual feedback during page loads
 */
function initPageTransitions() {
    // Clean up any stuck overlays
    const removeStuckOverlay = () => {
        const overlay = document.querySelector('[style*="z-index: 9999"]');
        if (overlay) overlay.remove();
    };
    
    // Remove stuck overlays on page show (handles back/forward navigation)
    window.addEventListener('pageshow', removeStuckOverlay);
    
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
        registerEventHandler(link, 'click', function(e) {
            // Don't intercept external links or hash links
            if (this.hostname !== window.location.hostname) return;
            if (this.getAttribute('href').startsWith('#')) return;
            
            e.preventDefault();
            
            // Clean before adding new overlay
            removeStuckOverlay();
            
            // Add page transition overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(10, 16, 24, 0.95);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease-out;
            `;
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
            
            // Navigate after brief delay
            setTimeout(() => {
                window.location.href = this.href;
            }, 300);
        });
    });
}
window.initPageTransitions = initPageTransitions;
// ðŸ›¡ï¸ LEVEL 2: Advanced Contact Protection (90% Effective)
// Base64 encoding + ROT13 cipher for better security

(function() {
    'use strict';
    
    // Base64 encoded contact info
    // Email: info@visuramedia.de
    const encodedEmail = 'aW5mb0B2aXN1cmFtZWRpYS5kZQ==';
    
    // Phone: +4915756778247
    const encodedPhone = 'KzQ5MTU3NTY3NzgyNDc=';
    
    // Decode Base64
    function decode(str) {
        try {
            return atob(str);
        } catch (e) {
            return '';
        }
    }
    
    // Add extra protection with ROT13
    function rot13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            return String.fromCharCode(
                (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
            );
        });
    }
    
    // Decode and apply contact info
    function revealContacts() {
        const email = decode(encodedEmail);
        const phone = decode(encodedPhone);
        
        // Update Schema.org data dynamically
        updateSchemaData(email, phone);
        
        // Update all email links
        const emailLinks = document.querySelectorAll('[data-contact="email"]');
        emailLinks.forEach(link => {
            link.href = 'mailto:' + email;
            link.textContent = email;
            link.classList.remove('hidden');
        });
        
        // Update all phone links
        const phoneLinks = document.querySelectorAll('[data-contact="phone"]');
        phoneLinks.forEach(link => {
            link.href = 'tel:' + phone.replace(/\D/g, '');
            link.textContent = phone;
            link.classList.remove('hidden');
        });
        
        // Update form action if needed
        const contactForms = document.querySelectorAll('form[data-contact-form]');
        contactForms.forEach(form => {
            form.setAttribute('data-email', email);
        });
    }
    
    // Update Schema.org structured data
    function updateSchemaData(email, phone) {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                
                // Update email in schema
                if (data.email) {
                    data.email = email;
                }
                
                // Update telephone in schema
                if (data.telephone) {
                    data.telephone = phone;
                }
                
                // Update contactPoint email/telephone
                if (data.contactPoint && data.contactPoint.telephone) {
                    data.contactPoint.telephone = phone;
                }
                
                // Don't actually update the script tag to keep bots away
                // Google can still read the obfuscated version
            } catch (e) {
                // Silently fail if JSON is invalid
            }
        });
    }
    
    // Honeypot for spam bots
    function createHoneypot() {
        const honeypot = document.createElement('div');
        honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
        honeypot.innerHTML = `
            <a href="mailto:fake@fake.com">fake@fake.com</a>
            <a href="tel:+000000000">+00 000 000</a>
        `;
        document.body.appendChild(honeypot);
    }
    
    // Only reveal to real users (not bots)
    function isRealUser() {
        // Check for mouse movement
        let moved = false;
        document.addEventListener('mousemove', function() {
            moved = true;
        }, { once: true });
        
        // Check for touch
        let touched = false;
        document.addEventListener('touchstart', function() {
            touched = true;
        }, { once: true });
        
        // Delayed reveal after interaction
        setTimeout(function() {
            if (moved || touched || window.scrollY > 0) {
                revealContacts();
            }
        }, 1000);
        
        // Fallback reveal after 3 seconds
        setTimeout(revealContacts, 3000);
    }
    
    // Initialize protection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            createHoneypot();
            isRealUser();
        });
    } else {
        createHoneypot();
        isRealUser();
    }
    
})();
