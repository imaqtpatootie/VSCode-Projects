// ===== TEST SESSION INITIALIZATION =====

/**
 * Initialize a test session for development and testing
 */
function initializeTestSession() {
    // Check if session already exists
    const existingSession = SessionManager.validateSession();
    if (existingSession) {
        console.log('Existing session found:', existingSession);
        return;
    }

    // Create a test user session
    const testUser = {
        id: 'student_123',
        role: 'student', // Change to 'teacher' to test teacher interface
        profile: {
            firstName: 'Test',
            lastName: 'Student',
            displayName: 'Test Student',
            email: 'test.student@snhs.edu',
            class: 'class_101'
        }
    };

    // Create session
    SessionManager.createSession(testUser);
    
    console.log('Test session created for:', testUser.profile.displayName);
    console.log('Role:', testUser.role);
    
    // Show notification
    if (typeof UIUtils !== 'undefined') {
        UIUtils.showToast(`Test session created as ${testUser.role}`, 'info');
    }
}

// Auto-initialize test session when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        if (typeof SessionManager !== 'undefined') {
            initializeTestSession();
        }
    }, 1000);
});

// Export for manual use
window.initializeTestSession = initializeTestSession;