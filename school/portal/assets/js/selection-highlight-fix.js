// ===== SELECTION HIGHLIGHT FIX =====

/**
 * Fix for radio button selection highlighting
 */
window.SelectionHighlightFix = {
    /**
     * Initialize the fix
     */
    init() {
        console.log('🎯 Selection Highlight Fix initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyFix());
        } else {
            this.applyFix();
        }
        
        // Also apply fix when new content is loaded
        this.observeContentChanges();
    },

    /**
     * Apply the selection highlighting fix
     */
    applyFix() {
        console.log('🎯 Applying selection highlight fix...');
        
        // Fix existing radio buttons
        this.fixExistingRadioButtons();
        
        // Set up event delegation for future radio buttons
        this.setupEventDelegation();
    },

    /**
     * Fix existing radio buttons on the page
     */
    fixExistingRadioButtons() {
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        console.log(`🎯 Found ${radioButtons.length} radio buttons to fix`);
        
        radioButtons.forEach(radio => {
            // Remove existing listeners to avoid duplicates
            radio.removeEventListener('change', this.handleRadioChange);
            
            // Add new listener with visual update
            radio.addEventListener('change', this.handleRadioChange.bind(this));
            
            // Update visual state for already checked buttons
            if (radio.checked) {
                this.updateVisualState(radio);
            }
        });
    },

    /**
     * Set up event delegation for dynamically added radio buttons
     */
    setupEventDelegation() {
        // Use event delegation on document for all radio button changes
        document.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name.startsWith('question-')) {
                this.handleRadioChange(event);
            }
        });
        
        // Also handle clicks as backup
        document.addEventListener('click', (event) => {
            if (event.target.type === 'radio' && event.target.name.startsWith('question-')) {
                // Small delay to ensure the checked state is updated
                setTimeout(() => {
                    if (event.target.checked) {
                        this.updateVisualState(event.target);
                    }
                }, 10);
            }
        });
    },

    /**
     * Handle radio button change events
     */
    handleRadioChange(event) {
        const radio = event.target;
        console.log('🎯 Radio button changed:', radio.value);
        
        if (radio.checked) {
            this.updateVisualState(radio);
        }
    },

    /**
     * Update visual state for a radio button
     */
    updateVisualState(selectedRadio) {
        const questionName = selectedRadio.name;
        
        // Find all radio buttons with the same name (same question)
        const allRadios = document.querySelectorAll(`input[name="${questionName}"]`);
        
        allRadios.forEach(radio => {
            const optionContainer = radio.closest('.multiple-choice-option, .true-false-option');
            if (optionContainer) {
                if (radio === selectedRadio && radio.checked) {
                    optionContainer.classList.add('selected');
                    console.log('🎯 Added selected class to option');
                } else {
                    optionContainer.classList.remove('selected');
                }
            }
        });
    },

    /**
     * Observe content changes to apply fix to new elements
     */
    observeContentChanges() {
        const observer = new MutationObserver((mutations) => {
            let hasNewRadioButtons = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node contains radio buttons
                            const radioButtons = node.querySelectorAll ? 
                                node.querySelectorAll('input[type="radio"]') : [];
                            
                            if (radioButtons.length > 0) {
                                hasNewRadioButtons = true;
                            }
                        }
                    });
                }
            });
            
            if (hasNewRadioButtons) {
                console.log('🎯 New radio buttons detected, applying fix...');
                setTimeout(() => this.fixExistingRadioButtons(), 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Test the highlighting functionality
     */
    testHighlighting() {
        console.log('🧪 Testing radio button highlighting...');
        
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        if (radioButtons.length === 0) {
            console.log('❌ No radio buttons found to test');
            return;
        }
        
        const firstRadio = radioButtons[0];
        console.log('🧪 Testing first radio button:', firstRadio.value);
        
        // Simulate selection
        firstRadio.checked = true;
        firstRadio.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Check if visual state was updated
        setTimeout(() => {
            const optionContainer = firstRadio.closest('.multiple-choice-option, .true-false-option');
            if (optionContainer && optionContainer.classList.contains('selected')) {
                console.log('✅ Highlighting test passed');
            } else {
                console.log('❌ Highlighting test failed');
            }
        }, 100);
    },

    /**
     * Force apply highlighting to all currently checked radio buttons
     */
    forceApplyHighlighting() {
        console.log('🎯 Force applying highlighting to all checked radio buttons...');
        
        const checkedRadios = document.querySelectorAll('input[type="radio"]:checked');
        console.log(`🎯 Found ${checkedRadios.length} checked radio buttons`);
        
        checkedRadios.forEach(radio => {
            this.updateVisualState(radio);
        });
        
        console.log('✅ Highlighting applied to all checked radio buttons');
    }
};

// Auto-initialize
SelectionHighlightFix.init();

// Add global test functions
window.testHighlighting = () => SelectionHighlightFix.testHighlighting();
window.forceApplyHighlighting = () => SelectionHighlightFix.forceApplyHighlighting();

console.log('🎯 Selection Highlight Fix loaded. Use testHighlighting() to test functionality.');