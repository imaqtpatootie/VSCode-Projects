// ===== FINAL INTERACTION TEST =====

/**
 * Comprehensive test to verify all interaction issues are resolved
 */
window.FinalInteractionTest = {
    /**
     * Run comprehensive test suite
     */
    async runTests() {
        console.log('🚀 Running Final Interaction Test Suite...\n');
        
        const results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test 1: Component Availability
        await this.testComponentAvailability(results);
        
        // Test 2: Activity Manager CRUD
        await this.testActivityManagerCRUD(results);
        
        // Test 3: Question Builder
        await this.testQuestionBuilder(results);
        
        // Test 4: Response Manager
        await this.testResponseManager(results);
        
        // Test 5: Activity Taking Interface
        await this.testActivityTakingInterface(results);
        
        // Test 6: Radio Button Interaction
        await this.testRadioButtonInteraction(results);
        
        // Test 7: Submission Process
        await this.testSubmissionProcess(results);
        
        // Display results
        this.displayResults(results);
        
        return results;
    },
    
    /**
     * Test component availability
     */
    async testComponentAvailability(results) {
        console.log('📦 Testing Component Availability...');
        
        const components = [
            'ActivitySystem',
            'ActivityManager',
            'QuestionBuilder',
            'QuestionRenderer',
            'ResponseManager',
            'ActivityTakingInterface'
        ];
        
        let allAvailable = true;
        const missing = [];
        
        components.forEach(component => {
            if (typeof window[component] === 'undefined') {
                allAvailable = false;
                missing.push(component);
            }
        });
        
        this.recordTest(results, 'Component Availability', allAvailable, 
            allAvailable ? 'All components loaded' : `Missing: ${missing.join(', ')}`);
    },
    
    /**
     * Test ActivityManager CRUD operations
     */
    async testActivityManagerCRUD(results) {
        console.log('🗃️ Testing ActivityManager CRUD...');
        
        try {
            const manager = new ActivityManager();
            
            // Test create activity
            const createResult = await manager.createActivity({
                title: 'Test Activity',
                description: 'Test Description',
                dueDate: new Date(Date.now() + 86400000),
                questions: [{
                    type: 'multiple_choice',
                    question: 'Test question?',
                    options: ['A', 'B', 'C'],
                    correctAnswer: 'A',
                    points: 5
                }],
                assignedClasses: ['test_class']
            });
            
            const createSuccess = createResult.success && createResult.activity;
            this.recordTest(results, 'Activity Creation', createSuccess, 
                createSuccess ? 'Activity created successfully' : createResult.errors?.join(', '));
            
            if (createSuccess) {
                const activityId = createResult.activity.id;
                
                // Test get activity
                const activity = manager.getActivity(activityId);
                this.recordTest(results, 'Activity Retrieval', !!activity, 
                    activity ? 'Activity retrieved successfully' : 'Failed to retrieve activity');
                
                // Test update activity
                const updateResult = await manager.updateActivity(activityId, {
                    title: 'Updated Test Activity'
                });
                this.recordTest(results, 'Activity Update', updateResult.success, 
                    updateResult.success ? 'Activity updated successfully' : updateResult.errors?.join(', '));
                
                // Test submit response
                const submitResult = await manager.submitResponse(activityId, 'test_student', {
                    'test_question': 'A'
                });
                this.recordTest(results, 'Response Submission', submitResult.success, 
                    submitResult.success ? 'Response submitted successfully' : submitResult.errors?.join(', '));
            }
            
        } catch (error) {
            this.recordTest(results, 'ActivityManager CRUD', false, error.message);
        }
    },
    
    /**
     * Test QuestionBuilder
     */
    async testQuestionBuilder(results) {
        console.log('❓ Testing QuestionBuilder...');
        
        try {
            const builder = new QuestionBuilder();
            
            // Test create multiple choice question
            const mcResult = builder.createMultipleChoiceQuestion({
                question: 'What is 2+2?',
                options: ['3', '4', '5'],
                correctAnswer: '4',
                points: 5
            });
            
            this.recordTest(results, 'Multiple Choice Creation', mcResult.success, 
                mcResult.success ? 'MC question created' : mcResult.errors?.join(', '));
            
            // Test create short answer question
            const saResult = builder.createShortAnswerQuestion({
                question: 'What is the capital of France?',
                correctAnswer: 'Paris',
                points: 3
            });
            
            this.recordTest(results, 'Short Answer Creation', saResult.success, 
                saResult.success ? 'SA question created' : saResult.errors?.join(', '));
            
        } catch (error) {
            this.recordTest(results, 'QuestionBuilder', false, error.message);
        }
    },
    
    /**
     * Test ResponseManager
     */
    async testResponseManager(results) {
        console.log('💾 Testing ResponseManager...');
        
        try {
            const manager = new ResponseManager();
            
            // Create test activity
            const testActivity = {
                id: 'test_activity',
                questions: [
                    { id: 'q1', type: 'multiple_choice', required: true },
                    { id: 'q2', type: 'short_answer', required: false }
                ]
            };
            
            // Test start response
            const startResult = await manager.startResponse(testActivity, 'test_student');
            this.recordTest(results, 'Response Start', startResult.success, 
                startResult.success ? 'Response started' : startResult.errors?.join(', '));
            
            if (startResult.success) {
                // Test set answer
                manager.setAnswer('q1', 'Test Answer');
                const answer = manager.getAnswer('q1');
                this.recordTest(results, 'Answer Storage', answer === 'Test Answer', 
                    answer === 'Test Answer' ? 'Answer stored correctly' : 'Answer not stored');
                
                // Test completion percentage
                const completion = manager.getCompletionPercentage();
                this.recordTest(results, 'Completion Calculation', completion > 0, 
                    `Completion: ${completion}%`);
            }
            
        } catch (error) {
            this.recordTest(results, 'ResponseManager', false, error.message);
        }
    },
    
    /**
     * Test ActivityTakingInterface
     */
    async testActivityTakingInterface(results) {
        console.log('🎯 Testing ActivityTakingInterface...');
        
        try {
            const activityManager = new ActivityManager();
            const questionRenderer = new QuestionRenderer();
            const responseManager = new ResponseManager(activityManager);
            
            const interface = new ActivityTakingInterface(activityManager, questionRenderer, responseManager);
            
            this.recordTest(results, 'Interface Creation', !!interface, 
                interface ? 'Interface created successfully' : 'Failed to create interface');
            
            // Test event listener setup
            const hasEventListeners = typeof interface.setupEventListeners === 'function';
            this.recordTest(results, 'Event Listeners', hasEventListeners, 
                hasEventListeners ? 'Event listeners available' : 'Event listeners missing');
            
        } catch (error) {
            this.recordTest(results, 'ActivityTakingInterface', false, error.message);
        }
    },
    
    /**
     * Test radio button interaction
     */
    async testRadioButtonInteraction(results) {
        console.log('📻 Testing Radio Button Interaction...');
        
        // Check if we're on an activity page
        const contentArea = document.getElementById('contentArea');
        if (!contentArea || !contentArea.innerHTML.includes('activity-taking-interface')) {
            this.recordTest(results, 'Radio Button Test', false, 'Not on activity taking page');
            return;
        }
        
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        if (radioButtons.length === 0) {
            this.recordTest(results, 'Radio Button Test', false, 'No radio buttons found');
            return;
        }
        
        try {
            const firstRadio = radioButtons[0];
            const originalChecked = firstRadio.checked;
            
            // Simulate click
            firstRadio.checked = true;
            firstRadio.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Wait a bit for event processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if answer was saved
            const takingInterface = window.activityTakingInterface;
            if (takingInterface && takingInterface.responseManager) {
                const questionId = firstRadio.name.replace('question-', '');
                const savedAnswer = takingInterface.responseManager.getAnswer(questionId);
                
                this.recordTest(results, 'Radio Button Interaction', savedAnswer === firstRadio.value, 
                    savedAnswer === firstRadio.value ? 'Radio button working' : 'Radio button not saving answers');
            } else {
                this.recordTest(results, 'Radio Button Interaction', false, 'Interface not available');
            }
            
            // Restore original state
            firstRadio.checked = originalChecked;
            
        } catch (error) {
            this.recordTest(results, 'Radio Button Interaction', false, error.message);
        }
    },
    
    /**
     * Test submission process
     */
    async testSubmissionProcess(results) {
        console.log('🚀 Testing Submission Process...');
        
        const takingInterface = window.activityTakingInterface;
        if (!takingInterface) {
            this.recordTest(results, 'Submission Test', false, 'Interface not available');
            return;
        }
        
        const responseManager = takingInterface.responseManager;
        if (!responseManager || !responseManager.currentResponse) {
            this.recordTest(results, 'Submission Test', false, 'No active response');
            return;
        }
        
        try {
            // Check if submission method exists
            const hasSubmitMethod = typeof responseManager.submitResponse === 'function';
            this.recordTest(results, 'Submission Method', hasSubmitMethod, 
                hasSubmitMethod ? 'Submit method available' : 'Submit method missing');
            
            // Check if validation works
            const validation = responseManager.validateResponse();
            this.recordTest(results, 'Response Validation', !!validation, 
                validation ? 'Validation working' : 'Validation failed');
            
        } catch (error) {
            this.recordTest(results, 'Submission Process', false, error.message);
        }
    },
    
    /**
     * Record test result
     */
    recordTest(results, testName, passed, message) {
        results.tests.push({
            name: testName,
            passed: passed,
            message: message
        });
        
        if (passed) {
            results.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            results.failed++;
            console.log(`❌ ${testName}: ${message}`);
        }
    },
    
    /**
     * Display final results
     */
    displayResults(results) {
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
        
        if (results.failed === 0) {
            console.log('\n🎉 All tests passed! The interaction issues have been resolved.');
        } else {
            console.log('\n⚠️ Some tests failed. Review the issues above.');
        }
        
        return results;
    }
};

// Add to global scope
window.runFinalTest = () => FinalInteractionTest.runTests();

console.log('🧪 Final Interaction Test loaded. Use runFinalTest() to run all tests.');