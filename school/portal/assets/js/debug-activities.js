// ===== ACTIVITIES DEBUG UTILITIES =====

/**
 * Debug utilities for troubleshooting the Activities system
 */
window.ActivitiesDebug = {
    /**
     * Check if all required components are loaded
     */
    checkComponents() {
        const components = [
            'ActivitySystem',
            'ActivityManager', 
            'ActivityValidators',
            'QuestionBuilder',
            'QuestionRenderer',
            'ResponseManager',
            'ActivitiesInterface',
            'ActivityCreationWizard',
            'GradingInterface',
            'ActivityTakingInterface',
            'ResultsViewer'
        ];
        
        console.log('🔍 Checking component availability:');
        components.forEach(component => {
            const available = window[component] !== undefined;
            console.log(`${available ? '✅' : '❌'} ${component}: ${available ? 'Available' : 'Missing'}`);
        });
    },

    /**
     * Check current session
     */
    checkSession() {
        console.log('👤 Session Information:');
        const session = SessionManager?.validateSession();
        if (session) {
            console.log('✅ Session active:', session);
        } else {
            console.log('❌ No active session');
        }
    },

    /**
     * Check activities data
     */
    checkActivities() {
        console.log('📚 Activities Data:');
        const activityManager = window.activityManager;
        if (activityManager) {
            const activities = Array.from(activityManager.activities.values());
            console.log(`✅ Found ${activities.length} activities:`);
            activities.forEach(activity => {
                console.log(`  - ${activity.title} (${activity.status}) - ${activity.questions.length} questions`);
            });
        } else {
            console.log('❌ ActivityManager not available');
        }
    },

    /**
     * Test question rendering
     */
    testQuestionRendering() {
        console.log('🎯 Testing Question Rendering:');
        const activityManager = window.activityManager;
        if (!activityManager) {
            console.log('❌ ActivityManager not available');
            return;
        }

        const activities = Array.from(activityManager.activities.values());
        if (activities.length === 0) {
            console.log('❌ No activities found');
            return;
        }

        const activity = activities[0];
        if (activity.questions.length === 0) {
            console.log('❌ No questions found in activity');
            return;
        }

        const question = activity.questions[0];
        console.log('✅ Sample question:', question);
        
        // Test question renderer
        const renderer = new QuestionRenderer();
        const questionElement = renderer.renderQuestion(question, {
            questionNumber: 1,
            currentAnswer: null,
            isReadOnly: false
        });
        
        console.log('✅ Question rendered successfully:', questionElement);
    },

    /**
     * Test response manager
     */
    testResponseManager() {
        console.log('💾 Testing Response Manager:');
        const activityManager = window.activityManager;
        if (!activityManager) {
            console.log('❌ ActivityManager not available');
            return;
        }

        const responseManager = new ResponseManager(activityManager);
        console.log('✅ ResponseManager created:', responseManager);
        
        // Test setting an answer
        responseManager.currentResponse = {
            id: 'test',
            responses: {}
        };
        
        responseManager.setAnswer('test-question', 'test-answer');
        console.log('✅ Answer set:', responseManager.getAnswer('test-question'));
    },

    /**
     * Run all checks
     */
    runAllChecks() {
        console.log('🚀 Running Activities System Debug Checks...\n');
        this.checkComponents();
        console.log('');
        this.checkSession();
        console.log('');
        this.checkActivities();
        console.log('');
        this.testQuestionRendering();
        console.log('');
        this.testResponseManager();
        console.log('\n✅ Debug checks complete!');
    },

    /**
     * Create a teacher session for testing
     */
    createTeacherSession() {
        const teacherUser = {
            id: 'teacher_456',
            role: 'teacher',
            profile: {
                firstName: 'Test',
                lastName: 'Teacher',
                displayName: 'Test Teacher',
                email: 'test.teacher@snhs.edu'
            }
        };

        SessionManager.createSession(teacherUser);
        console.log('👨‍🏫 Teacher session created');
        UIUtils.showToast('Switched to teacher account', 'info');
    },

    /**
     * Create a student session for testing
     */
    createStudentSession() {
        const studentUser = {
            id: 'student_123',
            role: 'student',
            profile: {
                firstName: 'Test',
                lastName: 'Student',
                displayName: 'Test Student',
                email: 'test.student@snhs.edu',
                class: 'class_101'
            }
        };

        SessionManager.createSession(studentUser);
        console.log('👨‍🎓 Student session created');
        UIUtils.showToast('Switched to student account', 'info');
    }
};

// Auto-run basic checks when loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🔧 Activities Debug Tools loaded. Use ActivitiesDebug.runAllChecks() to diagnose issues.');
    }, 2000);
});

console.log('🔧 Activities Debug Tools loaded');