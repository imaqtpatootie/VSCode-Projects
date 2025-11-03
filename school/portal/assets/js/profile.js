// ===== SNHS PORTAL PROFILE MANAGEMENT COMPONENT =====

/**
 * Profile Management Component Class
 */
class ProfileManager {
    constructor(userData) {
        this.user = userData;
        this.originalData = JSON.parse(JSON.stringify(userData)); // Deep copy for comparison
        this.isEditing = false;
        this.hasUnsavedChanges = false;
    }
    
    /**
     * Initialize profile manager
     */
    async init() {
        try {
            // Start in view mode by default
            this.isEditing = false;
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Profile manager initialization error:', error);
            this.renderError();
        }
    }
    
    /**
     * Render profile interface
     */
    render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="profile-manager">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="profile-title">
                        <h1>👤 My Profile</h1>
                        <p>${this.isEditing ? 'Edit your profile information and preferences' : 'View and manage your profile information'}</p>
                    </div>
                    <div class="profile-actions">
                        ${!this.isEditing ? `
                            <button class="btn btn-primary" id="editProfileBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                        ` : `
                            <button class="btn btn-success btn-sm" id="saveProfileBtn" ${!this.hasUnsavedChanges ? 'disabled' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" id="cancelEditBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>
                        `}
                    </div>
                </div>
                
                <!-- Profile Content -->
                <div class="profile-content">
                    <!-- Profile Overview Card -->
                    <div class="profile-card main-profile">
                        <div class="card-header">
                            <h3>📋 Profile Information</h3>
                            ${this.hasUnsavedChanges ? '<span class="unsaved-indicator">● Unsaved changes</span>' : ''}
                        </div>
                        <div class="card-content">
                            <div class="profile-avatar-section">
                                <div class="profile-avatar-large">
                                    ${this.getUserInitials()}
                                </div>
                                <div class="avatar-info">
                                    <h4>${this.user.profile.firstName} ${this.user.profile.lastName}</h4>
                                    <p>${this.user.profile.grade} • ${this.user.profile.track}</p>
                                    <p class="student-id">Student ID: ${this.user.profile.studentId}</p>
                                </div>
                            </div>
                            
                            <div class="profile-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="firstName">First Name</label>
                                        <input type="text" id="firstName" class="form-input" 
                                               value="${this.user.profile.firstName}" 
                                               ${!this.isEditing ? 'readonly' : ''}>
                                        <small class="field-note">This field cannot be edited</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="lastName">Last Name</label>
                                        <input type="text" id="lastName" class="form-input" 
                                               value="${this.user.profile.lastName}" 
                                               ${!this.isEditing ? 'readonly' : ''}>
                                        <small class="field-note">This field cannot be edited</small>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="displayName">Display Name *</label>
                                        <input type="text" id="displayName" class="form-input editable" 
                                               value="${this.user.profile.displayName || ''}" 
                                               ${!this.isEditing ? 'readonly' : ''} 
                                               placeholder="How you want to appear in forums">
                                        <small class="field-help">This is how your name appears in forum posts and discussions</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="studentId">Student ID</label>
                                        <input type="text" id="studentId" class="form-input" 
                                               value="${this.user.profile.studentId}" readonly>
                                        <small class="field-note">This field cannot be edited</small>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="grade">Grade Level</label>
                                        <input type="text" id="grade" class="form-input" 
                                               value="${this.user.profile.grade}" readonly>
                                        <small class="field-note">This field cannot be edited</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="track">Academic Track</label>
                                        <input type="text" id="track" class="form-input" 
                                               value="${this.user.profile.track}" readonly>
                                        <small class="field-note">This field cannot be edited</small>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="section">Section</label>
                                    <input type="text" id="section" class="form-input" 
                                           value="${this.user.profile.section}" readonly>
                                    <small class="field-note">This field cannot be edited</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="bio">Bio</label>
                                    <textarea id="bio" class="form-textarea editable" rows="4" 
                                              ${!this.isEditing ? 'readonly' : ''} 
                                              placeholder="Tell us about yourself, your interests, and goals...">${this.user.profile.bio || ''}</textarea>
                                    <small class="field-help">Share your interests, goals, or anything you'd like your classmates to know</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Account Information Card -->
                    <div class="profile-card">
                        <div class="card-header">
                            <h3>🔐 Account Information</h3>
                        </div>
                        <div class="card-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-label">Username</span>
                                    <span class="info-value">${this.user.username}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">User Type</span>
                                    <span class="info-value">${this.user.userType}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Account Created</span>
                                    <span class="info-value">${UIUtils.formatDate(this.user.profile.joinDate, { hour: undefined, minute: undefined })}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Last Login</span>
                                    <span class="info-value">${UIUtils.getRelativeTime(this.user.activity.lastLogin)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Activity Statistics Card -->
                    <div class="profile-card">
                        <div class="card-header">
                            <h3>📊 Activity Statistics</h3>
                        </div>
                        <div class="card-content">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-icon">💬</div>
                                    <div class="stat-content">
                                        <div class="stat-number">${this.user.activity.forumPosts || 0}</div>
                                        <div class="stat-label">Forum Posts</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-icon">🗳️</div>
                                    <div class="stat-content">
                                        <div class="stat-number">${this.user.activity.votesParticipated || 0}</div>
                                        <div class="stat-label">Votes Cast</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-icon">📅</div>
                                    <div class="stat-content">
                                        <div class="stat-number">${this.user.activity.totalLogins || 0}</div>
                                        <div class="stat-label">Total Logins</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-icon">⭐</div>
                                    <div class="stat-content">
                                        <div class="stat-number">${this.calculateEngagementScore()}</div>
                                        <div class="stat-label">Engagement Score</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preferences Card -->
                    <div class="profile-card">
                        <div class="card-header">
                            <h3>⚙️ Preferences</h3>
                        </div>
                        <div class="card-content">
                            <div class="preferences-form">
                                <div class="preference-item">
                                    <div class="preference-info">
                                        <label for="notifications">Email Notifications</label>
                                        <small>Receive email notifications for forum replies and important updates</small>
                                    </div>
                                    <div class="preference-control">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="notifications" 
                                                   ${this.user.preferences.notifications ? 'checked' : ''} 
                                                   ${!this.isEditing ? 'disabled' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="preference-item">
                                    <div class="preference-info">
                                        <label for="emailUpdates">Email Updates</label>
                                        <small>Receive periodic updates about school events and announcements</small>
                                    </div>
                                    <div class="preference-control">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="emailUpdates" 
                                                   ${this.user.preferences.emailUpdates ? 'checked' : ''} 
                                                   ${!this.isEditing ? 'disabled' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
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
     * Get user initials
     */
    getUserInitials() {
        const firstName = this.user.profile.firstName || '';
        const lastName = this.user.profile.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    /**
     * Calculate engagement score
     */
    calculateEngagementScore() {
        const posts = this.user.activity.forumPosts || 0;
        const votes = this.user.activity.votesParticipated || 0;
        const logins = Math.min(this.user.activity.totalLogins || 0, 100); // Cap at 100 for scoring
        
        return Math.round((posts * 10) + (votes * 5) + (logins * 0.5));
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.enableEditing());
        }
        
        // Save profile button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // Cancel edit button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEditing());
        }
        
        // Track changes in editable fields
        document.querySelectorAll('.editable').forEach(field => {
            field.addEventListener('input', () => this.trackChanges());
        });
        
        // Track changes in preference checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.trackChanges());
        });
        
        // Prevent navigation with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }
    

    
    /**
     * Enable editing mode
     */
    enableEditing() {
        this.isEditing = true;
        this.render();
        this.setupEventListeners();
        
        // Focus on first editable field
        setTimeout(() => {
            const firstEditable = document.querySelector('.editable');
            if (firstEditable) firstEditable.focus();
        }, 100);
        
        UIUtils.showToast('Edit mode enabled. Make your changes and click Save.', 'info');
    }
    
    /**
     * Cancel editing mode
     */
    cancelEditing() {
        if (this.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                return;
            }
        }
        
        // Restore original data and go back to view mode
        this.user = JSON.parse(JSON.stringify(this.originalData));
        this.isEditing = false;
        this.hasUnsavedChanges = false;
        
        this.render();
        this.setupEventListeners();
        
        UIUtils.showToast('Changes cancelled', 'info');
    }
    
    /**
     * Track changes in form fields
     */
    trackChanges() {
        const displayName = document.getElementById('displayName').value.trim();
        const bio = document.getElementById('bio').value.trim();
        const notifications = document.getElementById('notifications').checked;
        const emailUpdates = document.getElementById('emailUpdates').checked;
        
        // Check if any values have changed
        const hasChanges = (
            displayName !== (this.originalData.profile.displayName || '') ||
            bio !== (this.originalData.profile.bio || '') ||
            notifications !== this.originalData.preferences.notifications ||
            emailUpdates !== this.originalData.preferences.emailUpdates
        );
        
        if (hasChanges !== this.hasUnsavedChanges) {
            this.hasUnsavedChanges = hasChanges;
            
            // Update save button state
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) {
                saveBtn.disabled = !hasChanges;
            }
            
            // Update unsaved indicator
            const indicator = document.querySelector('.unsaved-indicator');
            if (indicator) {
                indicator.style.display = hasChanges ? 'inline' : 'none';
            }
        }
    }
    
    /**
     * Save profile changes
     */
    async saveProfile() {
        if (!this.hasUnsavedChanges) return;
        
        try {
            // Get form values
            const displayName = document.getElementById('displayName').value.trim();
            const bio = document.getElementById('bio').value.trim();
            const notifications = document.getElementById('notifications').checked;
            const emailUpdates = document.getElementById('emailUpdates').checked;
            
            // Validate required fields
            if (!displayName) {
                UIUtils.showToast('Display name is required', 'error');
                document.getElementById('displayName').focus();
                return;
            }
            
            // Prepare updates
            const updates = {
                profile: {
                    ...this.user.profile,
                    displayName,
                    bio
                },
                preferences: {
                    ...this.user.preferences,
                    notifications,
                    emailUpdates
                }
            };
            
            // Show loading state
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) {
                UIUtils.showLoading(saveBtn, 'Saving...');
            }
            
            // Save to data manager
            const success = await DataManager.updateUser(this.user.id, updates);
            
            if (success) {
                // Update local user data
                this.user.profile = updates.profile;
                this.user.preferences = updates.preferences;
                this.originalData = JSON.parse(JSON.stringify(this.user));
                
                // Exit editing mode and return to view mode
                this.isEditing = false;
                this.hasUnsavedChanges = false;
                
                // Re-render in view mode
                this.render();
                this.setupEventListeners();
                
                UIUtils.showToast('Profile updated successfully!', 'success');
            } else {
                UIUtils.showToast('Failed to save profile. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Error saving profile:', error);
            UIUtils.showToast('Error saving profile. Please try again.', 'error');
        } finally {
            // Hide loading state
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) {
                UIUtils.hideLoading(saveBtn);
            }
        }
    }
    
    /**
     * Render error state
     */
    renderError() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="profile-error">
                <div class="error-icon">⚠️</div>
                <h2>Unable to Load Profile</h2>
                <p>There was an error loading your profile information. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Export for use in other modules
window.ProfileManager = ProfileManager;