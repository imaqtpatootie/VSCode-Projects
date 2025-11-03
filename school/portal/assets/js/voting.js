// ===== SNHS PORTAL VOTING SYSTEM COMPONENT =====

/**
 * Voting System Component Class
 */
class VotingSystem {
    constructor(userData) {
        this.user = userData;
        this.electionsData = null;
        this.pollsData = null;
        this.currentTab = 'elections';
        this.selectedVotes = {};
        this.votingHistory = null;
    }
    
    /**
     * Initialize voting system
     */
    async init() {
        try {
            await this.loadVotingData();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Voting system initialization error:', error);
            this.renderError();
        }
    }
    
    /**
     * Load voting data
     */
    async loadVotingData() {
        try {
            const [electionsData, pollsData, votingHistory] = await Promise.all([
                DataManager.loadElections(),
                DataManager.loadPolls(),
                DataManager.getUserVotingHistory(this.user.id)
            ]);
            
            this.electionsData = electionsData;
            this.pollsData = pollsData;
            this.votingHistory = votingHistory;
            
            if (!this.electionsData || !this.pollsData) {
                throw new Error('Failed to load voting data');
            }
        } catch (error) {
            console.error('Error loading voting data:', error);
            throw error;
        }
    }
    
    /**
     * Render voting system
     */
    render() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        const activeElections = this.electionsData.elections.filter(e => e.status === 'active');
        const upcomingElections = this.electionsData.elections.filter(e => e.status === 'upcoming');
        const endedElections = this.electionsData.elections.filter(e => e.status === 'ended');
        const activePolls = this.pollsData.polls.filter(p => p.status === 'active');
        const endedPolls = this.pollsData.polls.filter(p => p.status === 'ended');
        
        contentArea.innerHTML = `
            <div class="voting-system">
                <!-- Voting Header -->
                <div class="voting-header">
                    <div class="voting-title">
                        <h1>🗳️ Elections & Polls</h1>
                        <p>Participate in school elections and share your opinions through polls</p>
                    </div>
                    <div class="voting-stats">
                        <div class="stat-item">
                            <span class="stat-number">${activeElections.length}</span>
                            <span class="stat-label">Active Elections</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${activePolls.length}</span>
                            <span class="stat-label">Active Polls</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.votingHistory.elections.length}</span>
                            <span class="stat-label">Elections Voted</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.votingHistory.polls.length}</span>
                            <span class="stat-label">Polls Answered</span>
                        </div>
                    </div>
                </div>
                
                <!-- Tab Navigation -->
                <div class="tab-navigation">
                    <button class="tab-btn ${this.currentTab === 'elections' ? 'active' : ''}" data-tab="elections">
                        🗳️ Elections
                    </button>
                    <button class="tab-btn ${this.currentTab === 'polls' ? 'active' : ''}" data-tab="polls">
                        📊 Polls
                    </button>
                    <button class="tab-btn ${this.currentTab === 'history' ? 'active' : ''}" data-tab="history">
                        📋 My History
                    </button>
                </div>
                
                <!-- Tab Content -->
                <div class="tab-content">
                    ${this.currentTab === 'elections' ? this.renderElectionsTab(activeElections, upcomingElections, endedElections) : ''}
                    ${this.currentTab === 'polls' ? this.renderPollsTab(activePolls, endedPolls) : ''}
                    ${this.currentTab === 'history' ? this.renderHistoryTab() : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Render elections tab
     */
    renderElectionsTab(activeElections, upcomingElections, endedElections) {
        return `
            <div class="elections-tab">
                ${activeElections.length > 0 ? `
                    <div class="section">
                        <h3>🔴 Active Elections</h3>
                        <div class="elections-grid">
                            ${activeElections.map(election => this.renderElectionCard(election)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${upcomingElections.length > 0 ? `
                    <div class="section">
                        <h3>⏰ Upcoming Elections</h3>
                        <div class="elections-grid">
                            ${upcomingElections.map(election => this.renderElectionCard(election)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${endedElections.length > 0 ? `
                    <div class="section">
                        <h3>✅ Past Elections</h3>
                        <div class="elections-grid">
                            ${endedElections.map(election => this.renderElectionCard(election)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${activeElections.length === 0 && upcomingElections.length === 0 && endedElections.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🗳️</div>
                        <h3>No Elections Available</h3>
                        <p>There are currently no elections to display. Check back later for upcoming student government elections.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Render polls tab
     */
    renderPollsTab(activePolls, endedPolls) {
        return `
            <div class="polls-tab">
                ${activePolls.length > 0 ? `
                    <div class="section">
                        <h3>🔴 Active Polls</h3>
                        <div class="polls-grid">
                            ${activePolls.map(poll => this.renderPollCard(poll)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${endedPolls.length > 0 ? `
                    <div class="section">
                        <h3>📊 Poll Results</h3>
                        <div class="polls-grid">
                            ${endedPolls.slice(0, 5).map(poll => this.renderPollCard(poll)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${activePolls.length === 0 && endedPolls.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <h3>No Polls Available</h3>
                        <p>There are currently no polls to display. Check back later for new school polls.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Render history tab
     */
    renderHistoryTab() {
        const allHistory = [
            ...this.votingHistory.elections.map(e => ({...e, type: 'election'})),
            ...this.votingHistory.polls.map(p => ({...p, type: 'poll'}))
        ].sort((a, b) => new Date(b.votedAt || b.respondedAt) - new Date(a.votedAt || a.respondedAt));
        
        return `
            <div class="history-tab">
                <div class="section">
                    <h3>📋 Your Voting History</h3>
                    ${allHistory.length > 0 ? `
                        <div class="history-list">
                            ${allHistory.map(item => this.renderHistoryItem(item)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <h3>No Voting History</h3>
                            <p>You haven't participated in any elections or polls yet. Start by voting in active elections or answering polls!</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    /**
     * Render election card
     */
    renderElectionCard(election) {
        const hasVoted = this.votingHistory.elections.some(e => e.electionId === election.id);
        const totalCandidates = election.positions.reduce((sum, pos) => sum + pos.candidates.length, 0);
        
        return `
            <div class="election-card ${election.status}" data-election-id="${election.id}">
                <div class="card-header">
                    <div class="election-status ${election.status}">
                        ${election.status === 'active' ? '🔴 Active' : 
                          election.status === 'upcoming' ? '⏰ Upcoming' : '✅ Ended'}
                    </div>
                    ${hasVoted ? '<div class="voted-badge">✅ Voted</div>' : ''}
                </div>
                
                <div class="card-content">
                    <h4>${election.title}</h4>
                    <p>${election.description}</p>
                    
                    <div class="election-info">
                        <div class="info-item">
                            <span class="info-label">Positions:</span>
                            <span class="info-value">${election.positions.length}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Candidates:</span>
                            <span class="info-value">${totalCandidates}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Period:</span>
                            <span class="info-value">
                                ${UIUtils.formatDate(election.startDate, { hour: undefined, minute: undefined })} - 
                                ${UIUtils.formatDate(election.endDate, { hour: undefined, minute: undefined })}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    ${election.status === 'active' ? `
                        ${hasVoted ? `
                            <button class="btn btn-secondary" disabled>Already Voted</button>
                            <button class="btn btn-outline view-results-btn" data-election-id="${election.id}">View Results</button>
                        ` : `
                            <button class="btn btn-primary vote-btn" data-election-id="${election.id}">Vote Now</button>
                        `}
                    ` : election.status === 'ended' ? `
                        <button class="btn btn-outline view-results-btn" data-election-id="${election.id}">View Results</button>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            Opens ${UIUtils.formatDate(election.startDate, { year: undefined })}
                        </button>
                    `}
                </div>
            </div>
        `;
    }
    
    /**
     * Render poll card
     */
    renderPollCard(poll) {
        const hasResponded = this.votingHistory.polls.some(p => p.pollId === poll.id);
        
        return `
            <div class="poll-card ${poll.status}" data-poll-id="${poll.id}">
                <div class="card-header">
                    <div class="poll-status ${poll.status}">
                        ${poll.status === 'active' ? '🔴 Active' : '📊 Ended'}
                    </div>
                    ${hasResponded ? '<div class="voted-badge">✅ Responded</div>' : ''}
                </div>
                
                <div class="card-content">
                    <h4>${poll.title}</h4>
                    <p class="poll-question">${poll.question}</p>
                    <p class="poll-description">${poll.description}</p>
                    
                    <div class="poll-info">
                        <div class="info-item">
                            <span class="info-label">Options:</span>
                            <span class="info-value">${poll.options.length}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Responses:</span>
                            <span class="info-value">${poll.totalVotes}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Closes:</span>
                            <span class="info-value">${UIUtils.formatDate(poll.endDate, { hour: undefined, minute: undefined })}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    ${poll.status === 'active' ? `
                        ${hasResponded ? `
                            <button class="btn btn-secondary change-response-btn" data-poll-id="${poll.id}">Change Response</button>
                            <button class="btn btn-outline view-poll-results-btn" data-poll-id="${poll.id}">View Results</button>
                        ` : `
                            <button class="btn btn-primary participate-btn" data-poll-id="${poll.id}">Participate</button>
                        `}
                    ` : `
                        <button class="btn btn-outline view-poll-results-btn" data-poll-id="${poll.id}">View Results</button>
                    `}
                </div>
            </div>
        `;
    }
    
    /**
     * Render history item
     */
    renderHistoryItem(item) {
        const timestamp = item.votedAt || item.respondedAt;
        const isElection = item.type === 'election';
        
        return `
            <div class="history-item">
                <div class="history-icon">
                    ${isElection ? '🗳️' : '📊'}
                </div>
                <div class="history-content">
                    <div class="history-title">
                        ${isElection ? 'Voted in Election' : 'Responded to Poll'}
                    </div>
                    <div class="history-description">
                        ${isElection ? 
                            `Student Government Elections - ${Object.keys(item.positions || {}).length} position(s)` :
                            'School poll participation'
                        }
                    </div>
                    <div class="history-timestamp">
                        ${UIUtils.getRelativeTime(timestamp)}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.render();
                this.setupEventListeners();
            });
        });
        
        // Vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const electionId = e.target.dataset.electionId;
                UIUtils.showToast(`Voting interface for election ${electionId} - Coming soon!`, 'info');
            });
        });
        
        // Poll participate buttons
        document.querySelectorAll('.participate-btn, .change-response-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pollId = e.target.dataset.pollId;
                UIUtils.showToast(`Poll participation for ${pollId} - Coming soon!`, 'info');
            });
        });
        
        // View results buttons
        document.querySelectorAll('.view-results-btn, .view-poll-results-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.electionId || e.target.dataset.pollId;
                const isElection = !!e.target.dataset.electionId;
                UIUtils.showToast(`${isElection ? 'Election' : 'Poll'} results for ${id} - Coming soon!`, 'info');
            });
        });
    }
    
    /**
     * Render error state
     */
    renderError() {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="voting-error">
                <div class="error-icon">⚠️</div>
                <h2>Unable to Load Voting System</h2>
                <p>There was an error loading the voting data. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Export for use in other modules
window.VotingSystem = VotingSystem;

// Debug log to confirm the script loaded
console.log('VotingSystem class loaded successfully');