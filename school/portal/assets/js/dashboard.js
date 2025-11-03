// ===== SNHS PORTAL DASHBOARD COMPONENT =====

/**
 * Dashboard Component Class
 */
class Dashboard {
    constructor(userData) {
        this.user = userData;
        this.dashboardData = null;
        this.refreshInterval = null;
    }
    
    /**
     * Initialize dashboard
     */
    async init() {
        try {
            await this.loadDashboardData();
            this.render();
            this.setupEventListeners();
            this.startAutoRefresh();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.renderError();
        }
    }
    
    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            // Load all necessary data
            const [notifications, forumData, electionsData, pollsData] = await Promise.all([
                DataManager.getNotifications(this.user.id),
                DataManager.loadForumPosts(),
                DataManager.loadElections(),
                DataManager.loadPolls()
            ]);
            
            // Get user's recent activity
            const userPosts = forumData?.posts?.filter(post => post.author.id === this.user.id) || [];
            const votingHistory = await DataManager.getUserVotingHistory(this.user.id);
            
            // Calculate stats
            const stats = {
                forumPosts: userPosts.length,
                forumReplies: forumData?.posts?.reduce((count, post) => 
                    count + post.replies.filter(reply => reply.author.id === this.user.id).length, 0) || 0,
                electionsVoted: votingHistory.elections.length,
                pollsAnswered: votingHistory.polls.length
            };
            
            // Get recent activity
            const recentActivity = this.getRecentActivity(userPosts, votingHistory);
            
            // Get upcoming events/deadlines
            const upcomingItems = this.getUpcomingItems(electionsData, pollsData);
            
            this.dashboardData = {
                notifications,
                stats,
                recentActivity,
                upcomingItems,
                quickStats: {
                    totalUsers: forumData?.stats?.activeUsers || 0,
                    totalPosts: forumData?.stats?.totalPosts || 0,
                    activeElections: electionsData?.elections?.filter(e => e.status === 'active').length || 0,
                    activePolls: pollsData?.polls?.filter(p => p.status === 'active').length || 0
                }
            };
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }
    
    /**
     * Get recent user activity
     */
    getRecentActivity(userPosts, votingHistory) {
        const activities = [];
        
        // Add forum posts
        userPosts.forEach(post => {
            activities.push({
                type: 'forum_post',
                title: post.title,
                timestamp: post.timestamp,
                icon: '💬',
                description: `Posted in ${post.category}`
            });
        });
        
        // Add voting activity
        votingHistory.elections.forEach(election => {
            activities.push({
                type: 'election_vote',
                title: 'Voted in Election',
                timestamp: election.votedAt,
                icon: '🗳️',
                description: 'Student Government Elections'
            });
        });
        
        votingHistory.polls.forEach(poll => {
            activities.push({
                type: 'poll_response',
                title: 'Responded to Poll',
                timestamp: poll.respondedAt,
                icon: '📊',
                description: 'School poll participation'
            });
        });
        
        // Sort by timestamp and return recent 5
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
    }
    
    /**
     * Get upcoming items
     */
    getUpcomingItems(electionsData, pollsData) {
        const upcoming = [];
        
        // Add upcoming elections
        if (electionsData?.elections) {
            electionsData.elections
                .filter(election => election.status === 'upcoming')
                .forEach(election => {
                    upcoming.push({
                        type: 'election',
                        title: election.title,
                        date: election.startDate,
                        icon: '🗳️',
                        description: 'Election opens for voting'
                    });
                });
        }
        
        // Add ending polls
        if (pollsData?.polls) {
            pollsData.polls
                .filter(poll => poll.status === 'active')
                .forEach(poll => {
                    upcoming.push({
                        type: 'poll',
                        title: poll.title,
                        date: poll.endDate,
                        icon: '📊',
                        description: 'Poll closes'
                    });
                });
        }
        
        // Sort by date and return next 3
        return upcoming
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
    }
    
    /**
     * Render dashboard
     */
    render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea || !this.dashboardData) return;
        
        const { notifications, stats, recentActivity, upcomingItems, quickStats } = this.dashboardData;
        
        contentArea.innerHTML = `
            <div class="dashboard">
                <!-- Welcome Section -->
                <div class="dashboard-header">
                    <div class="welcome-section">
                        <h1>Welcome back, ${this.user.profile.displayName || this.user.profile.firstName}! 👋</h1>
                        <p>Here's what's happening in your school community</p>
                    </div>
                    <div class="user-info-card">
                        <div class="user-avatar-large">
                            ${this.getUserInitials()}
                        </div>
                        <div class="user-details">
                            <h3>${this.user.profile.firstName} ${this.user.profile.lastName}</h3>
                            <p>${this.user.profile.grade} • ${this.user.profile.track}</p>
                            <p class="section-info">${this.user.profile.section} Section</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.forumPosts}</div>
                            <div class="stat-label">Forum Posts</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💭</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.forumReplies}</div>
                            <div class="stat-label">Replies</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🗳️</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.electionsVoted}</div>
                            <div class="stat-label">Elections Voted</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-number">${stats.pollsAnswered}</div>
                            <div class="stat-label">Polls Answered</div>
                        </div>
                    </div>
                </div>
                
                <!-- Welcome Card -->
                <div class="dashboard-card welcome-card">
                    <div class="card-content">
                        <div class="welcome-content">
                            <div class="welcome-text">
                                <h2>Welcome back, ${this.user.profile.firstName}! 👋</h2>
                                <p>Here's what's happening in your school community today.</p>
                            </div>
                            <div class="welcome-avatar">
                                ${this.getUserAvatar('large')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="dashboard-grid">
                    <!-- Column 1: Quick Actions, Your Activity, Upcoming -->
                    <div class="dashboard-column column-1">
                        <!-- Quick Actions Card -->
                        <div class="dashboard-card quick-actions-card">
                            <div class="card-header">
                                <h3>⚡ Quick Actions</h3>
                            </div>
                            <div class="card-content">
                                <div class="quick-actions-grid">
                                    <button class="quick-action-btn" onclick="ComponentRouter.navigateTo('activities')">
                                        <div class="quick-action-icon">📚</div>
                                        <div class="quick-action-text">Activities</div>
                                    </button>
                                    <button class="quick-action-btn" onclick="ComponentRouter.navigateTo('forum')">
                                        <div class="quick-action-icon">💬</div>
                                        <div class="quick-action-text">Forum</div>
                                    </button>
                                    <button class="quick-action-btn" onclick="ComponentRouter.navigateTo('voting')">
                                        <div class="quick-action-icon">🗳️</div>
                                        <div class="quick-action-text">Voting</div>
                                    </button>
                                    <button class="quick-action-btn" onclick="ComponentRouter.navigateTo('profile')">
                                        <div class="quick-action-icon">👤</div>
                                        <div class="quick-action-text">Profile</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Your Activity Card -->
                        <div class="dashboard-card stats-card">
                            <div class="card-header">
                                <h3>📊 Your Activity</h3>
                            </div>
                            <div class="card-content">
                                <div class="activity-stats-grid">
                                    <div class="activity-stat">
                                        <div class="activity-stat-number">${stats.forumPosts}</div>
                                        <div class="activity-stat-label">Forum Posts</div>
                                    </div>
                                    <div class="activity-stat">
                                        <div class="activity-stat-number">${stats.forumReplies}</div>
                                        <div class="activity-stat-label">Replies</div>
                                    </div>
                                    <div class="activity-stat">
                                        <div class="activity-stat-number">${stats.electionsVoted}</div>
                                        <div class="activity-stat-label">Elections Voted</div>
                                    </div>
                                    <div class="activity-stat">
                                        <div class="activity-stat-number">${stats.pollsAnswered}</div>
                                        <div class="activity-stat-label">Polls Answered</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Upcoming Items Card -->
                        <div class="dashboard-card upcoming-card">
                            <div class="card-header">
                                <h3>📅 Upcoming</h3>
                            </div>
                            <div class="card-content">
                                ${upcomingItems.length === 0 ? 
                                    '<div class="empty-state">📆 No upcoming events or deadlines</div>' :
                                    `
                                    <div class="upcoming-list">
                                        ${upcomingItems.slice(0, 3).map(item => `
                                            <div class="upcoming-item">
                                                <div class="upcoming-icon">${item.icon}</div>
                                                <div class="upcoming-info">
                                                    <div class="upcoming-main">
                                                        <div class="upcoming-title">${item.title}</div>
                                                    </div>
                                                    <div class="upcoming-date">${UIUtils.formatDate(item.date, { hour: undefined, minute: undefined })}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    `
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Column 2: Recent Activity, School Community -->
                    <div class="dashboard-column column-2">
                        <!-- Recent Activity Card -->
                        <div class="dashboard-card recent-activity-card">
                            <div class="card-header">
                                <h3>⚡ Recent Activity</h3>
                            </div>
                            <div class="card-content">
                                ${recentActivity.length === 0 ? 
                                    '<div class="empty-state">🌟 Start participating to see your activity here!</div>' :
                                    `
                                    <div class="activity-list">
                                        ${recentActivity.slice(0, 3).map(activity => `
                                            <div class="activity-item">
                                                <div class="activity-icon">${activity.icon}</div>
                                                <div class="activity-info">
                                                    <div class="activity-main">
                                                        <div class="activity-title">${activity.title}</div>
                                                    </div>
                                                    <div class="activity-time">${UIUtils.getRelativeTime(activity.timestamp)}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                    `
                                }
                            </div>
                        </div>

                        <!-- School Community Card -->
                        <div class="dashboard-card school-stats-card">
                            <div class="card-header">
                                <h3>🏫 School Community</h3>
                            </div>
                            <div class="card-content">
                                <div class="school-stats-grid">
                                    <div class="school-stat">
                                        <div class="school-stat-number">${quickStats.totalPosts}</div>
                                        <div class="school-stat-label">Forum Posts</div>
                                    </div>
                                    <div class="school-stat">
                                        <div class="school-stat-number">${quickStats.totalUsers}</div>
                                        <div class="school-stat-label">Active Users</div>
                                    </div>
                                    <div class="school-stat">
                                        <div class="school-stat-number">${quickStats.activeElections}</div>
                                        <div class="school-stat-label">Active Elections</div>
                                    </div>
                                    <div class="school-stat">
                                        <div class="school-stat-number">${quickStats.activePolls}</div>
                                        <div class="school-stat-label">Active Polls</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render error state
     */
    renderError() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="dashboard-error">
                <div class="error-icon">⚠️</div>
                <h2>Unable to Load Dashboard</h2>
                <p>There was an error loading your dashboard data. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
    
    /**
     * Get user initials
     */
    getUserInitials() {
        const firstName = this.user.profile?.firstName || this.user.firstName || '';
        const lastName = this.user.profile?.lastName || this.user.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    }

    /**
     * Get user avatar HTML
     * @param {string} size - Size class (small, medium, large)
     * @returns {string} Avatar HTML
     */
    getUserAvatar(size = 'large') {
        const profileImage = this.user.profile?.profileImage || this.user.profileImage;
        
        if (profileImage) {
            return `<img src="${profileImage}" alt="${this.user.profile?.displayName || this.user.displayName || 'User'}" class="user-avatar-image ${size}">`;
        } else {
            return `<div class="user-avatar ${size}">${this.getUserInitials()}</div>`;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add click handlers for interactive elements
        document.querySelectorAll('.notification-item').forEach(item => {
            item.style.cursor = 'pointer';
        });
        
        // Add hover effects for stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Add click handlers for dashboard cards
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Add animation to stats numbers
        this.animateStatNumbers();
    }
    
    /**
     * Animate stat numbers
     */
    animateStatNumbers() {
        document.querySelectorAll('.stat-number').forEach(element => {
            const target = parseInt(element.textContent);
            const duration = 1000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        });
    }
    
    /**
     * Start auto refresh
     */
    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(async () => {
            try {
                await this.loadDashboardData();
                this.render();
                this.setupEventListeners();
            } catch (error) {
                console.error('Dashboard auto-refresh error:', error);
            }
        }, 5 * 60 * 1000);
    }
    
    /**
     * Stop auto refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    /**
     * Destroy dashboard
     */
    destroy() {
        this.stopAutoRefresh();
    }
}

// Export for use in other modules
window.Dashboard = Dashboard;