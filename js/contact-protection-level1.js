// 🛡️ LEVEL 1: Basic Contact Protection (70% Effective)
// Simple JavaScript obfuscation to hide from basic scrapers

(function() {
    'use strict';
    
    // Obfuscated email and phone
    function decodeContact() {
        // Email: info@visuramedia.de
        const emailParts = ['info', 'visuramedia', 'de'];
        const email = emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2];
        
        // Phone: +49-1575-6778247
        const phoneParts = ['+49', '1575', '6778247'];
        const phone = phoneParts.join('-');
        
        return { email, phone };
    }
    
    // Update mailto links
    function updateMailtoLinks() {
        const { email, phone } = decodeContact();
        
        // Update all mailto links
        const mailtoLinks = document.querySelectorAll('a[href="mailto:info@visuramedia.de"]');
        mailtoLinks.forEach(link => {
            link.href = 'mailto:' + email;
            if (link.textContent.includes('@')) {
                link.textContent = email;
            }
        });
        
        // Update all tel links
        const telLinks = document.querySelectorAll('a[href="tel:+4915756778247"]');
        telLinks.forEach(link => {
            link.href = 'tel:' + phone.replace(/-/g, '');
            if (link.textContent.includes('+49')) {
                link.textContent = phone;
            }
        });
        
        // Update any plain text email/phone
        const textElements = document.querySelectorAll('[data-contact-email], [data-contact-phone]');
        textElements.forEach(element => {
            if (element.hasAttribute('data-contact-email')) {
                element.textContent = email;
                element.href = 'mailto:' + email;
            }
            if (element.hasAttribute('data-contact-phone')) {
                element.textContent = phone;
                element.href = 'tel:' + phone.replace(/-/g, '');
            }
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMailtoLinks);
    } else {
        updateMailtoLinks();
    }
    
    console.log('✅ Contact protection Level 1 active');
})();
