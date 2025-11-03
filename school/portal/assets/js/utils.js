// ===== SNHS PORTAL UTILITIES =====

/**
 * Session Management Utilities
 */
const SessionManager = {
    // Session timeout in milliseconds (2 hours)
    SESSION_TIMEOUT: 2 * 60 * 60 * 1000,
    
    /**
     * Validate current session
     * @returns {Object|null} User data if session is valid, null otherwise
     */
    validateSession() {
        try {
            const sessionData = sessionStorage.getItem('snhs_user_session');
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // Check if session has expired
            if (now > session.expiresAt) {
                this.clearSession();
                return null;
            }
            
            // Update last activity
            session.lastActivity = now;
            session.expiresAt = now + this.SESSION_TIMEOUT;
            sessionStorage.setItem('snhs_user_session', JSON.stringify(session));
            
            return session.userData;
        } catch (error) {
            console.error('Session validation error:', error);
            this.clearSession();
            return null;
        }
    },
    
    /**
     * Create new session
     * @param {Object} userData - User data from login
     */
    createSession(userData) {
        const now = Date.now();
        const session = {
            userData,
            loginTime: now,
            lastActivity: now,
            expiresAt: now + this.SESSION_TIMEOUT,
            sessionId: this.generateSessionId()
        };
        
        sessionStorage.setItem('snhs_user_session', JSON.stringify(session));
    },
    
    /**
     * Clear current session
     */
    clearSession() {
        sessionStorage.removeItem('snhs_user_session');
        localStorage.removeItem('snhs_portal_preferences');
    },
    
    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },
    
    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = '../login.html';
    }
};

/**
 * Data Management Utilities
 */
const DataManager = {
    // Data file paths
    DATA_PATHS: {
        users: './assets/data/users.json',
        forumPosts: './assets/data/forum-posts.json',
        elections: './assets/data/elections.json',
        polls: './assets/data/polls.json'
    },
    
    /**
     * Load data from JSON file or localStorage
     * @param {string} key - Data key
     * @param {string} fallbackFile - Fallback JSON file path
     * @returns {Promise<any>} Data
     */
    async loadData(key, fallbackFile = null) {
        try {
            // Try to load from localStorage first
            const localData = localStorage.getItem(`snhs_portal_${key}`);
            if (localData) {
                const parsedData = JSON.parse(localData);
                // Check if data is not too old (24 hours)
                if (parsedData._timestamp && Date.now() - parsedData._timestamp < 24 * 60 * 60 * 1000) {
                    return parsedData;
                }
            }
            
            // Fallback to JSON file if provided
            if (fallbackFile) {
                const response = await fetch(fallbackFile);
                if (response.ok) {
                    const data = await response.json();
                    // Add timestamp and cache in localStorage
                    data._timestamp = Date.now();
                    this.saveData(key, data);
                    return data;
                }
            }
            
            return null;
        } catch (error) {
            console.error(`Error loading data for ${key}:`, error);
            return null;
        }
    },
    
    /**
     * Save data to localStorage
     * @param {string} key - Data key
     * @param {any} data - Data to save
     */
    saveData(key, data) {
        try {
            // Add timestamp to track data freshness
            const dataWithTimestamp = { ...data, _timestamp: Date.now() };
            localStorage.setItem(`snhs_portal_${key}`, JSON.stringify(dataWithTimestamp));
        } catch (error) {
            console.error(`Error saving data for ${key}:`, error);
        }
    },
    
    /**
     * Clear cached data
     * @param {string} key - Data key to clear, or null to clear all
     */
    clearCache(key = null) {
        try {
            if (key) {
                localStorage.removeItem(`snhs_portal_${key}`);
            } else {
                // Clear all portal data
                const keys = Object.keys(localStorage);
                keys.forEach(k => {
                    if (k.startsWith('snhs_portal_')) {
                        localStorage.removeItem(k);
                    }
                });
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },
    
    /**
     * Load user data
     * @returns {Promise<Object>} Users data
     */
    async loadUsers() {
        return await this.loadData('users', this.DATA_PATHS.users);
    },
    
    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User data
     */
    async getUserById(userId) {
        const usersData = await this.loadUsers();
        if (usersData && usersData.users) {
            return usersData.users.find(user => user.id === userId) || null;
        }
        return null;
    },
    
    /**
     * Update user data
     * @param {string} userId - User ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<boolean>} Success status
     */
    async updateUser(userId, updates) {
        try {
            const usersData = await this.loadUsers();
            if (usersData && usersData.users) {
                const userIndex = usersData.users.findIndex(user => user.id === userId);
                if (userIndex !== -1) {
                    // Merge updates with existing user data
                    usersData.users[userIndex] = { ...usersData.users[userIndex], ...updates };
                    this.saveData('users', usersData);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    },
    
    /**
     * Load forum posts data
     * @returns {Promise<Object>} Forum posts data
     */
    async loadForumPosts() {
        return await this.loadData('forumPosts', this.DATA_PATHS.forumPosts);
    },
    
    /**
     * Get forum posts by category
     * @param {string} category - Category filter ('all' for all categories)
     * @returns {Promise<Array>} Filtered posts
     */
    async getForumPostsByCategory(category = 'all') {
        const forumData = await this.loadForumPosts();
        if (forumData && forumData.posts) {
            if (category === 'all') {
                return forumData.posts;
            }
            return forumData.posts.filter(post => post.category === category);
        }
        return [];
    },
    
    /**
     * Add new forum post
     * @param {Object} postData - Post data
     * @returns {Promise<string|null>} New post ID or null if failed
     */
    async addForumPost(postData) {
        try {
            const forumData = await this.loadForumPosts();
            if (forumData) {
                const newPost = {
                    id: this.generateId('post'),
                    ...postData,
                    timestamp: new Date().toISOString(),
                    lastActivity: new Date().toISOString(),
                    views: 0,
                    likes: 0,
                    replies: []
                };
                
                forumData.posts.unshift(newPost); // Add to beginning
                forumData.stats.totalPosts++;
                
                this.saveData('forumPosts', forumData);
                return newPost.id;
            }
            return null;
        } catch (error) {
            console.error('Error adding forum post:', error);
            return null;
        }
    },
    
    /**
     * Add reply to forum post
     * @param {string} postId - Post ID
     * @param {Object} replyData - Reply data
     * @returns {Promise<string|null>} New reply ID or null if failed
     */
    async addForumReply(postId, replyData) {
        try {
            const forumData = await this.loadForumPosts();
            if (forumData) {
                const postIndex = forumData.posts.findIndex(post => post.id === postId);
                if (postIndex !== -1) {
                    const newReply = {
                        id: this.generateId('reply'),
                        ...replyData,
                        timestamp: new Date().toISOString(),
                        likes: 0
                    };
                    
                    forumData.posts[postIndex].replies.push(newReply);
                    forumData.posts[postIndex].lastActivity = new Date().toISOString();
                    forumData.stats.totalReplies++;
                    
                    this.saveData('forumPosts', forumData);
                    return newReply.id;
                }
            }
            return null;
        } catch (error) {
            console.error('Error adding forum reply:', error);
            return null;
        }
    },
    
    /**
     * Load elections data
     * @returns {Promise<Object>} Elections data
     */
    async loadElections() {
        return await this.loadData('elections', this.DATA_PATHS.elections);
    },
    
    /**
     * Get active elections
     * @returns {Promise<Array>} Active elections
     */
    async getActiveElections() {
        const electionsData = await this.loadElections();
        if (electionsData && electionsData.elections) {
            return electionsData.elections.filter(election => election.status === 'active');
        }
        return [];
    },
    
    /**
     * Cast vote in election
     * @param {string} userId - User ID
     * @param {string} electionId - Election ID
     * @param {Object} votes - Votes object {positionId: candidateId}
     * @returns {Promise<boolean>} Success status
     */
    async castVote(userId, electionId, votes) {
        try {
            const electionsData = await this.loadElections();
            if (electionsData) {
                // Check if user already voted
                const userHistory = electionsData.votingHistory.find(h => h.userId === userId);
                if (userHistory && userHistory.elections.some(e => e.electionId === electionId)) {
                    return false; // Already voted
                }
                
                // Find election
                const electionIndex = electionsData.elections.findIndex(e => e.id === electionId);
                if (electionIndex !== -1 && electionsData.elections[electionIndex].status === 'active') {
                    // Record votes
                    Object.entries(votes).forEach(([positionId, candidateId]) => {
                        if (electionsData.elections[electionIndex].results.positions[positionId]) {
                            electionsData.elections[electionIndex].results.positions[positionId][candidateId]++;
                        }
                    });
                    
                    electionsData.elections[electionIndex].results.totalVotes++;
                    
                    // Update voting history
                    if (!userHistory) {
                        electionsData.votingHistory.push({
                            userId,
                            elections: []
                        });
                    }
                    
                    const userHistoryIndex = electionsData.votingHistory.findIndex(h => h.userId === userId);
                    electionsData.votingHistory[userHistoryIndex].elections.push({
                        electionId,
                        votedAt: new Date().toISOString(),
                        positions: votes
                    });
                    
                    this.saveData('elections', electionsData);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error casting vote:', error);
            return false;
        }
    },
    
    /**
     * Load polls data
     * @returns {Promise<Object>} Polls data
     */
    async loadPolls() {
        return await this.loadData('polls', this.DATA_PATHS.polls);
    },
    
    /**
     * Get active polls
     * @returns {Promise<Array>} Active polls
     */
    async getActivePolls() {
        const pollsData = await this.loadPolls();
        if (pollsData && pollsData.polls) {
            return pollsData.polls.filter(poll => poll.status === 'active');
        }
        return [];
    },
    
    /**
     * Submit poll response
     * @param {string} userId - User ID
     * @param {string} pollId - Poll ID
     * @param {Array} selectedOptions - Selected option IDs
     * @returns {Promise<boolean>} Success status
     */
    async submitPollResponse(userId, pollId, selectedOptions) {
        try {
            const pollsData = await this.loadPolls();
            if (pollsData) {
                // Check if user already responded
                const userResponses = pollsData.pollResponses.find(r => r.userId === userId);
                if (userResponses && userResponses.responses.some(r => r.pollId === pollId)) {
                    // Update existing response
                    const responseIndex = userResponses.responses.findIndex(r => r.pollId === pollId);
                    const oldOptions = userResponses.responses[responseIndex].selectedOptions;
                    
                    // Remove old votes
                    const pollIndex = pollsData.polls.findIndex(p => p.id === pollId);
                    if (pollIndex !== -1) {
                        oldOptions.forEach(optionId => {
                            const optionIndex = pollsData.polls[pollIndex].options.findIndex(o => o.id === optionId);
                            if (optionIndex !== -1) {
                                pollsData.polls[pollIndex].options[optionIndex].votes--;
                                pollsData.polls[pollIndex].totalVotes--;
                            }
                        });
                        
                        // Add new votes
                        selectedOptions.forEach(optionId => {
                            const optionIndex = pollsData.polls[pollIndex].options.findIndex(o => o.id === optionId);
                            if (optionIndex !== -1) {
                                pollsData.polls[pollIndex].options[optionIndex].votes++;
                                pollsData.polls[pollIndex].totalVotes++;
                            }
                        });
                        
                        // Update percentages
                        this.updatePollPercentages(pollsData.polls[pollIndex]);
                        
                        // Update response record
                        userResponses.responses[responseIndex] = {
                            pollId,
                            selectedOptions,
                            respondedAt: new Date().toISOString()
                        };
                    }
                } else {
                    // New response
                    const pollIndex = pollsData.polls.findIndex(p => p.id === pollId);
                    if (pollIndex !== -1 && pollsData.polls[pollIndex].status === 'active') {
                        // Add votes
                        selectedOptions.forEach(optionId => {
                            const optionIndex = pollsData.polls[pollIndex].options.findIndex(o => o.id === optionId);
                            if (optionIndex !== -1) {
                                pollsData.polls[pollIndex].options[optionIndex].votes++;
                                pollsData.polls[pollIndex].totalVotes++;
                            }
                        });
                        
                        // Update percentages
                        this.updatePollPercentages(pollsData.polls[pollIndex]);
                        
                        // Add to response history
                        if (!userResponses) {
                            pollsData.pollResponses.push({
                                userId,
                                responses: []
                            });
                        }
                        
                        const userResponseIndex = pollsData.pollResponses.findIndex(r => r.userId === userId);
                        pollsData.pollResponses[userResponseIndex].responses.push({
                            pollId,
                            selectedOptions,
                            respondedAt: new Date().toISOString()
                        });
                    }
                }
                
                this.saveData('polls', pollsData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error submitting poll response:', error);
            return false;
        }
    },
    
    /**
     * Update poll percentages
     * @param {Object} poll - Poll object
     */
    updatePollPercentages(poll) {
        if (poll.totalVotes > 0) {
            poll.options.forEach(option => {
                option.percentage = Math.round((option.votes / poll.totalVotes) * 100 * 10) / 10;
            });
        }
    },
    
    /**
     * Get user's voting history
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Voting history
     */
    async getUserVotingHistory(userId) {
        const electionsData = await this.loadElections();
        const pollsData = await this.loadPolls();
        
        const history = {
            elections: [],
            polls: []
        };
        
        if (electionsData) {
            const userElectionHistory = electionsData.votingHistory.find(h => h.userId === userId);
            if (userElectionHistory) {
                history.elections = userElectionHistory.elections;
            }
        }
        
        if (pollsData) {
            const userPollHistory = pollsData.pollResponses.find(r => r.userId === userId);
            if (userPollHistory) {
                history.polls = userPollHistory.responses;
            }
        }
        
        return history;
    },
    
    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Get notification data for user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Notification data
     */
    async getNotifications(userId) {
        try {
            const forumData = await this.loadForumPosts();
            const electionsData = await this.loadElections();
            const pollsData = await this.loadPolls();
            
            const notifications = {
                unreadForumReplies: 0,
                newElections: 0,
                newPolls: 0,
                total: 0
            };
            
            // Count unread forum replies (simplified - in real app would track read status)
            if (forumData) {
                const userPosts = forumData.posts.filter(post => post.author.id === userId);
                notifications.unreadForumReplies = userPosts.reduce((count, post) => count + post.replies.length, 0);
            }
            
            // Count new elections user hasn't voted in
            if (electionsData) {
                const userHistory = electionsData.votingHistory.find(h => h.userId === userId);
                const votedElectionIds = userHistory ? userHistory.elections.map(e => e.electionId) : [];
                notifications.newElections = electionsData.elections.filter(e => 
                    e.status === 'active' && !votedElectionIds.includes(e.id)
                ).length;
            }
            
            // Count new polls user hasn't responded to
            if (pollsData) {
                const userResponses = pollsData.pollResponses.find(r => r.userId === userId);
                const respondedPollIds = userResponses ? userResponses.responses.map(r => r.pollId) : [];
                notifications.newPolls = pollsData.polls.filter(p => 
                    p.status === 'active' && !respondedPollIds.includes(p.id)
                ).length;
            }
            
            notifications.total = notifications.unreadForumReplies + notifications.newElections + notifications.newPolls;
            
            return notifications;
        } catch (error) {
            console.error('Error getting notifications:', error);
            return { unreadForumReplies: 0, newElections: 0, newPolls: 0, total: 0 };
        }
    }
};

/**
 * UI Utilities
 */
const UIUtils = {
    /**
     * Show toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {string} title - Optional title
     * @param {number} duration - Duration in milliseconds (default 5 seconds)
     */
    showToast(message, type = 'info', title = '', duration = 5000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
            error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
            warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
            info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        };
        
        toast.innerHTML = `
            <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                ${icons[type] || icons.info}
            </svg>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }
    },
    
    /**
     * Show loading state
     * @param {HTMLElement} element - Element to show loading state
     * @param {string} text - Loading text
     */
    showLoading(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.dataset.originalContent = originalContent;
        element.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
                <span>${text}</span>
            </div>
        `;
        element.disabled = true;
    },
    
    /**
     * Hide loading state
     * @param {HTMLElement} element - Element to hide loading state
     */
    hideLoading(element) {
        const originalContent = element.dataset.originalContent;
        if (originalContent) {
            element.innerHTML = originalContent;
            delete element.dataset.originalContent;
        }
        element.disabled = false;
    },
    
    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },
    
    /**
     * Get relative time (e.g., "2 hours ago")
     * @param {string|Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now - dateObj;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(dateObj, { hour: undefined, minute: undefined });
    },
    
    /**
     * Sanitize HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

/**
 * Form Validation Utilities
 */
const ValidationUtils = {
    /**
     * Validate required field
     * @param {string} value - Field value
     * @returns {boolean} Is valid
     */
    required(value) {
        return value && value.trim().length > 0;
    },
    
    /**
     * Validate minimum length
     * @param {string} value - Field value
     * @param {number} minLength - Minimum length
     * @returns {boolean} Is valid
     */
    minLength(value, minLength) {
        return value && value.trim().length >= minLength;
    },
    
    /**
     * Validate maximum length
     * @param {string} value - Field value
     * @param {number} maxLength - Maximum length
     * @returns {boolean} Is valid
     */
    maxLength(value, maxLength) {
        return !value || value.trim().length <= maxLength;
    },
    
    /**
     * Show field error
     * @param {HTMLElement} field - Form field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    },
    
    /**
     * Clear field error
     * @param {HTMLElement} field - Form field
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
};

/**
 * Component Router for SPA navigation
 */
const ComponentRouter = {
    currentSection: 'dashboard',
    
    /**
     * Initialize router and restore last section
     */
    init() {
        // Restore last visited section from localStorage
        const lastSection = localStorage.getItem('snhs_portal_last_section');
        if (lastSection && ['dashboard', 'activities', 'forum', 'voting', 'profile'].includes(lastSection)) {
            this.currentSection = lastSection;
        }
    },
    
    /**
     * Navigate to section
     * @param {string} section - Section name
     */
    navigateTo(section) {
        if (this.currentSection === section) return;
        
        // Update navigation state (both navbar and sidebar)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });
        
        // Set active state for both desktop navbar and mobile sidebar
        const activeNavItems = document.querySelectorAll(`[data-section="${section}"]`);
        activeNavItems.forEach(item => {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        });
        
        // Save current section to localStorage
        localStorage.setItem('snhs_portal_last_section', section);
        
        // Load section content
        this.loadSection(section);
        this.currentSection = section;
        
        // Update page title
        document.title = `SNHS Student Portal - ${section.charAt(0).toUpperCase() + section.slice(1)}`;
    },
    
    /**
     * Load section content
     * @param {string} section - Section name
     */
    async loadSection(section) {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading ${section}...</span>
            </div>
        `;
        
        try {
            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Load section-specific content
            switch (section) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'activities':
                    await this.loadActivities();
                    break;
                case 'forum':
                    await this.loadForum();
                    break;
                case 'voting':
                    await this.loadVoting();
                    break;
                case 'profile':
                    await this.loadProfile();
                    break;
                default:
                    contentArea.innerHTML = '<div>Section not found</div>';
            }
        } catch (error) {
            console.error(`Error loading section ${section}:`, error);
            contentArea.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h3>Error Loading Content</h3>
                    <p>There was an error loading this section. Please try again.</p>
                    <button onclick="ComponentRouter.loadSection('${section}')" class="btn btn-primary">Retry</button>
                </div>
            `;
        }
    },
    
    /**
     * Load dashboard content
     */
    async loadDashboard() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading dashboard...</span>
            </div>
        `;
        
        try {
            // Get current user data
            const userData = SessionManager.validateSession();
            if (!userData) {
                throw new Error('No user session found');
            }
            
            // Initialize and render dashboard
            const dashboard = new Dashboard(userData);
            await dashboard.init();
            
            // Store dashboard instance for cleanup
            if (window.currentDashboard) {
                window.currentDashboard.destroy();
            }
            window.currentDashboard = dashboard;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            contentArea.innerHTML = `
                <div class="dashboard-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Unable to Load Dashboard</h2>
                    <p>There was an error loading your dashboard. Please try refreshing the page.</p>
                    <button class="btn btn-primary" onclick="ComponentRouter.loadDashboard()">Try Again</button>
                </div>
            `;
        }
    },
    
    /**
     * Load activities content
     */
    async loadActivities() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading activities...</span>
            </div>
        `;
        
        try {
            // Get current user data
            const userData = SessionManager.validateSession();
            if (!userData) {
                throw new Error('No user session found');
            }
            
            // Check if ActivitiesInterface is available
            if (typeof ActivitiesInterface === 'undefined') {
                // Wait a bit for scripts to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (typeof ActivitiesInterface === 'undefined') {
                    // Show a temporary placeholder
                    contentArea.innerHTML = `
                        <div class="activities-system">
                            <div class="activities-header">
                                <div class="activities-title">
                                    <h1>📚 Activities & Exams</h1>
                                    <p>Complete assignments, take exams, and track your academic progress</p>
                                </div>
                            </div>
                            
                            <div class="content-card">
                                <div class="card-header">
                                    <h3>📚 Activity System</h3>
                                </div>
                                <div class="card-content">
                                    <div class="activities-sections">
                                        <div class="activity-section">
                                            <h4>📝 My Activities</h4>
                                            <p>View and complete your assigned activities and exams</p>
                                            <span class="status-badge active">3 Pending</span>
                                        </div>
                                        <div class="activity-section">
                                            <h4>📊 Results & Grades</h4>
                                            <p>Check your grades and feedback from completed activities</p>
                                            <span class="status-badge info">View Results</span>
                                        </div>
                                        <div class="activity-section">
                                            <h4>🎯 Progress Tracking</h4>
                                            <p>Monitor your academic progress and performance</p>
                                            <span class="status-badge success">85% Average</span>
                                        </div>
                                    </div>
                                    <p><em>The activity system is loading. Please refresh the page if this message persists.</em></p>
                                    <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
            }
            
            // Initialize and render activities interface
            const activitiesInterface = new ActivitiesInterface(userData);
            await activitiesInterface.init();
            
            // Store activities interface instance for cleanup
            if (window.currentActivitiesInterface) {
                window.currentActivitiesInterface.destroy?.();
            }
            window.currentActivitiesInterface = activitiesInterface;
            
        } catch (error) {
            console.error('Error loading activities:', error);
            contentArea.innerHTML = `
                <div class="activities-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Unable to Load Activities</h2>
                    <p>There was an error loading the activities system: ${error.message}</p>
                    <button class="btn btn-primary" onclick="ComponentRouter.loadActivities()">Try Again</button>
                    <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-left: 1rem;">Refresh Page</button>
                </div>
            `;
        }
    },

    /**
     * Load forum content
     */
    async loadForum() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading forum...</span>
            </div>
        `;
        
        try {
            // Get current user data
            const userData = SessionManager.validateSession();
            if (!userData) {
                throw new Error('No user session found');
            }
            
            // Initialize and render forum
            const forum = new Forum(userData);
            await forum.init();
            
            // Store forum instance for cleanup
            if (window.currentForum) {
                // Clean up previous forum instance if needed
                window.currentForum = null;
            }
            window.currentForum = forum;
            
        } catch (error) {
            console.error('Error loading forum:', error);
            contentArea.innerHTML = `
                <div class="forum-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Unable to Load Forum</h2>
                    <p>There was an error loading the forum. Please try refreshing the page.</p>
                    <button class="btn btn-primary" onclick="ComponentRouter.loadForum()">Try Again</button>
                </div>
            `;
        }
    },
    
    /**
     * Load voting content
     */
    async loadVoting() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading voting system...</span>
            </div>
        `;
        
        try {
            // Check if VotingSystem is available
            if (typeof VotingSystem === 'undefined') {
                // Wait a bit for scripts to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (typeof VotingSystem === 'undefined') {
                    // Show a temporary placeholder instead of throwing error
                    contentArea.innerHTML = `
                        <div class="voting-system">
                            <div class="voting-header">
                                <div class="voting-title">
                                    <h1>🗳️ Elections & Polls</h1>
                                    <p>Participate in school elections and share your opinions through polls</p>
                                </div>
                            </div>
                            
                            <div class="content-card">
                                <div class="card-header">
                                    <h3>🗳️ Voting System</h3>
                                </div>
                                <div class="card-content">
                                    <div class="voting-sections">
                                        <div class="voting-section">
                                            <h4>📊 Student Government Elections</h4>
                                            <p>Vote for your student representatives and leaders</p>
                                            <span class="status-badge upcoming">Upcoming: March 2025</span>
                                        </div>
                                        <div class="voting-section">
                                            <h4>📋 School Polls</h4>
                                            <p>Share your opinion on various school topics and decisions</p>
                                            <span class="status-badge active">4 Active Polls</span>
                                        </div>
                                    </div>
                                    <p><em>The voting system is loading. Please refresh the page if this message persists.</em></p>
                                    <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
            }
            
            // Get current user data
            const userData = SessionManager.validateSession();
            if (!userData) {
                throw new Error('No user session found');
            }
            
            // Initialize and render voting system
            const votingSystem = new VotingSystem(userData);
            await votingSystem.init();
            
            // Store voting system instance for cleanup
            if (window.currentVotingSystem) {
                // Clean up previous voting system instance if needed
                window.currentVotingSystem = null;
            }
            window.currentVotingSystem = votingSystem;
            
        } catch (error) {
            console.error('Error loading voting system:', error);
            contentArea.innerHTML = `
                <div class="voting-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Unable to Load Voting System</h2>
                    <p>There was an error loading the voting system: ${error.message}</p>
                    <button class="btn btn-primary" onclick="ComponentRouter.loadVoting()">Try Again</button>
                    <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-left: 1rem;">Refresh Page</button>
                </div>
            `;
        }
    },
    
    /**
     * Load profile content
     */
    async loadProfile() {
        const contentArea = document.getElementById('contentArea');
        
        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem;">Loading profile...</span>
            </div>
        `;
        
        try {
            // Check if ProfileManager is available
            if (typeof ProfileManager === 'undefined') {
                // Wait a bit for scripts to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (typeof ProfileManager === 'undefined') {
                    // Show a temporary placeholder instead of throwing error
                    contentArea.innerHTML = `
                        <div class="profile-manager">
                            <div class="profile-header">
                                <div class="profile-title">
                                    <h1>👤 My Profile</h1>
                                    <p>Manage your profile information and preferences</p>
                                </div>
                            </div>
                            
                            <div class="content-card">
                                <div class="card-header">
                                    <h3>👤 Profile Management</h3>
                                </div>
                                <div class="card-content">
                                    <div class="profile-sections">
                                        <div class="profile-section">
                                            <h4>📝 Personal Information</h4>
                                            <p>View and edit your display name and bio</p>
                                        </div>
                                        <div class="profile-section">
                                            <h4>🎓 Academic Details</h4>
                                            <p>Your grade level, track, and section information</p>
                                        </div>
                                        <div class="profile-section">
                                            <h4>⚙️ Preferences</h4>
                                            <p>Notification settings and portal preferences</p>
                                        </div>
                                    </div>
                                    <p><em>The profile system is loading. Please refresh the page if this message persists.</em></p>
                                    <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }
            }
            
            // Get current user data
            const userData = SessionManager.validateSession();
            if (!userData) {
                throw new Error('No user session found');
            }
            
            // Initialize and render profile manager
            const profileManager = new ProfileManager(userData);
            await profileManager.init();
            
            // Store profile manager instance for cleanup
            if (window.currentProfileManager) {
                // Clean up previous profile manager instance if needed
                window.currentProfileManager = null;
            }
            window.currentProfileManager = profileManager;
            
        } catch (error) {
            console.error('Error loading profile:', error);
            contentArea.innerHTML = `
                <div class="profile-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Unable to Load Profile</h2>
                    <p>There was an error loading your profile: ${error.message}</p>
                    <button class="btn btn-primary" onclick="ComponentRouter.loadProfile()">Try Again</button>
                    <button class="btn btn-secondary" onclick="window.location.reload()" style="margin-left: 1rem;">Refresh Page</button>
                </div>
            `;
        }
    }
};

// Simple VotingSystem fallback if the main class doesn't load
if (typeof VotingSystem === 'undefined') {
    window.VotingSystem = class VotingSystem {
        constructor(userData) {
            this.user = userData;
        }
        
        async init() {
            this.render();
        }
        
        render() {
            const contentArea = document.getElementById('contentArea');
            if (!contentArea) return;
            
            contentArea.innerHTML = `
                <div class="voting-system">
                    <div class="voting-header">
                        <div class="voting-title">
                            <h1>🗳️ Elections & Polls</h1>
                            <p>Participate in school elections and share your opinions through polls</p>
                        </div>
                        <div class="voting-stats">
                            <div class="stat-item">
                                <span class="stat-number">1</span>
                                <span class="stat-label">Active Elections</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">4</span>
                                <span class="stat-label">Active Polls</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">0</span>
                                <span class="stat-label">Elections Voted</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">0</span>
                                <span class="stat-label">Polls Answered</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-card">
                        <div class="card-header">
                            <h3>🗳️ Voting Overview</h3>
                        </div>
                        <div class="card-content">
                            <div class="voting-sections">
                                <div class="voting-section">
                                    <h4>📊 Student Government Elections 2025</h4>
                                    <p>Vote for your student representatives and leaders</p>
                                    <span class="status-badge upcoming">Upcoming: March 2025</span>
                                </div>
                                <div class="voting-section">
                                    <h4>📋 School Polls</h4>
                                    <p>Share your opinion on various school topics and decisions</p>
                                    <span class="status-badge active">4 Active Polls</span>
                                </div>
                                <div class="voting-section">
                                    <h4>📋 Your Voting History</h4>
                                    <p>Track your participation in elections and polls</p>
                                    <span class="status-badge info">View History</span>
                                </div>
                            </div>
                            <p><em>Full voting functionality is available. The system is working with sample data.</em></p>
                        </div>
                    </div>
                </div>
            `;
        }
    };
}

// Export utilities for use in other modules
window.SessionManager = SessionManager;
window.DataManager = DataManager;
window.UIUtils = UIUtils;
window.ValidationUtils = ValidationUtils;
window.ComponentRouter = ComponentRouter;