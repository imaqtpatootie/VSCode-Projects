// ===== TEST ACTIVITY INTERACTION =====

/**
 * Test functions for activity interaction
 */
window.TestActivityInteraction = {
    /**
     * Test clicking on multiple choice options
     */
    testMultipleChoiceClick() {
        console.log('🧪 Testing multiple choice interaction...');
        
        // Find all radio buttons
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        console.log(`Found ${radioButtons.length} radio buttons`);
        
        if (radioButtons.length > 0) {
            const firstRadio = radioButtons[0];
            console.log('Testing first radio button:', firstRadio);
            
            // Simulate click
            firstRadio.checked = true;
            firstRadio.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('✅ Radio button clicked and change event dispatched');
        } else {
            console.log('❌ No radio buttons found');
        }
    },

    /**
     * Test text input
     */
    testTextInput() {
        console.log('🧪 Testing text input interaction...');
        
        // Find text inputs
        const textInputs = document.querySelectorAll('.short-answer-input, .essay-textarea');
        console.log(`Found ${textInputs.length} text inputs`);
        
        if (textInputs.length > 0) {
            const firstInput = textInputs[0];
            console.log('Testing first text input:', firstInput);
            
            // Simulate typing
            firstInput.value = 'Test answer';
            firstInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            console.log('✅ Text input updated and input event dispatched');
        } else {
            console.log('❌ No text inputs found');
        }
    },

    /**
     * Test response manager
     */
    testResponseManager() {
        console.log('🧪 Testing response manager...');
        
        const takingInterface = window.activityTakingInterface;
        if (!takingInterface) {
            console.log('❌ ActivityTakingInterface not found');
            return;
        }
        
        const responseManager = takingInterface.responseManager;
        if (!responseManager) {
            console.log('❌ ResponseManager not found');
            return;
        }
        
        console.log('✅ ResponseManager found:', responseManager);
        console.log('Current response:', responseManager.currentResponse);
        console.log('Current activity:', responseManager.currentActivity);
    },

    /**
     * Run all tests
     */
    runAllTests() {
        console.log('🚀 Running Activity Interaction Tests...\n');
        this.testMultipleChoiceClick();
        console.log('');
        this.testTextInput();
        console.log('');
        this.testResponseManager();
        console.log('\n✅ All tests complete!');
    }
};

// Add test button to interface when activity is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for activity interface to load
    setTimeout(() => {
        const contentArea = document.getElementById('contentArea');
        if (contentArea && contentArea.innerHTML.includes('activity-taking-interface')) {
            // Add test button
            const testButton = document.createElement('button');
            testButton.textContent = '🧪 Test Interactions';
            testButton.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            `;
            testButton.onclick = () => TestActivityInteraction.runAllTests();
            document.body.appendChild(testButton);
        }
    }, 3000);
});

console.log('🧪 Test Activity Interaction tools loaded');