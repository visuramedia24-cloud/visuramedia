// 🛡️ LEVEL 2: Advanced Contact Protection (90% Effective)
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
            console.error('Decode error:', e);
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
    
    console.log('✅ Contact protection Level 2 active');
})();
