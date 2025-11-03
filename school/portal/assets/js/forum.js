// ===== SNHS PORTAL FORUM COMPONENT =====

/**
 * Forum Component Class
 */
class Forum {
    constructor(userData) {
        this.user = userData;
        this.forumData = null;
        this.currentCategory = 'all';
        this.currentSort = 'recent';
        this.searchQuery = '';
        this.currentPage = 1;
        this.postsPerPage = 10;
    }
    
    /**
     * Initialize forum
     */
    async init() {
        try {
            await this.loadForumData();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Forum initialization error:', error);
            this.renderError();
        }
    }
    
    /**
     * Load forum data
     */
    async loadForumData() {
        try {
            this.forumData = await DataManager.loadForumPosts();
            if (!this.forumData) {
                throw new Error('Failed to load forum data');
            }
        } catch (error) {
            console.error('Error loading forum data:', error);
            throw error;
        }
    }
    
    /**
     * Render forum
     */
    render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea || !this.forumData) return;
        
        const filteredPosts = this.getFilteredPosts();
        const paginatedPosts = this.getPaginatedPosts(filteredPosts);
        
        contentArea.innerHTML = `
            <div class="forum">
                <!-- Forum Header -->
                <div class="forum-header">
                    <div class="forum-title">
                        <h1>💬 Community Forum</h1>
                        <p>Connect with your classmates and discuss various topics</p>
                    </div>
                    <button class="btn btn-primary" id="newPostBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Post
                    </button>
                </div>
                
                <!-- Forum Controls -->
                <div class="forum-controls">
                    <div class="forum-filters">
                        <div class="category-filter">
                            <label for="categorySelect">Category:</label>
                            <select id="categorySelect" class="form-select">
                                <option value="all" ${this.currentCategory === 'all' ? 'selected' : ''}>All Categories</option>
                                ${this.forumData.categories.map(cat => 
                                    `<option value="${cat.id}" ${this.currentCategory === cat.id ? 'selected' : ''}>${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="sort-filter">
                            <label for="sortSelect">Sort by:</label>
                            <select id="sortSelect" class="form-select">
                                <option value="recent" ${this.currentSort === 'recent' ? 'selected' : ''}>Most Recent</option>
                                <option value="popular" ${this.currentSort === 'popular' ? 'selected' : ''}>Most Popular</option>
                                <option value="replies" ${this.currentSort === 'replies' ? 'selected' : ''}>Most Replies</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="search-bar">
                        <div class="search-input-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" id="searchInput" class="search-input" placeholder="Search posts..." value="${this.searchQuery}">
                        </div>
                    </div>
                </div>
                
                <!-- Forum Stats -->
                <div class="forum-stats">
                    <div class="stat-item">
                        <span class="stat-number">${this.forumData.stats.totalPosts}</span>
                        <span class="stat-label">Total Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.forumData.stats.totalReplies}</span>
                        <span class="stat-label">Total Replies</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.forumData.stats.activeUsers}</span>
                        <span class="stat-label">Active Users</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${filteredPosts.length}</span>
                        <span class="stat-label">Showing Posts</span>
                    </div>
                </div>
                
                <!-- Posts List -->
                <div class="posts-container">
                    ${paginatedPosts.length === 0 ? 
                        this.renderEmptyState() : 
                        paginatedPosts.map(post => this.renderPost(post)).join('')
                    }
                </div>
                
                <!-- Pagination -->
                ${this.renderPagination(filteredPosts.length)}
            </div>
            
            <!-- New Post Modal -->
            <div id="newPostModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create New Post</h3>
                        <button class="modal-close" id="closeModalBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form id="newPostForm" class="modal-body">
                        <div class="form-group">
                            <label for="postTitle">Title *</label>
                            <input type="text" id="postTitle" class="form-input" placeholder="Enter post title..." required>
                        </div>
                        
                        <div class="form-group">
                            <label for="postCategory">Category *</label>
                            <select id="postCategory" class="form-select" required>
                                <option value="">Select a category</option>
                                ${this.forumData.categories.map(cat => 
                                    `<option value="${cat.id}">${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="postContent">Content *</label>
                            <textarea id="postContent" class="form-textarea" rows="6" placeholder="Write your post content..." required></textarea>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelPostBtn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Post</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Reply Modal -->
            <div id="replyModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reply to Post</h3>
                        <button class="modal-close" id="closeReplyModalBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form id="replyForm" class="modal-body">
                        <div id="replyToPost" class="reply-context"></div>
                        
                        <div class="form-group">
                            <label for="replyContent">Your Reply *</label>
                            <textarea id="replyContent" class="form-textarea" rows="4" placeholder="Write your reply..." required></textarea>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelReplyBtn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Post Reply</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    /**
     * Render individual post
     */
    renderPost(post) {
        const category = this.forumData.categories.find(cat => cat.id === post.category);
        const isUserPost = post.author.id === this.user.id;
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-category" style="background-color: ${category?.color || '#6b7280'}">
                        ${category?.name || 'General'}
                    </div>
                    <div class="post-meta">
                        <span class="post-views">👁️ ${post.views}</span>
                        <span class="post-likes">❤️ ${post.likes}</span>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-excerpt">${this.truncateText(post.content, 200)}</div>
                    
                    <div class="post-author">
                        <div class="author-avatar">
                            ${post.author.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div class="author-info">
                            <div class="author-name">${post.author.displayName}</div>
                            <div class="author-details">${post.author.grade} • ${post.author.track}</div>
                        </div>
                        <div class="post-timestamp">
                            ${UIUtils.getRelativeTime(post.timestamp)}
                        </div>
                    </div>
                </div>
                
                <div class="post-footer">
                    <div class="post-stats">
                        <span class="reply-count">💬 ${post.replies.length} replies</span>
                        <span class="last-activity">Last activity: ${UIUtils.getRelativeTime(post.lastActivity)}</span>
                    </div>
                    
                    <div class="post-actions">
                        <button class="btn-action view-post-btn" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                        </button>
                        <button class="btn-action reply-btn" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Reply
                        </button>
                        ${isUserPost ? `
                            <button class="btn-action edit-btn" data-post-id="${post.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No posts found</h3>
                <p>Be the first to start a discussion in this category!</p>
                <button class="btn btn-primary" onclick="document.getElementById('newPostBtn').click()">
                    Create First Post
                </button>
            </div>
        `;
    }
    
    /**
     * Render pagination
     */
    renderPagination(totalPosts) {
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        if (totalPages <= 1) return '';
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage - 1}">Previous</button>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="page-btn active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `<button class="page-btn" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${this.currentPage + 1}">Next</button>`;
        }
        
        paginationHTML += '</div>';
        return paginationHTML;
    }
    
    /**
     * Get filtered posts
     */
    getFilteredPosts() {
        let posts = [...this.forumData.posts];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            posts = posts.filter(post => post.category === this.currentCategory);
        }
        
        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            posts = posts.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.author.displayName.toLowerCase().includes(query)
            );
        }
        
        // Sort posts
        switch (this.currentSort) {
            case 'popular':
                posts.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
                break;
            case 'replies':
                posts.sort((a, b) => b.replies.length - a.replies.length);
                break;
            case 'recent':
            default:
                posts.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
                break;
        }
        
        return posts;
    }
    
    /**
     * Get paginated posts
     */
    getPaginatedPosts(posts) {
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        return posts.slice(startIndex, endIndex);
    }
    
    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Category filter
        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentPage = 1;
                this.render();
                this.setupEventListeners();
            });
        }
        
        // Sort filter
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.currentPage = 1;
                this.render();
                this.setupEventListeners();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', UIUtils.debounce((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.render();
                this.setupEventListeners();
            }, 300));
        }
        
        // Pagination
        document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(e.target.dataset.page);
                this.render();
                this.setupEventListeners();
            });
        });
        
        // New post button
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.showNewPostModal());
        }
        
        // Modal controls
        this.setupModalEventListeners();
        
        // Post actions
        this.setupPostActionListeners();
    }
    
    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        // New post modal
        const newPostModal = document.getElementById('newPostModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelPostBtn = document.getElementById('cancelPostBtn');
        const newPostForm = document.getElementById('newPostForm');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideNewPostModal());
        }
        
        if (cancelPostBtn) {
            cancelPostBtn.addEventListener('click', () => this.hideNewPostModal());
        }
        
        if (newPostForm) {
            newPostForm.addEventListener('submit', (e) => this.handleNewPost(e));
        }
        
        // Reply modal
        const replyModal = document.getElementById('replyModal');
        const closeReplyModalBtn = document.getElementById('closeReplyModalBtn');
        const cancelReplyBtn = document.getElementById('cancelReplyBtn');
        const replyForm = document.getElementById('replyForm');
        
        if (closeReplyModalBtn) {
            closeReplyModalBtn.addEventListener('click', () => this.hideReplyModal());
        }
        
        if (cancelReplyBtn) {
            cancelReplyBtn.addEventListener('click', () => this.hideReplyModal());
        }
        
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => this.handleReply(e));
        }
        
        // Close modals when clicking outside
        if (newPostModal) {
            newPostModal.addEventListener('click', (e) => {
                if (e.target === newPostModal) this.hideNewPostModal();
            });
        }
        
        if (replyModal) {
            replyModal.addEventListener('click', (e) => {
                if (e.target === replyModal) this.hideReplyModal();
            });
        }
    }
    
    /**
     * Setup post action listeners
     */
    setupPostActionListeners() {
        // View post buttons
        document.querySelectorAll('.view-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.viewPost(postId);
            });
        });
        
        // Reply buttons
        document.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.showReplyModal(postId);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.dataset.postId;
                this.editPost(postId);
            });
        });
    }
    
    /**
     * Show new post modal
     */
    showNewPostModal() {
        const modal = document.getElementById('newPostModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus on title input
            setTimeout(() => {
                const titleInput = document.getElementById('postTitle');
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }
    
    /**
     * Hide new post modal
     */
    hideNewPostModal() {
        const modal = document.getElementById('newPostModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('newPostForm');
            if (form) form.reset();
        }
    }
    
    /**
     * Show reply modal
     */
    showReplyModal(postId) {
        const post = this.forumData.posts.find(p => p.id === postId);
        if (!post) return;
        
        const modal = document.getElementById('replyModal');
        const replyContext = document.getElementById('replyToPost');
        
        if (modal && replyContext) {
            // Set reply context
            replyContext.innerHTML = `
                <div class="reply-context-post">
                    <h4>Replying to: ${post.title}</h4>
                    <p>By ${post.author.displayName} • ${UIUtils.getRelativeTime(post.timestamp)}</p>
                    <div class="context-excerpt">${this.truncateText(post.content, 150)}</div>
                </div>
            `;
            
            // Store post ID for form submission
            modal.dataset.postId = postId;
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus on reply input
            setTimeout(() => {
                const replyInput = document.getElementById('replyContent');
                if (replyInput) replyInput.focus();
            }, 100);
        }
    }
    
    /**
     * Hide reply modal
     */
    hideReplyModal() {
        const modal = document.getElementById('replyModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('replyForm');
            if (form) form.reset();
            
            // Clear post ID
            delete modal.dataset.postId;
        }
    }
    
    /**
     * Handle new post submission
     */
    async handleNewPost(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const content = document.getElementById('postContent').value.trim();
        
        if (!title || !category || !content) {
            UIUtils.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            const postData = {
                title,
                category,
                content,
                author: {
                    id: this.user.id,
                    name: `${this.user.profile.firstName} ${this.user.profile.lastName}`,
                    displayName: this.user.profile.displayName || `${this.user.profile.firstName} ${this.user.profile.lastName.charAt(0)}.`,
                    grade: this.user.profile.grade,
                    track: this.user.profile.track,
                    avatar: null
                }
            };
            
            const newPostId = await DataManager.addForumPost(postData);
            
            if (newPostId) {
                UIUtils.showToast('Post created successfully!', 'success');
                this.hideNewPostModal();
                
                // Reload forum data and refresh
                await this.loadForumData();
                this.render();
                this.setupEventListeners();
            } else {
                UIUtils.showToast('Failed to create post. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Error creating post:', error);
            UIUtils.showToast('Error creating post. Please try again.', 'error');
        }
    }
    
    /**
     * Handle reply submission
     */
    async handleReply(e) {
        e.preventDefault();
        
        const modal = document.getElementById('replyModal');
        const postId = modal?.dataset.postId;
        const content = document.getElementById('replyContent').value.trim();
        
        if (!postId || !content) {
            UIUtils.showToast('Please enter your reply', 'error');
            return;
        }
        
        try {
            const replyData = {
                author: {
                    id: this.user.id,
                    name: `${this.user.profile.firstName} ${this.user.profile.lastName}`,
                    displayName: this.user.profile.displayName || `${this.user.profile.firstName} ${this.user.profile.lastName.charAt(0)}.`,
                    grade: this.user.profile.grade,
                    track: this.user.profile.track,
                    avatar: null
                },
                content
            };
            
            const newReplyId = await DataManager.addForumReply(postId, replyData);
            
            if (newReplyId) {
                UIUtils.showToast('Reply posted successfully!', 'success');
                this.hideReplyModal();
                
                // Reload forum data and refresh
                await this.loadForumData();
                this.render();
                this.setupEventListeners();
            } else {
                UIUtils.showToast('Failed to post reply. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Error posting reply:', error);
            UIUtils.showToast('Error posting reply. Please try again.', 'error');
        }
    }
    
    /**
     * View post (placeholder for detailed view)
     */
    viewPost(postId) {
        const post = this.forumData.posts.find(p => p.id === postId);
        if (post) {
            UIUtils.showToast(`Viewing post: ${post.title}`, 'info');
            // TODO: Implement detailed post view
        }
    }
    
    /**
     * Edit post (placeholder)
     */
    editPost(postId) {
        UIUtils.showToast('Edit functionality coming soon!', 'info');
        // TODO: Implement post editing
    }
    
    /**
     * Render error state
     */
    renderError() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="forum-error">
                <div class="error-icon">⚠️</div>
                <h2>Unable to Load Forum</h2>
                <p>There was an error loading the forum data. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Export for use in other modules
window.Forum = Forum;