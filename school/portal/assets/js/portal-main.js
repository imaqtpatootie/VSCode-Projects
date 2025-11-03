// ===== SNHS PORTAL MAIN APPLICATION =====

/**
 * Main Portal Application Class
 */
class PortalApp {
    constructor() {
        this.user = null;
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize the portal application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Validate session and get user data
            this.user = SessionManager.validateSession();

            if (!this.user) {
                // No valid session, redirect to login
                UIUtils.showToast('Session expired. Please log in again.', 'warning');
                setTimeout(() => {
                    SessionManager.redirectToLogin();
                }, 2000);
                return;
            }

            // Initialize portal components
            await this.initializePortal();

            // Hide loading screen and show portal
            this.hideLoadingScreen();

            this.isInitialized = true;

            // Show welcome message
            UIUtils.showToast(`Welcome back, ${this.user.profile.displayName || this.user.profile.firstName}!`, 'success', 'Portal Loaded');

        } catch (error) {
            console.error('Portal initialization error:', error);
            this.showError('Failed to initialize portal. Please refresh the page.');
        }
    }

    /**
     * Initialize portal components and UI
     */
    async initializePortal() {
        // Initialize router and restore last section
        ComponentRouter.init();

        // Update user interface
        this.updateUserInterface();

        // Setup event listeners
        this.setupEventListeners();

        // Load last visited section or default to dashboard
        await ComponentRouter.loadSection(ComponentRouter.currentSection);

        // Initialize notifications
        await this.initializeNotifications();
    }

    /**
     * Update user interface with user data
     */
    updateUserInterface() {
        // Update user name and initials
        const userNameElement = document.getElementById('userName');
        const userInitialsElement = document.getElementById('userInitials');

        if (userNameElement) {
            userNameElement.textContent = this.user.profile.displayName ||
                `${this.user.profile.firstName} ${this.user.profile.lastName}`;
        }

        if (userInitialsElement) {
            const profileImage = this.user.profile?.profileImage || this.user.profileImage;
            const userAvatar = userInitialsElement.closest('.user-avatar');
            
            if (profileImage && userAvatar) {
                // Replace with image
                userAvatar.innerHTML = `<img src="${profileImage}" alt="${this.user.profile?.displayName || 'User'}" class="user-avatar-image">`;
            } else {
                // Use initials
                const firstName = this.user.profile?.firstName || this.user.firstName || '';
                const lastName = this.user.profile?.lastName || this.user.lastName || '';
                userInitialsElement.textContent = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
            }
        }
    }

    /**
     * Setup event listeners for portal interactions
     */
    setupEventListeners() {
        // Navigation menu items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    ComponentRouter.navigateTo(section);
                }
            });
        });

        // Set active navigation item based on current section (both navbar and sidebar)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });
        
        // Set active state for both desktop navbar and mobile sidebar
        const activeNavItems = document.querySelectorAll(`[data-section="${ComponentRouter.currentSection}"]`);
        activeNavItems.forEach(item => {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        });

        // User menu dropdown
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = userDropdown.classList.contains('show');
                userDropdown.classList.toggle('show');
                userMenuBtn.classList.toggle('active');
                
                // Update ARIA states
                userMenuBtn.setAttribute('aria-expanded', !isOpen);
                
                // Focus management
                if (!isOpen) {
                    // Focus first menu item when opening
                    setTimeout(() => {
                        const firstItem = userDropdown.querySelector('.dropdown-item');
                        if (firstItem) firstItem.focus();
                    }, 100);
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
                userMenuBtn.classList.remove('active');
                userMenuBtn.setAttribute('aria-expanded', 'false');
            });

            // Handle dropdown navigation items
            userDropdown.querySelectorAll('.dropdown-item[data-section]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = item.dataset.section;
                    if (section) {
                        ComponentRouter.navigateTo(section);
                        userDropdown.classList.remove('show');
                        userMenuBtn.classList.remove('active');
                        userMenuBtn.setAttribute('aria-expanded', 'false');
                        
                        // Announce navigation
                        if (window.accessibilityManager) {
                            window.accessibilityManager.announce(`Navigated to ${section}`);
                        }
                    }
                });
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Notification button and dropdown
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = notificationDropdown.classList.contains('show');
                
                // Close all other dropdowns first
                document.querySelectorAll('.notification-dropdown.show, .user-dropdown.show').forEach(dropdown => {
                    if (dropdown !== notificationDropdown) {
                        dropdown.classList.remove('show');
                    }
                });
                
                notificationDropdown.classList.toggle('show');
                notificationBtn.setAttribute('aria-expanded', !isOpen);
                
                if (!isOpen) {
                    this.loadNotificationDropdown();
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                    notificationDropdown.classList.remove('show');
                    notificationBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Mobile menu functionality
        this.setupMobileMenu();

        // Session timeout warning
        this.setupSessionTimeout();
    }

    /**
     * Initialize notifications system
     */
    async initializeNotifications() {
        try {
            // Load notification data (placeholder for now)
            const notifications = await this.loadNotifications();

            // Update notification counters
            this.updateNotificationCounters(notifications);

        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    /**
     * Load notifications data
     * @returns {Promise<Object>} Notifications data
     */
    async loadNotifications() {
        try {
            const baseNotifications = await DataManager.getNotifications(this.user.id);
            
            // Add activities notifications
            let newActivities = 0;
            let pendingActivities = 0;
            
            if (window.activityManager) {
                const userClass = this.user.profile?.class || this.user.class || 'class_101';
                const activities = window.activityManager.getActivitiesForClass(userClass, this.user.id);
                
                // Count new activities (published in last 7 days)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                newActivities = activities.filter(activity => 
                    activity.status === 'published' && 
                    new Date(activity.publishedAt || activity.createdAt) > weekAgo &&
                    !activity.hasResponse
                ).length;
                
                // Count pending activities (due soon)
                const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                pendingActivities = activities.filter(activity => 
                    activity.canTake && 
                    activity.dueDate && 
                    new Date(activity.dueDate) <= threeDaysFromNow
                ).length;
            }
            
            return {
                ...baseNotifications,
                newActivities,
                pendingActivities,
                total: (baseNotifications.total || 0) + newActivities + pendingActivities
            };
        } catch (error) {
            console.error('Error loading notifications:', error);
            return {
                unreadForumReplies: 0,
                newElections: 0,
                newPolls: 0,
                newActivities: 0,
                pendingActivities: 0,
                total: 0
            };
        }
    }

    /**
     * Update notification counters in UI
     * @param {Object} notifications - Notifications data
     */
    updateNotificationCounters(notifications) {
        const notificationCount = document.getElementById('notificationCount');
        const forumBadge = document.getElementById('forumBadge');
        const forumBadgeMobile = document.getElementById('forumBadgeMobile');
        const votingBadge = document.getElementById('votingBadge');
        const votingBadgeMobile = document.getElementById('votingBadgeMobile');

        if (notificationCount) {
            notificationCount.textContent = notifications.total || '';
        }

        // Update forum badges (both desktop and mobile)
        const forumCount = notifications.unreadForumReplies || '';
        if (forumBadge) {
            forumBadge.textContent = forumCount;
        }
        if (forumBadgeMobile) {
            forumBadgeMobile.textContent = forumCount;
        }

        // Update voting badges (both desktop and mobile)
        const votingNotifications = (notifications.newElections || 0) + (notifications.newPolls || 0);
        const votingCount = votingNotifications || '';
        if (votingBadge) {
            votingBadge.textContent = votingCount;
        }
        if (votingBadgeMobile) {
            votingBadgeMobile.textContent = votingCount;
        }
    }

    /**
     * Show notifications panel
     */
    async showNotifications() {
        try {
            const notifications = await this.loadNotifications();
            
            // Create notification panel content
            const notificationContent = `
                <div class="notification-panel">
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="close-btn" onclick="this.closest('.toast').remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="notification-content">
                        ${notifications.total === 0 ? 
                            '<div class="no-notifications">📭 No new notifications</div>' :
                            `
                            ${notifications.unreadForumReplies > 0 ? 
                                `<div class="notification-item">
                                    <div class="notification-icon">💬</div>
                                    <div class="notification-text">
                                        <strong>${notifications.unreadForumReplies} forum replies</strong>
                                        <p>You have new replies to your forum posts</p>
                                    </div>
                                </div>` : ''
                            }
                            ${notifications.newElections > 0 ? 
                                `<div class="notification-item">
                                    <div class="notification-icon">🗳️</div>
                                    <div class="notification-text">
                                        <strong>${notifications.newElections} new election${notifications.newElections > 1 ? 's' : ''}</strong>
                                        <p>New elections are available for voting</p>
                                    </div>
                                </div>` : ''
                            }
                            ${notifications.newPolls > 0 ? 
                                `<div class="notification-item">
                                    <div class="notification-icon">📊</div>
                                    <div class="notification-text">
                                        <strong>${notifications.newPolls} new poll${notifications.newPolls > 1 ? 's' : ''}</strong>
                                        <p>New polls are available for your input</p>
                                    </div>
                                </div>` : ''
                            }
                            `
                        }
                    </div>
                    <div class="notification-footer">
                        <button class="btn-link" onclick="ComponentRouter.navigateTo('forum')">View Forum</button>
                        <button class="btn-link" onclick="ComponentRouter.navigateTo('voting')">View Voting</button>
                    </div>
                </div>
            `;
            
            // Show as a custom toast
            const container = document.getElementById('toastContainer');
            if (container) {
                const toast = document.createElement('div');
                toast.className = 'toast notification-toast';
                toast.innerHTML = notificationContent;
                container.appendChild(toast);
                
                // Auto remove after 10 seconds
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 10000);
            }
            
        } catch (error) {
            console.error('Error showing notifications:', error);
            UIUtils.showToast('Error loading notifications', 'error');
        }
    }

    /**
     * Setup session timeout handling
     */
    setupSessionTimeout() {
        // Check session every 5 minutes
        setInterval(() => {
            const user = SessionManager.validateSession();
            if (!user) {
                UIUtils.showToast('Your session has expired. You will be redirected to login.', 'warning');
                setTimeout(() => {
                    SessionManager.redirectToLogin();
                }, 3000);
            }
        }, 5 * 60 * 1000);

        // Warn user 10 minutes before session expires
        const warningTime = SessionManager.SESSION_TIMEOUT - (10 * 60 * 1000);
        setTimeout(() => {
            this.showSessionWarning();
        }, warningTime);
    }

    /**
     * Show session expiration warning
     */
    showSessionWarning() {
        UIUtils.showToast(
            'Your session will expire in 10 minutes. Please save any work and refresh the page to extend your session.',
            'warning',
            'Session Expiring Soon',
            10000
        );
    }
    
    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const portalSidebar = document.getElementById('portalSidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (mobileMenuBtn && portalSidebar && mobileOverlay) {
            // Toggle mobile menu
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
            
            // Close menu when clicking overlay
            mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
            
            // Close menu when clicking nav items on mobile
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });
            
            // Close menu on window resize if desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            });
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const portalSidebar = document.getElementById('portalSidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (portalSidebar && mobileOverlay) {
            const isOpen = portalSidebar.classList.contains('show');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }
    
    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const portalSidebar = document.getElementById('portalSidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (portalSidebar && mobileOverlay) {
            portalSidebar.classList.add('show');
            mobileOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Update ARIA states
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
            }
            
            // Focus first nav item
            setTimeout(() => {
                const firstNavItem = portalSidebar.querySelector('.nav-item');
                if (firstNavItem) firstNavItem.focus();
            }, 100);
            
            // Announce to screen readers
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Navigation menu opened');
            }
        }
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const portalSidebar = document.getElementById('portalSidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (portalSidebar && mobileOverlay) {
            portalSidebar.classList.remove('show');
            mobileOverlay.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Update ARIA states
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.focus(); // Return focus to menu button
            }
            
            // Announce to screen readers
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Navigation menu closed');
            }
        }
    }

    /**
     * Handle user logout
     */
    logout() {
        // Clear session data
        SessionManager.clearSession();

        // Show logout message
        UIUtils.showToast('You have been logged out successfully.', 'success');

        // Redirect to main website after short delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const portalContainer = document.getElementById('portalContainer');

        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (portalContainer) portalContainer.style.display = 'none';
    }

    /**
     * Hide loading screen and show portal
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const portalContainer = document.getElementById('portalContainer');

        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (portalContainer) portalContainer.style.display = 'flex';
        }, 1000); // Small delay for better UX
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="school-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" style="
                        background: white;
                        color: var(--primary-blue);
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">Refresh Page</button>
                </div>
            `;
        }
    }

    /**
     * Load notification dropdown content
     */
    async loadNotificationDropdown() {
        try {
            const notifications = await this.loadNotifications();
            const notificationContent = document.getElementById('notificationContent');
            
            if (!notificationContent) return;
            
            if (notifications.total === 0) {
                notificationContent.innerHTML = '<div class="no-notifications">📭 No new notifications</div>';
            } else {
                let content = '';
                
                if (notifications.unreadForumReplies > 0) {
                    content += `
                        <div class="notification-item" data-navigate="forum">
                            <div class="notification-icon">💬</div>
                            <div class="notification-text">
                                <strong>${notifications.unreadForumReplies} forum replies</strong>
                                <p>You have new replies to your forum posts</p>
                            </div>
                        </div>
                    `;
                }
                
                if (notifications.newElections > 0) {
                    content += `
                        <div class="notification-item" data-navigate="voting">
                            <div class="notification-icon">🗳️</div>
                            <div class="notification-text">
                                <strong>${notifications.newElections} new election${notifications.newElections > 1 ? 's' : ''}</strong>
                                <p>New elections are available for voting</p>
                            </div>
                        </div>
                    `;
                }
                
                if (notifications.newPolls > 0) {
                    content += `
                        <div class="notification-item" data-navigate="voting">
                            <div class="notification-icon">📊</div>
                            <div class="notification-text">
                                <strong>${notifications.newPolls} new poll${notifications.newPolls > 1 ? 's' : ''}</strong>
                                <p>New polls are available for your input</p>
                            </div>
                        </div>
                    `;
                }
                
                if (notifications.newActivities > 0) {
                    content += `
                        <div class="notification-item" data-navigate="activities">
                            <div class="notification-icon">📚</div>
                            <div class="notification-text">
                                <strong>${notifications.newActivities} new activit${notifications.newActivities > 1 ? 'ies' : 'y'}</strong>
                                <p>New activities have been assigned to your class</p>
                            </div>
                        </div>
                    `;
                }
                
                if (notifications.pendingActivities > 0) {
                    content += `
                        <div class="notification-item" data-navigate="activities">
                            <div class="notification-icon">⏰</div>
                            <div class="notification-text">
                                <strong>${notifications.pendingActivities} activit${notifications.pendingActivities > 1 ? 'ies' : 'y'} due soon</strong>
                                <p>Complete these activities before the deadline</p>
                            </div>
                        </div>
                    `;
                }
                
                notificationContent.innerHTML = content;
                
                // Add click handlers to notification items
                notificationContent.querySelectorAll('.notification-item[data-navigate]').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const section = item.dataset.navigate;
                        this.closeNotificationDropdown();
                        ComponentRouter.navigateTo(section);
                    });
                });
            }
            
        } catch (error) {
            console.error('Error loading notification dropdown:', error);
            const notificationContent = document.getElementById('notificationContent');
            if (notificationContent) {
                notificationContent.innerHTML = '<div class="no-notifications">⚠️ Error loading notifications</div>';
            }
        }
    }

    /**
     * Close notification dropdown
     */
    closeNotificationDropdown() {
        const notificationDropdown = document.getElementById('notificationDropdown');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (notificationDropdown) {
            notificationDropdown.classList.remove('show');
        }
        if (notificationBtn) {
            notificationBtn.setAttribute('aria-expanded', 'false');
        }
    }
}

/**
 * Initialize portal when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the portal page
    if (window.location.pathname.includes('/portal/')) {
        // Initialize portal application
        window.portalApp = new PortalApp();
    }
});

/**
 * Handle login success from login page
 * This function will be called by the modified login system
 */
window.handleLoginSuccess = function (userData) {
    // Create session
    SessionManager.createSession(userData);

    // Redirect to portal
    window.location.href = '/school/portal/';
};

/**
 * Export for use in other modules
 */
window.PortalApp = PortalApp;