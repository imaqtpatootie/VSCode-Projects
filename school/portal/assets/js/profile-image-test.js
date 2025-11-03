// ===== PROFILE IMAGE TEST =====

/**
 * Test utilities for profile image functionality
 */
window.ProfileImageTest = {
    /**
     * Test with a sample profile image
     */
    testWithSampleImage() {
        console.log('🖼️ Testing profile image functionality...');
        
        // Get current session
        const session = SessionManager.validateSession();
        if (!session) {
            console.log('❌ No session found');
            return;
        }
        
        // Add a sample profile image
        const sampleImageUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
        
        // Update session with profile image
        if (!session.profile) {
            session.profile = {};
        }
        session.profile.profileImage = sampleImageUrl;
        
        // Save updated session
        SessionManager.updateSession(session);
        
        // Refresh the page to see changes
        window.location.reload();
        
        console.log('✅ Sample profile image added. Page will refresh to show changes.');
    },
    
    /**
     * Remove profile image and use initials
     */
    testWithInitials() {
        console.log('🔤 Testing with initials...');
        
        // Get current session
        const session = SessionManager.validateSession();
        if (!session) {
            console.log('❌ No session found');
            return;
        }
        
        // Remove profile image
        if (session.profile) {
            delete session.profile.profileImage;
        }
        
        // Save updated session
        SessionManager.updateSession(session);
        
        // Refresh the page to see changes
        window.location.reload();
        
        console.log('✅ Profile image removed. Page will refresh to show initials.');
    },
    
    /**
     * Test dashboard recent activity
     */
    testRecentActivity() {
        console.log('⚡ Testing recent activity display...');
        
        // Check if dashboard is loaded
        const dashboard = window.currentDashboard;
        if (!dashboard) {
            console.log('❌ Dashboard not loaded');
            return;
        }
        
        // Check if recent activity card exists
        const recentActivityCard = document.querySelector('.recent-activity-card');
        if (recentActivityCard) {
            console.log('✅ Recent activity card found');
            
            const activityItems = recentActivityCard.querySelectorAll('.activity-item');
            console.log(`📊 Found ${activityItems.length} activity items`);
            
            if (activityItems.length === 0) {
                console.log('ℹ️ No recent activity items - this is normal for new users');
            }
        } else {
            console.log('❌ Recent activity card not found');
        }
    },
    
    /**
     * Run all tests
     */
    runAllTests() {
        console.log('🧪 Running Profile Image and Dashboard Tests...\n');
        
        this.testRecentActivity();
        
        console.log('\n🖼️ Profile Image Test Options:');
        console.log('- Use testWithSampleImage() to test with a sample profile image');
        console.log('- Use testWithInitials() to test with user initials');
    }
};

// Add global functions
window.testWithSampleImage = () => ProfileImageTest.testWithSampleImage();
window.testWithInitials = () => ProfileImageTest.testWithInitials();
window.testRecentActivity = () => ProfileImageTest.testRecentActivity();
window.testProfileAndDashboard = () => ProfileImageTest.runAllTests();

console.log('🧪 Profile Image Test loaded. Use testProfileAndDashboard() to run tests.');