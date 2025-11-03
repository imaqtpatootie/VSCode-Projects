// ===== INTERACTION FIX SCRIPT =====

/**
 * Script to identify and fix interaction issues with activities
 */
window.InteractionFix = {
    /**
     * Initialize and run diagnostics
     */
    init() {
        console.log('🔧 Starting interaction diagnostics...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runDiagnostics());
        } else {
            this.runDiagnostics();
        }
    },

    /**
     * Run comprehensive diagnostics
     */
    runDiagnostics() {
        console.log('🔍 Running interaction diagnostics...');
        
        // Check if we're on an activity page
        const contentArea = document.getElementById('contentArea');
        if (!contentArea || !contentArea.innerHTML.includes('activity-taking-interface')) {
            console.log('ℹ️ Not on activity taking page, skipping diagnostics');
            return;
        }

        // Run checks
        this.checkRadioButtons();
        this.checkEventListeners();
        this.checkResponseManager();
        this.fixCommonIssues();
    },

    /**
     * Check radio button functionality
     */
    checkRadioButtons() {
        console.log('📻 Checking radio buttons...');
        
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        console.log(`Found ${radioButtons.length} radio buttons`);
        
        radioButtons.forEach((radio, index) => {
            console.log(`Radio ${index + 1}:`, {
                name: radio.name,
                value: radio.value,
                checked: radio.checked,
                disabled: radio.disabled,
                id: radio.id
            });
            
            // Test if radio is clickable
            const rect = radio.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            console.log(`  Visible: ${isVisible}`);
            
            // Check if it has proper event listeners
            const hasChangeListener = radio.onchange !== null;
            console.log(`  Has change listener: ${hasChangeListener}`);
        });
    },

    /**
     * Check event listeners
     */
    checkEventListeners() {
        console.log('👂 Checking event listeners...');
        
        // Check if global activity taking interface exists
        const takingInterface = window.activityTakingInterface;
        console.log('ActivityTakingInterface available:', !!takingInterface);
        
        if (takingInterface) {
            console.log('Response manager:', !!takingInterface.responseManager);
            console.log('Current activity:', !!takingInterface.currentActivity);
            console.log('Current response:', !!takingInterface.currentResponse);
        }
    },

    /**
     * Check response manager
     */
    checkResponseManager() {
        console.log('💾 Checking response manager...');
        
        const takingInterface = window.activityTakingInterface;
        if (!takingInterface || !takingInterface.responseManager) {
            console.log('❌ Response manager not available');
            return;
        }
        
        const responseManager = takingInterface.responseManager;
        console.log('Current response:', responseManager.currentResponse);
        console.log('Current activity:', responseManager.currentActivity);
        
        // Test setting an answer
        try {
            responseManager.setAnswer('test-question', 'test-answer');
            const answer = responseManager.getAnswer('test-question');
            console.log('✅ Response manager working, test answer:', answer);
        } catch (error) {
            console.log('❌ Response manager error:', error);
        }
    },

    /**
     * Fix common interaction issues
     */
    fixCommonIssues() {
        console.log('🔧 Applying fixes...');
        
        // Fix 1: Ensure radio buttons have proper event listeners
        this.fixRadioButtonEvents();
        
        // Fix 2: Ensure text inputs have proper event listeners
        this.fixTextInputEvents();
        
        // Fix 3: Fix response manager integration
        this.fixResponseManagerIntegration();
    },

    /**
     * Fix radio button event handling
     */
    fixRadioButtonEvents() {
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        
        radioButtons.forEach(radio => {
            // Remove existing listeners to avoid duplicates
            radio.removeEventListener('change', this.handleRadioChange);
            
            // Add new listener
            radio.addEventListener('change', this.handleRadioChange.bind(this));
            
            // Also add click listener as backup
            radio.addEventListener('click', this.handleRadioClick.bind(this));
        });
        
        console.log(`✅ Fixed event listeners for ${radioButtons.length} radio buttons`);
    },

    /**
     * Fix text input event handling
     */
    fixTextInputEvents() {
        const textInputs = document.querySelectorAll('.short-answer-input, .essay-textarea');
        
        textInputs.forEach(input => {
            // Remove existing listeners
            input.removeEventListener('input', this.handleTextInput);
            
            // Add new listener
            input.addEventListener('input', this.handleTextInput.bind(this));
        });
        
        console.log(`✅ Fixed event listeners for ${textInputs.length} text inputs`);
    },

    /**
     * Fix response manager integration
     */
    fixResponseManagerIntegration() {
        const takingInterface = window.activityTakingInterface;
        if (!takingInterface) {
            console.log('❌ Cannot fix response manager - interface not available');
            return;
        }
        
        // Ensure response manager is properly initialized
        if (!takingInterface.responseManager) {
            console.log('🔧 Initializing response manager...');
            takingInterface.responseManager = new ResponseManager(window.activityManager);
        }
        
        console.log('✅ Response manager integration fixed');
    },

    /**
     * Handle radio button changes
     */
    handleRadioChange(event) {
        console.log('📻 Radio button changed:', event.target.value);
        
        const questionId = event.target.name.replace('question-', '');
        const answer = event.target.value;
        
        // Update response manager
        const takingInterface = window.activityTakingInterface;
        if (takingInterface && takingInterface.responseManager) {
            takingInterface.responseManager.setAnswer(questionId, answer);
            console.log('✅ Answer saved to response manager');
            
            // Update UI indicators
            takingInterface.updateQuestionIndicators();
        } else {
            console.log('❌ Could not save answer - response manager not available');
        }
    },

    /**
     * Handle radio button clicks (backup)
     */
    handleRadioClick(event) {
        console.log('📻 Radio button clicked:', event.target.value);
        
        // Ensure the radio gets checked
        if (!event.target.checked) {
            event.target.checked = true;
            
            // Trigger change event
            event.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },

    /**
     * Handle text input changes
     */
    handleTextInput(event) {
        console.log('📝 Text input changed:', event.target.value);
        
        const questionId = event.target.getAttribute('data-question-id');
        const answer = event.target.value;
        
        if (questionId) {
            const takingInterface = window.activityTakingInterface;
            if (takingInterface && takingInterface.responseManager) {
                takingInterface.responseManager.setAnswer(questionId, answer);
                console.log('✅ Text answer saved to response manager');
            }
        }
    },

    /**
     * Test submission functionality
     */
    testSubmission() {
        console.log('🚀 Testing submission functionality...');
        
        const takingInterface = window.activityTakingInterface;
        if (!takingInterface) {
            console.log('❌ Activity taking interface not available');
            return;
        }
        
        // Check if we have answers
        const responseManager = takingInterface.responseManager;
        if (!responseManager || !responseManager.currentResponse) {
            console.log('❌ No current response to submit');
            return;
        }
        
        const answers = responseManager.getAllAnswers();
        console.log('Current answers:', answers);
        
        const answerCount = Object.keys(answers).length;
        console.log(`Found ${answerCount} answers ready for submission`);
        
        if (answerCount === 0) {
            console.log('⚠️ No answers to submit');
        } else {
            console.log('✅ Submission should work with current answers');
        }
    },

    /**
     * Simulate clicking the first radio button for testing
     */
    simulateRadioClick() {
        console.log('🧪 Simulating radio button click...');
        
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        if (radioButtons.length === 0) {
            console.log('❌ No radio buttons found');
            return;
        }
        
        const firstRadio = radioButtons[0];
        console.log('Clicking radio button:', firstRadio.value);
        
        // Simulate user interaction
        firstRadio.checked = true;
        firstRadio.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Check if answer was saved
        setTimeout(() => {
            const takingInterface = window.activityTakingInterface;
            if (takingInterface && takingInterface.responseManager) {
                const questionId = firstRadio.name.replace('question-', '');
                const savedAnswer = takingInterface.responseManager.getAnswer(questionId);
                console.log('Saved answer:', savedAnswer);
                
                if (savedAnswer === firstRadio.value) {
                    console.log('✅ Radio button interaction working correctly');
                } else {
                    console.log('❌ Radio button interaction failed');
                }
            }
        }, 100);
    },

    /**
     * Run comprehensive interaction test
     */
    runFullTest() {
        console.log('🚀 Running full interaction test...');
        
        this.runDiagnostics();
        
        setTimeout(() => {
            this.simulateRadioClick();
            
            setTimeout(() => {
                this.testSubmission();
            }, 200);
        }, 100);
    }
};

// Auto-initialize when script loads
InteractionFix.init();

// Add global test functions
window.testInteraction = () => InteractionFix.runDiagnostics();
window.testSubmission = () => InteractionFix.testSubmission();
window.testRadioClick = () => InteractionFix.simulateRadioClick();
window.testFullInteraction = () => InteractionFix.runFullTest();

console.log('🔧 Interaction Fix script loaded. Use testFullInteraction() to run comprehensive tests.');