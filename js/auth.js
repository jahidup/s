// auth.js - Authentication and user management

// User roles
const USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
};

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Set up login form if exists
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }
    
    // Set up registration form if exists
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Set up logout button if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Check authentication status
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    
    // Pages that require authentication
    const protectedPages = [
        'index.html',
        'profile.html',
        'tests.html',
        'live-tests.html',
        'upcoming-tests.html',
        'results.html',
        'test-portal.html'
    ];
    
    // Pages that redirect to dashboard if already logged in
    const authPages = [
        'login.html',
        'register.html',
        'teacher-login.html'
    ];
    
    // Check if current page is protected
    const isProtectedPage = protectedPages.some(page => currentPath.includes(page));
    const isAuthPage = authPages.some(page => currentPath.includes(page));
    
    if (isProtectedPage && !currentUser) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    if (isAuthPage && currentUser) {
        // Redirect to dashboard if already logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Update UI based on user role
    updateUIForUser(currentUser);
}

// Get current user from localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Update UI based on user role
function updateUIForUser(user) {
    if (!user) return;
    
    // Update user display name
    const userDisplayElements = document.querySelectorAll('.user-display-name');
    userDisplayElements.forEach(element => {
        element.textContent = user.name || user.email;
    });
    
    // Update user role specific elements
    if (user.role === USER_ROLES.TEACHER) {
        // Show teacher-specific elements
        const teacherElements = document.querySelectorAll('.teacher-only');
        teacherElements.forEach(element => {
            element.style.display = 'block';
        });
    }
    
    // Update user info in profile page
    if (window.location.pathname.includes('profile.html')) {
        updateProfilePage(user);
    }
}

// Handle login form submission
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;
    const userType = document.getElementById('userType')?.value || USER_ROLES.STUDENT;
    
    // Validate inputs
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In a real application, this would be an API call to your backend
        const users = getStoredUsers();
        const user = users.find(u => 
            (u.email === username || u.username === username) && 
            u.password === password && 
            u.role === userType
        );
        
        if (user) {
            // Remove password before storing
            const { password, ...userWithoutPassword } = user;
            
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            }
            
            // Show success message
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show error message
            showMessage('Invalid username or password', 'error');
        }
    }, 1500);
}

// Handle registration form submission
function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Validate password match
    if (userData.password !== userData.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(userData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate mobile number
    if (userData.mobile && !isValidMobile(userData.mobile)) {
        showMessage('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Check if user already exists
        const users = getStoredUsers();
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showMessage('An account with this email already exists', 'error');
            return;
        }
        
        // Create new user object
        const newUser = {
            id: generateUserId(),
            name: userData.name,
            email: userData.email,
            username: userData.username || userData.email.split('@')[0],
            password: userData.password,
            mobile: userData.mobile || '',
            fatherName: userData.fatherName || '',
            class: userData.class || '',
            school: userData.school || '',
            role: userData.role || USER_ROLES.STUDENT,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        // Save user to localStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Automatically log in the user
        const { password, ...userWithoutPassword } = newUser;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        // Show success message
        showMessage('Account created successfully! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }, 2000);
}

// Handle logout
function handleLogout() {
    // Clear current user session
    localStorage.removeItem('currentUser');
    
    // Show logout message
    showMessage('Logged out successfully', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Get stored users from localStorage
function getStoredUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [
        // Default admin user for demo
        {
            id: 'admin001',
            name: 'Admin User',
            email: 'admin@sankalpshiksha.com',
            username: 'admin',
            password: 'admin123',
            role: USER_ROLES.ADMIN,
            createdAt: '2024-01-01'
        },
        // Default teacher user for demo
        {
            id: 'teacher001',
            name: 'Rahul Sharma',
            email: 'teacher@sankalpshiksha.com',
            username: 'teacher',
            password: 'teacher123',
            role: USER_ROLES.TEACHER,
            createdAt: '2024-01-01'
        },
        // Default student user for demo
        {
            id: 'student001',
            name: 'John Doe',
            email: 'student@sankalpshiksha.com',
            username: 'john',
            password: 'student123',
            mobile: '9876543210',
            fatherName: 'Robert Doe',
            class: 'Class 10',
            school: 'Delhi Public School',
            role: USER_ROLES.STUDENT,
            createdAt: '2024-01-01'
        }
    ];
}

// Generate unique user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate mobile number
function isValidMobile(mobile) {
    return /^\d{10}$/.test(mobile);
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.innerHTML = `
        <div class="auth-message-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="auth-message-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    const authContainer = document.querySelector('.auth-container') || document.querySelector('main') || document.body;
    authContainer.insertBefore(messageEl, authContainer.firstChild);
    
    // Add close functionality
    messageEl.querySelector('.auth-message-close').addEventListener('click', () => {
        messageEl.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Update profile page with user data
function updateProfilePage(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileMobile').textContent = user.mobile || 'Not provided';
    document.getElementById('profileClass').textContent = user.class || 'Not specified';
    document.getElementById('profileSchool').textContent = user.school || 'Not specified';
    document.getElementById('profileJoined').textContent = formatDate(user.createdAt);
    document.getElementById('profileRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Fill edit form
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editMobile').value = user.mobile || '';
    document.getElementById('editFatherName').value = user.fatherName || '';
    document.getElementById('editClass').value = user.class || '';
    document.getElementById('editSchool').value = user.school || '';
    
    // Load user's test history
    loadUserTestHistory(user.id);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load user's test history
function loadUserTestHistory(userId) {
    const testHistory = JSON.parse(localStorage.getItem('testHistory')) || [];
    const userTests = testHistory.filter(test => test.userId === userId);
    
    const historyContainer = document.getElementById('testHistory');
    if (!historyContainer) return;
    
    if (userTests.length === 0) {
        historyContainer.innerHTML = '<p class="no-data">No test history available</p>';
        return;
    }
    
    // Sort by date (newest first)
    userTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '<div class="history-grid">';
    userTests.slice(0, 10).forEach(test => {
        html += `
            <div class="history-card">
                <div class="history-header">
                    <h4>${test.testName}</h4>
                    <span class="history-date">${formatDate(test.date)}</span>
                </div>
                <div class="history-details">
                    <div class="history-score">
                        <span class="score-value">${test.score}%</span>
                        <span class="score-label">Score</span>
                    </div>
                    <div class="history-stats">
                        <span><i class="fas fa-check-circle"></i> ${test.correct}/${test.total}</span>
                        <span><i class="fas fa-clock"></i> ${test.timeTaken}</span>
                        <span><i class="fas fa-trophy"></i> ${test.rank || 'N/A'}</span>
                    </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="viewTestDetails('${test.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
    });
    html += '</div>';
    
    historyContainer.innerHTML = html;
}

// View test details
function viewTestDetails(testId) {
    const testHistory = JSON.parse(localStorage.getItem('testHistory')) || [];
    const test = testHistory.find(t => t.id === testId);
    
    if (test) {
        // Store test data for details page
        localStorage.setItem('currentTestDetails', JSON.stringify(test));
        window.location.href = 'test-details.html';
    }
}

// Update user profile
function updateUserProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Get all users
    const users = getStoredUsers();
    
    // Find and update user
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;
    
    // Update user data
    users[userIndex] = { ...users[userIndex], ...updatedData };
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current session
    const { password, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return true;
}

// Change password
function changePassword(currentPassword, newPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not found' };
    
    // Get all users
    const users = getStoredUsers();
    
    // Find user
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'User not found' };
    
    // Verify current password
    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect' };
    }
    
    // Update password
    users[userIndex].password = newPassword;
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Password updated successfully' };
}

// Forgot password
function forgotPassword(email) {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'No account found with this email' };
    }
    
    // In a real application, you would send a reset email here
    // For demo purposes, we'll just show a message
    return { 
        success: true, 
        message: 'Password reset instructions have been sent to your email' 
    };
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('currentUser') !== null;
}

// Get user role
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

// Check if user has permission
function hasPermission(requiredRole) {
    const userRole = getUserRole();
    
    // Role hierarchy
    const roleHierarchy = {
        [USER_ROLES.ADMIN]: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT],
        [USER_ROLES.TEACHER]: [USER_ROLES.TEACHER, USER_ROLES.STUDENT],
        [USER_ROLES.STUDENT]: [USER_ROLES.STUDENT]
    };
    
    return userRole && roleHierarchy[userRole]?.includes(requiredRole);
}

// Redirect if not authenticated
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Redirect if not authorized
function requireRole(requiredRole, redirectTo = 'index.html') {
    if (!hasPermission(requiredRole)) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Add CSS for auth messages
const authStyles = `
    .auth-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .auth-message-success {
        background: #27ae60;
        border-left: 4px solid #2ecc71;
    }
    
    .auth-message-error {
        background: #e74c3c;
        border-left: 4px solid #c0392b;
    }
    
    .auth-message-info {
        background: #3498db;
        border-left: 4px solid #2980b9;
    }
    
    .auth-message-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .auth-message-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        margin-left: 15px;
    }
    
    .no-data {
        text-align: center;
        padding: 40px;
        color: #666;
        font-style: italic;
    }
    
    .history-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .history-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
    }
    
    .history-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }
    
    .history-header h4 {
        margin: 0;
        color: #1a3c6e;
        font-size: 1.1rem;
    }
    
    .history-date {
        font-size: 0.9rem;
        color: #666;
    }
    
    .history-details {
        margin-bottom: 15px;
    }
    
    .history-score {
        text-align: center;
        margin-bottom: 10px;
    }
    
    .score-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2a8bf2;
        display: block;
    }
    
    .score-label {
        color: #666;
        font-size: 0.9rem;
    }
    
    .history-stats {
        display: flex;
        justify-content: space-around;
        color: #666;
        font-size: 0.9rem;
    }
    
    .history-stats i {
        margin-right: 5px;
    }
    
    .btn-sm {
        padding: 8px 16px;
        font-size: 0.9rem;
    }
`;

// Inject auth styles
const styleSheet = document.createElement("style");
styleSheet.textContent = authStyles;
document.head.appendChild(styleSheet);
