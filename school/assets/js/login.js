// ========================================
// LOGIN PAGE INTERACTIVITY
// ========================================

// ===== PASSWORD TOGGLE =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = togglePassword.querySelector('.eye-icon');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle icon
    if (type === 'text') {
        eyeIcon.innerHTML = '<path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>';
    } else {
        eyeIcon.innerHTML = '<path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>';
    }
});

// ===== PASSWORD TOGGLE FOR REGISTER =====
const togglePasswordRegister = document.getElementById('togglePasswordRegister');
const regPasswordInput = document.getElementById('regPassword');
const regEyeIcon = togglePasswordRegister.querySelector('.eye-icon');

togglePasswordRegister.addEventListener('click', () => {
    const type = regPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    regPasswordInput.setAttribute('type', type);

    // Toggle icon
    if (type === 'text') {
        regEyeIcon.innerHTML = '<path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>';
    } else {
        regEyeIcon.innerHTML = '<path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>';
    }
});

// ===== FORM TOGGLE =====
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginHeader = document.querySelector('.login-header');
const registerHeader = document.querySelector('.register-header');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginHeader.classList.remove('active');
    registerHeader.classList.add('active');
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerHeader.classList.remove('active');
    loginHeader.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

// ===== FORM VALIDATION =====
const loginFormEl = document.getElementById('loginForm');
const registerFormEl = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Add input validation styling
function validateInput(input) {
    if (input.value.trim() === '') {
        input.style.borderColor = 'var(--color-error)';
        return false;
    } else {
        input.style.borderColor = 'var(--color-success)';
        return true;
    }
}

// Real-time validation
usernameInput.addEventListener('blur', () => validateInput(usernameInput));
passwordInput.addEventListener('blur', () => validateInput(passwordInput));

// Reset border color on focus
usernameInput.addEventListener('focus', () => {
    usernameInput.style.borderColor = 'var(--color-primary)';
});
passwordInput.addEventListener('focus', () => {
    passwordInput.style.borderColor = 'var(--color-primary)';
});

// ===== FORM SUBMISSION =====
loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate inputs
    const isUsernameValid = validateInput(usernameInput);
    const isPasswordValid = validateInput(document.getElementById('password'));

    if (!isUsernameValid || !isPasswordValid) {
        showNotification('Please fill in all fields correctly', 'error');
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
        </svg>
        <span>Signing in...</span>
    `;

    // Simulate API call
    setTimeout(() => {
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
            <span class="btn-text">Sign In</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" class="btn-icon">
                <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
            </svg>
        `;

        // Show success message
        showNotification('Login successful! Redirecting...', 'success');

        // Redirect after 1.5 seconds
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }, 2000);
});

// ===== REGISTER FORM SUBMISSION =====
registerFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const regUsername = document.getElementById('regUsername').value.trim();
    const regPassword = document.getElementById('regPassword').value.trim();
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const schoolid = document.getElementById('schoolid').value.trim();

    // Validate inputs
    const isRegUsernameValid = validateInput(document.getElementById('regUsername'));
    const isRegPasswordValid = validateInput(document.getElementById('regPassword'));
    const isFirstnameValid = validateInput(document.getElementById('firstname'));
    const isLastnameValid = validateInput(document.getElementById('lastname'));
    const isSchoolidValid = validateInput(document.getElementById('schoolid'));

    if (!isRegUsernameValid || !isRegPasswordValid || !isFirstnameValid || !isLastnameValid || !isSchoolidValid) {
        showNotification('Please fill in all fields correctly', 'error');
        return;
    }

    // Show loading state
    registerBtn.disabled = true;
    registerBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
        </svg>
        <span>Signing up...</span>
    `;

    // Simulate API call
    setTimeout(() => {
        // Reset button
        registerBtn.disabled = false;
        registerBtn.innerHTML = `
            <span class="btn-text">Sign Up</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" class="btn-icon">
                <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
            </svg>
        `;

        // Show success message
        showNotification('Registration successful! You can now sign in.', 'success');

        // Switch to login form after 2 seconds
        setTimeout(() => {
            showLoginLink.click();
        }, 2000);
    }, 2000);
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'};
        color: white;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// ===== SOCIAL LOGIN HANDLERS =====
const googleBtn = document.querySelector('.google-btn');

googleBtn.addEventListener('click', () => {
    showNotification('Google login coming soon!', 'info');
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Enter key to submit (when not in form)
    if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// ===== AUTO-FOCUS ON LOAD =====
window.addEventListener('load', () => {
    usernameInput.focus();
});

// ===== CONSOLE MESSAGE =====
console.log('%c🔐 School Portal Login', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cSecure login system with modern design', 'font-size: 14px; color: #94a3b8;');