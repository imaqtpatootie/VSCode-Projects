// ===== SNHS MODERN LOGIN PORTAL JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== ELEMENTS =====
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('loginBtn');
    const rememberCheckbox = document.getElementById('remember');

    // ===== USER TYPE SELECTION =====
    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update placeholder text based on user type
            const userType = this.dataset.type;
            if (userType === 'student') {
                usernameInput.placeholder = 'Enter your student ID or username';
                usernameInput.setAttribute('aria-label', 'Student ID or Username');
            } else {
                usernameInput.placeholder = 'Enter your staff username';
                usernameInput.setAttribute('aria-label', 'Staff Username');
            }
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // ===== PASSWORD TOGGLE =====
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update icon
        const icon = this.querySelector('svg');
        if (type === 'text') {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            `;
        } else {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            `;
        }
    });

    // ===== FORM VALIDATION =====
    function validateForm() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Reset previous states
        usernameInput.classList.remove('error', 'success');
        passwordInput.classList.remove('error', 'success');
        
        // Remove previous error messages
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        
        let isValid = true;
        
        // Username validation
        if (!username) {
            showFieldError(usernameInput, 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError(usernameInput, 'Username must be at least 3 characters');
            isValid = false;
        } else {
            usernameInput.classList.add('success');
        }
        
        // Password validation
        if (!password) {
            showFieldError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            passwordInput.classList.add('success');
        }
        
        return isValid;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.parentNode.appendChild(errorDiv);
    }

    // ===== FORM SUBMISSION =====
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            userType: document.querySelector('.user-type-btn.active').dataset.type,
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim(),
            remember: rememberCheckbox.checked
        };
        
        // Show loading state
        showLoadingState();
        
        try {
            // Simulate API call
            await simulateLogin(formData);
            
            // Show success state
            showSuccessState();
            
            // Redirect after success
            setTimeout(() => {
                // Create user data object for portal
                const userData = {
                    id: formData.username,
                    username: formData.username,
                    userType: formData.userType,
                    profile: {
                        firstName: formData.userType === 'student' ? 'Juan' : 'Maria',
                        lastName: formData.userType === 'student' ? 'Dela Cruz' : 'Santos',
                        displayName: formData.userType === 'student' ? 'Juan D.' : 'Ms. Santos',
                        studentId: formData.userType === 'student' ? formData.username : null,
                        grade: formData.userType === 'student' ? 'Grade 10' : null,
                        track: formData.userType === 'student' ? 'STEM' : null,
                        section: formData.userType === 'student' ? 'Einstein' : null,
                        bio: '',
                        joinDate: '2024-08-15T00:00:00Z'
                    },
                    preferences: {
                        notifications: true,
                        emailUpdates: false
                    },
                    activity: {
                        lastLogin: new Date().toISOString(),
                        forumPosts: 0,
                        votesParticipated: 0
                    }
                };
                
                // Redirect based on user type
                if (formData.userType === 'student') {
                    // Store user data and redirect to portal
                    sessionStorage.setItem('snhs_user_session', JSON.stringify({
                        userData,
                        loginTime: Date.now(),
                        lastActivity: Date.now(),
                        expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
                        sessionId: 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
                    }));
                    window.location.href = './portal/';
                } else {
                    // Staff users go to a different area (placeholder for now)
                    alert('Staff portal coming soon! Redirecting to main website...');
                    window.location.href = './index.html';
                }
            }, 1500);
            
        } catch (error) {
            showErrorState(error.message);
        }
    });
    
    // ===== LOADING STATES =====
    function showLoadingState() {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').textContent = 'Signing In...';
        
        // Add loading animation to button
        const icon = submitBtn.querySelector('.btn-icon');
        icon.style.animation = 'spin 1s linear infinite';
    }
    
    function showSuccessState() {
        submitBtn.classList.remove('loading');
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        submitBtn.querySelector('.btn-text').textContent = 'Success!';
        
        const icon = submitBtn.querySelector('.btn-icon');
        icon.style.animation = '';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        `;
    }
    
    function showErrorState(message) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
        submitBtn.querySelector('.btn-text').textContent = 'Login Failed';
        
        const icon = submitBtn.querySelector('.btn-icon');
        icon.style.animation = '';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        `;
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.textAlign = 'center';
        errorDiv.style.marginTop = '1rem';
        loginForm.appendChild(errorDiv);
        
        // Reset button after 3 seconds
        setTimeout(() => {
            resetSubmitButton();
            errorDiv.remove();
        }, 3000);
    }
    
    function resetSubmitButton() {
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.querySelector('.btn-text').textContent = 'Sign In';
        
        const icon = submitBtn.querySelector('.btn-icon');
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        `;
    }

    // ===== SIMULATE LOGIN API =====
    async function simulateLogin(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo credentials for testing
                const validCredentials = {
                    student: {
                        'student123': 'password123',
                        '2024-001': 'snhs2024',
                        'juan.delacruz': 'student123'
                    },
                    staff: {
                        'teacher1': 'teacher123',
                        'admin': 'admin123',
                        'principal': 'principal123'
                    }
                };
                
                const userCreds = validCredentials[formData.userType];
                
                if (userCreds && userCreds[formData.username] === formData.password) {
                    resolve({ success: true, user: formData.username });
                } else {
                    reject(new Error('Invalid username or password. Please try again.'));
                }
            }, 2000); // Simulate network delay
        });
    }

    // ===== INPUT ENHANCEMENTS =====
    
    // Add floating label effect
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.parentNode.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentNode.parentNode.classList.add('focused');
        }
    });

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', function(e) {
        // Enter key to submit form
        if (e.key === 'Enter' && !submitBtn.disabled) {
            loginForm.dispatchEvent(new Event('submit'));
        }
        
        // Escape key to clear form
        if (e.key === 'Escape') {
            usernameInput.value = '';
            passwordInput.value = '';
            rememberCheckbox.checked = false;
            usernameInput.focus();
        }
    });

    // ===== REMEMBER ME FUNCTIONALITY =====
    
    // Load saved username if remember me was checked
    const savedUsername = localStorage.getItem('snhs_remembered_username');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = true;
        usernameInput.parentNode.parentNode.classList.add('focused');
    }
    
    // Save username when remember me is checked
    rememberCheckbox.addEventListener('change', function() {
        if (this.checked && usernameInput.value) {
            localStorage.setItem('snhs_remembered_username', usernameInput.value);
        } else {
            localStorage.removeItem('snhs_remembered_username');
        }
    });

    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    // Announce form errors to screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ===== DEMO CREDENTIALS HELPER =====
    
    // Add demo credentials info (for development/demo purposes)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const demoInfo = document.createElement('div');
        demoInfo.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 8px; font-size: 12px; z-index: 1000; max-width: 250px;">
                <strong>Demo Credentials:</strong><br>
                <strong>Student:</strong><br>
                • student123 / password123<br>
                • 2024-001 / snhs2024<br>
                <strong>Staff:</strong><br>
                • teacher1 / teacher123<br>
                • admin / admin123
            </div>
        `;
        document.body.appendChild(demoInfo);
    }

    // ===== ANIMATIONS =====
    
    // Add CSS for spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .focused .form-label {
            color: var(--primary-blue);
            font-weight: 600;
        }
        
        .input-wrapper.focused .input-icon {
            color: var(--primary-blue);
            transform: translateY(-50%) scale(1.1);
        }
    `;
    document.head.appendChild(style);

    // ===== PARTICLE EFFECT ON BACKGROUND =====
    function createParticles() {
        const particleCount = 20;
        const container = document.querySelector('.background-shapes');
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = 'rgba(255, 255, 255, 0.5)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 10 + 15}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(particle);
        }
    }
    
    createParticles();

    console.log('SNHS Login Portal initialized successfully');
});