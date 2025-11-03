// ===== ACCESSIBILITY AND KEYBOARD NAVIGATION UTILITIES =====

/**
 * Accessibility Manager Class
 */
class AccessibilityManager {
    constructor() {
        this.isKeyboardUser = false;
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        this.init();
    }
    
    /**
     * Initialize accessibility features
     */
    init() {
        this.detectKeyboardUsage();
        this.setupKeyboardNavigation();
        this.setupAriaLiveRegions();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupKeyboardShortcuts();
        this.enhanceFormAccessibility();
    }
    
    /**
     * Detect if user is using keyboard navigation
     */
    detectKeyboardUsage() {
        // Detect keyboard usage
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardUser = true;
                document.body.classList.add('keyboard-user');
            }
        });
        
        // Detect mouse usage
        document.addEventListener('mousedown', () => {
            this.isKeyboardUser = false;
            document.body.classList.remove('keyboard-user');
        });
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key handling
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
            
            // Arrow key navigation for lists
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
            
            // Enter and Space for activation
            if (['Enter', ' '].includes(e.key)) {
                this.handleActivation(e);
            }
        });
    }
    
    /**
     * Handle escape key press
     */
    handleEscapeKey() {
        // Close dropdowns
        const openDropdowns = document.querySelectorAll('.user-dropdown.show');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
            const button = dropdown.previousElementSibling;
            if (button) button.focus();
        });
        
        // Close mobile menu
        const mobileMenu = document.getElementById('portalSidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (mobileMenu && mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
            overlay.classList.remove('show');
            document.getElementById('mobileMenuBtn')?.focus();
        }
        
        // Close modals
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            // Return focus to trigger element if available
            const trigger = modal.dataset.trigger;
            if (trigger) {
                document.getElementById(trigger)?.focus();
            }
        });
    }
    
    /**
     * Handle arrow key navigation
     */
    handleArrowNavigation(e) {
        const target = e.target;
        const parent = target.closest('.nav-menu, .dropdown-menu, .notification-list, .activity-list');
        
        if (!parent) return;
        
        const items = Array.from(parent.querySelectorAll(this.focusableElements));
        const currentIndex = items.indexOf(target);
        
        if (currentIndex === -1) return;
        
        e.preventDefault();
        
        let nextIndex;
        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= items.length) nextIndex = 0;
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = items.length - 1;
        }
        
        items[nextIndex].focus();
    }
    
    /**
     * Handle activation keys (Enter/Space)
     */
    handleActivation(e) {
        const target = e.target;
        
        // Handle clickable items that aren't buttons
        if (target.classList.contains('notification-item') || 
            target.classList.contains('stat-card') ||
            target.classList.contains('nav-item')) {
            e.preventDefault();
            target.click();
        }
        
        // Handle toggle switches
        if (target.classList.contains('toggle-switch')) {
            e.preventDefault();
            const input = target.querySelector('input');
            if (input) {
                input.checked = !input.checked;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }
    
    /**
     * Setup ARIA live regions
     */
    setupAriaLiveRegions() {
        // Create live regions if they don't exist
        if (!document.getElementById('aria-live-polite')) {
            const politeRegion = document.createElement('div');
            politeRegion.id = 'aria-live-polite';
            politeRegion.className = 'live-region';
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(politeRegion);
        }
        
        if (!document.getElementById('aria-live-assertive')) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.id = 'aria-live-assertive';
            assertiveRegion.className = 'live-region';
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(assertiveRegion);
        }
    }
    
    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
        const region = document.getElementById(regionId);
        
        if (region) {
            region.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal[style*="display: block"]');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
        
        // Focus management for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewContent(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Trap focus within an element
     */
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Enhance new content with accessibility features
     */
    enhanceNewContent(element) {
        // Add ARIA labels to buttons without text
        const buttons = element.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            const icon = button.querySelector('svg');
            if (icon && !button.textContent.trim()) {
                // Try to infer label from context
                const label = this.inferButtonLabel(button);
                if (label) {
                    button.setAttribute('aria-label', label);
                }
            }
        });
        
        // Add role and tabindex to clickable items
        const clickableItems = element.querySelectorAll('.notification-item, .stat-card, .activity-item');
        clickableItems.forEach(item => {
            if (!item.hasAttribute('role')) {
                item.setAttribute('role', 'button');
            }
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
            }
        });
        
        // Enhance form elements
        const formGroups = element.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            this.enhanceFormGroup(group);
        });
    }
    
    /**
     * Infer button label from context
     */
    inferButtonLabel(button) {
        // Check for common patterns
        if (button.classList.contains('close-btn') || button.classList.contains('toast-close')) {
            return 'Close';
        }
        if (button.classList.contains('mobile-menu-btn')) {
            return 'Toggle navigation menu';
        }
        if (button.classList.contains('notification-btn')) {
            return 'View notifications';
        }
        if (button.classList.contains('user-menu-btn')) {
            return 'User menu';
        }
        
        // Check parent context
        const parent = button.closest('[data-label]');
        if (parent) {
            return parent.dataset.label;
        }
        
        return null;
    }
    
    /**
     * Setup skip links
     */
    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`);
                }
            });
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in form fields
            if (e.target.matches('input, textarea, select, [contenteditable]')) {
                return;
            }
            
            // Alt + key shortcuts
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('forum');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('voting');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateToSection('profile');
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleMobileMenu();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showNotifications();
                        break;
                }
            }
        });
    }
    
    /**
     * Navigate to section via keyboard
     */
    navigateToSection(section) {
        if (window.ComponentRouter) {
            ComponentRouter.navigateTo(section);
            this.announce(`Navigated to ${section}`);
        }
    }
    
    /**
     * Toggle mobile menu via keyboard
     */
    toggleMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (menuBtn) {
            menuBtn.click();
            menuBtn.focus();
        }
    }
    
    /**
     * Show notifications via keyboard
     */
    showNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.click();
            notificationBtn.focus();
        }
    }
    
    /**
     * Enhance form accessibility
     */
    enhanceFormAccessibility() {
        document.addEventListener('DOMContentLoaded', () => {
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                this.enhanceFormGroup(group);
            });
        });
        
        // Handle form validation
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-input, .form-textarea')) {
                this.validateField(e.target);
            }
        });
    }
    
    /**
     * Enhance individual form group
     */
    enhanceFormGroup(group) {
        const label = group.querySelector('label');
        const input = group.querySelector('.form-input, .form-textarea, .form-select');
        const helpText = group.querySelector('.field-help');
        const errorText = group.querySelector('.field-error');
        
        if (label && input) {
            // Ensure proper association
            if (!input.id) {
                input.id = 'field_' + Math.random().toString(36).substr(2, 9);
            }
            label.setAttribute('for', input.id);
            
            // Associate help text
            if (helpText) {
                const helpId = input.id + '_help';
                helpText.id = helpId;
                input.setAttribute('aria-describedby', helpId);
            }
            
            // Associate error text
            if (errorText) {
                const errorId = input.id + '_error';
                errorText.id = errorId;
                const describedBy = input.getAttribute('aria-describedby') || '';
                input.setAttribute('aria-describedby', `${describedBy} ${errorId}`.trim());
            }
        }
    }
    
    /**
     * Validate form field
     */
    validateField(field) {
        const group = field.closest('.form-group');
        if (!group) return;
        
        const isValid = field.checkValidity();
        group.setAttribute('aria-invalid', !isValid);
        
        if (isValid) {
            this.clearFieldError(group);
        } else {
            this.showFieldError(group, field.validationMessage);
        }
    }
    
    /**
     * Show field error
     */
    showFieldError(group, message) {
        let errorElement = group.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            group.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        this.announce(`Error: ${message}`, 'assertive');
    }
    
    /**
     * Clear field error
     */
    clearFieldError(group) {
        const errorElement = group.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// Initialize accessibility manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Export for use in other modules
window.AccessibilityManager = AccessibilityManager;