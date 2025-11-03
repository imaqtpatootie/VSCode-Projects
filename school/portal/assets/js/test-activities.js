// ===== ACTIVITY SYSTEM TEST SCRIPT =====

/**
 * Test script to verify activity system foundation
 * This file can be loaded in the browser console to test functionality
 */

function testActivitySystem() {
    console.log('🧪 Testing Activity System Foundation...');
    
    // Test 1: Check if all modules are loaded
    console.log('\n📦 Module Loading Tests:');
    
    const requiredModules = [
        'ActivitySystem',
        'ActivityManager', 
        'ActivityValidators'
    ];
    
    requiredModules.forEach(module => {
        if (window[module]) {
            console.log(`✅ ${module} loaded successfully`);
        } else {
            console.error(`❌ ${module} failed to load`);
        }
    });
    
    // Test 2: Test ID generation
    console.log('\n🔢 ID Generation Tests:');
    const testIds = [
        ActivitySystem.generateId('act'),
        ActivitySystem.generateId('q'),
        ActivitySystem.generateId('resp')
    ];
    
    testIds.forEach((id, index) => {
        const prefixes = ['act', 'q', 'resp'];
        if (id && id.startsWith(prefixes[index])) {
            console.log(`✅ ID generation for ${prefixes[index]}: ${id}`);
        } else {
            console.error(`❌ ID generation failed for ${prefixes[index]}`);
        }
    });
    
    // Test 3: Test date utilities
    console.log('\n📅 Date Utility Tests:');
    const testDate = new Date('2024-12-01T10:00:00Z');
    const formattedDate = ActivitySystem.formatDate(testDate);
    const timeRemaining = ActivitySystem.getTimeRemaining(testDate);
    
    console.log(`✅ Date formatting: ${formattedDate}`);
    console.log(`✅ Time remaining: ${ActivitySystem.formatTimeRemaining(timeRemaining)}`);
    
    // Test 4: Test validation schemas
    console.log('\n✅ Validation Schema Tests:');
    
    // Test valid activity
    const validActivity = {
        title: 'Test Activity',
        description: 'This is a test activity for validation',
        instructions: 'Please answer all questions carefully',
        dueDate: new Date('2024-12-31T23:59:59Z'),
        status: ActivitySystem.ActivityStatus.DRAFT,
        questions: [{
            id: 'q1',
            type: ActivitySystem.QuestionType.MULTIPLE_CHOICE,
            question: 'What is 2 + 2?',
            points: 5,
            options: ['3', '4', '5', '6'],
            correctAnswer: '4'
        }],
        assignedClasses: ['class_101'],
        createdBy: 'teacher_123'
    };
    
    const validation = ActivitySystem.ActivitySchema.validate(validActivity);
    if (validation.isValid) {
        console.log('✅ Valid activity passed validation');
    } else {
        console.error('❌ Valid activity failed validation:', validation.errors);
    }
    
    // Test invalid activity
    const invalidActivity = {
        title: '', // Invalid: empty title
        description: 'Test',
        questions: [], // Invalid: no questions
        assignedClasses: [] // Invalid: no classes
    };
    
    const invalidValidation = ActivitySystem.ActivitySchema.validate(invalidActivity);
    if (!invalidValidation.isValid) {
        console.log('✅ Invalid activity correctly rejected');
        console.log('   Errors:', invalidValidation.errors);
    } else {
        console.error('❌ Invalid activity incorrectly passed validation');
    }
    
    // Test 5: Test ActivityManager
    console.log('\n🏗️ ActivityManager Tests:');
    
    try {
        const manager = new ActivityManager();
        console.log('✅ ActivityManager instantiated successfully');
        
        // Test activity creation
        manager.createActivity(validActivity).then(result => {
            if (result.success) {
                console.log('✅ Activity creation successful:', result.activity.id);
                
                // Test activity retrieval
                const retrieved = manager.getActivity(result.activity.id);
                if (retrieved) {
                    console.log('✅ Activity retrieval successful');
                } else {
                    console.error('❌ Activity retrieval failed');
                }
                
                // Test publishing
                manager.publishActivity(result.activity.id).then(publishResult => {
                    if (publishResult.success) {
                        console.log('✅ Activity publishing successful');
                    } else {
                        console.error('❌ Activity publishing failed:', publishResult.errors);
                    }
                });
                
            } else {
                console.error('❌ Activity creation failed:', result.errors);
            }
        });
        
    } catch (error) {
        console.error('❌ ActivityManager test failed:', error);
    }
    
    // Test 6: Test enhanced validators
    console.log('\n🔍 Enhanced Validator Tests:');
    
    try {
        const enhancedValidation = ActivityValidators.EnhancedActivitySchema.validate(validActivity);
        if (enhancedValidation.isValid) {
            console.log('✅ Enhanced validation passed');
            if (enhancedValidation.warnings.length > 0) {
                console.log('⚠️ Warnings:', enhancedValidation.warnings);
            }
        } else {
            console.error('❌ Enhanced validation failed:', enhancedValidation.errors);
        }
    } catch (error) {
        console.error('❌ Enhanced validator test failed:', error);
    }
    
    console.log('\n🎉 Activity System Foundation Tests Complete!');
    console.log('Check the console above for any errors that need to be addressed.');
}

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
    // Wait for all modules to load
    setTimeout(() => {
        if (window.ActivitySystem && window.ActivityManager && window.ActivityValidators) {
            testActivitySystem();
        } else {
            console.error('❌ Not all activity system modules are loaded. Please check the script loading order.');
        }
    }, 1000);
}

// Export for manual testing
window.testActivitySystem = testActivitySystem;