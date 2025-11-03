// ===== ACTIVITIES DISPLAY FIX =====

/**
 * Fix for activities not displaying properly
 */
window.ActivitiesDisplayFix = {
    /**
     * Initialize and run fixes
     */
    init() {
        console.log('🔧 Activities Display Fix initializing...');
        
        // Wait for DOM and components to load
        setTimeout(() => {
            this.runFixes();
        }, 2000);
    },

    /**
     * Run all fixes
     */
    runFixes() {
        console.log('🔧 Running activities display fixes...');
        
        // Check if we're on the activities page
        if (!this.isActivitiesPage()) {
            console.log('ℹ️ Not on activities page, skipping fixes');
            return;
        }

        // Fix 1: Ensure ActivityManager has all required methods
        this.ensureActivityManagerMethods();
        
        // Fix 2: Reload activities if they're not showing
        this.reloadActivitiesIfNeeded();
        
        // Fix 3: Check sample data
        this.checkSampleData();
    },

    /**
     * Check if we're on the activities page
     */
    isActivitiesPage() {
        const contentArea = document.getElementById('contentArea');
        return contentArea && (
            contentArea.innerHTML.includes('activities-interface') ||
            contentArea.innerHTML.includes('activitiesGrid') ||
            window.location.hash === '#activities'
        );
    },

    /**
     * Ensure ActivityManager has all required methods
     */
    ensureActivityManagerMethods() {
        console.log('🔧 Checking ActivityManager methods...');
        
        const manager = window.activityManager;
        if (!manager) {
            console.log('❌ ActivityManager not found');
            return;
        }

        // Check for required methods
        const requiredMethods = [
            'getActivitiesForClass',
            'getStudentActivities',
            'saveResponseProgress',
            'submitResponse'
        ];

        const missingMethods = requiredMethods.filter(method => 
            typeof manager[method] !== 'function'
        );

        if (missingMethods.length > 0) {
            console.log('❌ Missing methods:', missingMethods);
        } else {
            console.log('✅ All required methods present');
        }
    },

    /**
     * Reload activities if they're not showing
     */
    reloadActivitiesIfNeeded() {
        console.log('🔧 Checking if activities need reloading...');
        
        const activitiesGrid = document.getElementById('activitiesGrid');
        if (!activitiesGrid) {
            console.log('❌ Activities grid not found');
            return;
        }

        // Check if activities are empty or showing error
        const isEmpty = activitiesGrid.innerHTML.includes('No Activities Available') ||
                       activitiesGrid.innerHTML.includes('Error Loading Activities') ||
                       activitiesGrid.children.length === 0;

        if (isEmpty) {
            console.log('🔄 Activities appear empty, attempting reload...');
            
            const activitiesInterface = window.currentActivitiesInterface;
            if (activitiesInterface && typeof activitiesInterface.loadStudentActivities === 'function') {
                activitiesInterface.loadStudentActivities();
                console.log('✅ Reload triggered');
            } else {
                console.log('❌ Cannot reload - interface not available');
            }
        } else {
            console.log('✅ Activities appear to be loaded');
        }
    },

    /**
     * Check sample data
     */
    checkSampleData() {
        console.log('🔧 Checking sample data...');
        
        const manager = window.activityManager;
        if (!manager) {
            console.log('❌ ActivityManager not found');
            return;
        }

        const activities = manager.getActivities();
        console.log(`📚 Found ${activities.length} total activities`);
        
        const publishedActivities = activities.filter(a => 
            a.status === ActivitySystem.ActivityStatus.PUBLISHED
        );
        console.log(`📖 Found ${publishedActivities.length} published activities`);

        // Check activities for class_101
        const classActivities = manager.getActivitiesForClass('class_101', 'student_123');
        console.log(`🎓 Found ${classActivities.length} activities for class_101`);

        if (classActivities.length > 0) {
            console.log('✅ Sample data is available');
            classActivities.forEach((activity, index) => {
                console.log(`  ${index + 1}. ${activity.title} (${activity.status})`);
            });
        } else {
            console.log('⚠️ No activities found for student class');
        }
    },

    /**
     * Force reload activities interface
     */
    forceReload() {
        console.log('🔄 Force reloading activities interface...');
        
        const activitiesInterface = window.currentActivitiesInterface;
        if (activitiesInterface) {
            activitiesInterface.render();
            console.log('✅ Interface reloaded');
        } else {
            console.log('❌ Interface not available');
        }
    },

    /**
     * Debug activities display
     */
    debugDisplay() {
        console.log('🔍 Debugging activities display...');
        
        // Check DOM elements
        const contentArea = document.getElementById('contentArea');
        const activitiesGrid = document.getElementById('activitiesGrid');
        
        console.log('Content area:', !!contentArea);
        console.log('Activities grid:', !!activitiesGrid);
        
        if (activitiesGrid) {
            console.log('Grid content length:', activitiesGrid.innerHTML.length);
            console.log('Grid children count:', activitiesGrid.children.length);
        }
        
        // Check interface
        const activitiesInterface = window.currentActivitiesInterface;
        console.log('Activities interface:', !!activitiesInterface);
        
        if (activitiesInterface) {
            console.log('Interface user:', activitiesInterface.user);
            console.log('Interface activity manager:', !!activitiesInterface.activityManager);
        }
        
        // Check session
        const session = SessionManager?.validateSession();
        console.log('Session:', session);
        
        if (session) {
            console.log('User class from profile:', session.profile?.class);
            console.log('User class direct:', session.class);
            console.log('User ID:', session.id);
        }
    },

    /**
     * Test activities loading manually
     */
    testActivitiesLoading() {
        console.log('🧪 Testing activities loading manually...');
        
        const manager = window.activityManager;
        if (!manager) {
            console.log('❌ ActivityManager not available');
            return;
        }

        // Test with different class configurations
        const testConfigs = [
            { class: 'class_101', studentId: 'student_123' },
            { class: 'class_101', studentId: 'student123' },
            { class: 'class_102', studentId: 'student_123' }
        ];

        testConfigs.forEach((config, index) => {
            console.log(`\n🧪 Test ${index + 1}: class=${config.class}, studentId=${config.studentId}`);
            
            try {
                const activities = manager.getActivitiesForClass(config.class, config.studentId);
                console.log(`  Found ${activities.length} activities`);
                
                if (activities.length > 0) {
                    activities.forEach((activity, i) => {
                        console.log(`    ${i + 1}. ${activity.title} (${activity.status})`);
                    });
                }
            } catch (error) {
                console.log(`  ❌ Error: ${error.message}`);
            }
        });
    }
};

// Auto-initialize
ActivitiesDisplayFix.init();

// Add global functions
window.reloadActivities = () => ActivitiesDisplayFix.forceReload();
window.debugActivities = () => ActivitiesDisplayFix.debugDisplay();
window.testActivitiesLoading = () => ActivitiesDisplayFix.testActivitiesLoading();

console.log('🔧 Activities Display Fix loaded. Use reloadActivities() or debugActivities() for manual control.');