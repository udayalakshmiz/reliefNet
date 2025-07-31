// Global variables
let currentUser = null;
const API_BASE_URL = 'http://localhost:3000'; // Change to your API base URL

// DOM elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navList = document.getElementById('nav-list');
const mainContent = document.getElementById('main-content');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkAuthStatus();
    loadAlerts();
});

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Navigation links
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link') && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            showSection(targetId);
            navMenu.classList.remove('active');
        }
    });
    
    // Forms
    setupFormListeners();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Setup form listeners
function setupFormListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Help request form
    document.getElementById('help-request-form').addEventListener('submit', handleHelpRequest);
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContact);
    
    // Profile Update form 
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        updateNavigation();
        loadUserData();
    } else {
        updateNavigation();
    }
}

// Update navigation based on user role
function updateNavigation() {
    const publicItems = document.querySelectorAll('.public-only');
    const victimItems = document.querySelectorAll('.victim-only');
    const volunteerItems = document.querySelectorAll('.volunteer-only');
    const ngoItems = document.querySelectorAll('.ngo-only');
    const loggedInItems = document.querySelectorAll('.logged-in-only');
    
    // Hide all items first
    publicItems.forEach(item => item.classList.remove('show'));
    victimItems.forEach(item => item.classList.remove('show'));
    volunteerItems.forEach(item => item.classList.remove('show'));
    ngoItems.forEach(item => item.classList.remove('show'));
    loggedInItems.forEach(item => item.classList.remove('show'));
    
    if (currentUser) {
        // Show logged-in items
        loggedInItems.forEach(item => item.classList.add('show'));
        
        // Show role-specific items
        if (currentUser.role === 'victim') {
            victimItems.forEach(item => item.classList.add('show'));
        } else if (currentUser.role === 'volunteer') {
            volunteerItems.forEach(item => item.classList.add('show'));
        } else if (currentUser.role === 'ngo') {
            ngoItems.forEach(item => item.classList.add('show'));
        }
        
        // Update user name
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
    } else {
        // Show public items
        publicItems.forEach(item => item.classList.add('show'));
    }
}

// Show/hide sections
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
    if (sectionId === 'home' && currentUser) {
        showMessage('Login successful!', 'success');
    }
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'tasks':
            loadTasks();
            break;
        case 'manage-requests':
            loadAllRequests();
            break;
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'alerts':
            loadAlerts();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}


// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;
            
            closeModal('login-modal');
            updateNavigation();
            
            showSection('home');
            loadUserData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        phone: document.getElementById('register-phone').value,
        location: document.getElementById('register-location').value,
        role: document.getElementById('register-role').value,
        password: document.getElementById('register-password').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;
            
            closeModal('register-modal');
            updateNavigation();
            showMessage('Registration successful!', 'success');
            showSection('home');
            loadUserData();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    currentUser = null;
    updateNavigation();
    showSection('home');
    showMessage('Logged out successfully!', 'info');
}

async function handleHelpRequest(e) {
    e.preventDefault();

    const typeElement = document.getElementById('help-type');
    const descElement = document.getElementById('help-description');
    const urgencyElement = document.getElementById('urgency');
    const locationElement = document.getElementById('help-location');

    if (!typeElement || !descElement || !urgencyElement || !locationElement) {
        showMessage('Form error: Missing fields.', 'error');
        return;
    }

    const formData = {
        type: typeElement.value,
        description: descElement.value,
        urgency: urgencyElement.value,
        location: locationElement.value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Help request submitted successfully!', 'success');
            document.getElementById('help-request-form').reset();
            showSection('my-requests');
            loadMyRequests();
        } else {
            showMessage(data.message || 'Submission failed.', 'error');
        }

    } catch (error) {
        showMessage('Failed to submit request. Please try again.', 'error');
    }
}

// Load user-specific data
function loadUserData() {
    if (currentUser) {
        loadMyRequests();
        loadTasks();
        loadDashboardStats();
        
        // Prefill profile form
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const locationInput = document.getElementById('profile-location');

        if (nameInput) nameInput.value = currentUser.name || '';
        if (emailInput) emailInput.value = currentUser.email || '';
        if (phoneInput) phoneInput.value = currentUser.phone || '';
        if (locationInput) locationInput.value = currentUser.location || '';
    }
}

// Load tasks for a logged-in volunteer
async function loadTasks() {
    console.log("Loading tasks for volunteer...");
    console.log("Current User:", currentUser);

    if (!currentUser || currentUser.role !== 'volunteer') return;

    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '<p>Loading tasks...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/my-tasks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        console.log("Response from /my-tasks:", data);

        if (!Array.isArray(data)) {
            console.error("Expected an array but got:", data);
            tasksList.innerHTML = '<p>Error loading tasks. Please try again later.</p>';
            return;
        }

        if (data.length === 0) {
            tasksList.innerHTML = '<p>No tasks assigned to you yet.</p>';
            return;
        }

        tasksList.innerHTML = data.map(task => {
            console.log("Rendering task:", task);
            return `
            <div class="task-card urgency-${(task.urgency || 'low').toLowerCase()}">
                <h4>${task.taskType} - ${task.urgency} Priority</h4>
                <p><strong>Location:</strong> ${task.location}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Assigned:</strong> ${task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Notes:</strong> ${task.notes || 'None'}</p>
            </div>
        `}).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<p>Failed to fetch tasks.</p>';
    }
}




// Load all requests for NGO
async function loadAllRequests() {
    if (!currentUser || currentUser.role !== 'ngo') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/requests`,{
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const requests = await response.json();
        const requestsList = document.getElementById('all-requests-list');
        
        if (requests.length === 0) {
            requestsList.innerHTML = '<p>No requests found.</p>';
            return;
        }
        console.log("Request item:", requests);
        console.log("Loaded requests:", requests);

        
        requestsList.innerHTML = requests.map(request => `
            <div class="request-card urgency-${request.urgency}">
                <h4>${capitalizeFirst(request.category || 'Unknown')} - ${capitalizeFirst(request.urgency || 'Normal')} Priority</h4>
                <p><strong>Description:</strong> ${request.description}</p>
                <p><strong>Location:</strong> ${request.location}</p>
                <p><strong>Status:</strong> ${capitalizeFirst(request.status)}</p>
                <p><strong>Created:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                <div class="request-actions">
                ${request.status && request.status.toLowerCase() === 'pending' ? 
                    `<button class="btn btn-primary" onclick="assignVolunteer('${request._id}')">Assign Volunteer</button>` : 
                    ''}
                    ${request.assignedVolunteerName ? `<p><strong>Assigned to:</strong> ${request.assignedVolunteerName}</p>` : ''}
                    ${request.status && request.status.toLowerCase() === 'assigned' ? 
                        `<button class="btn btn-secondary" onclick="markResolved('${request._id}')">Mark Resolved</button>` : 
                        ''}
                </div>

            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    if (!currentUser || currentUser.role !== 'ngo') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const analytics = await response.json();
        
        if (analytics.overview) {
            document.getElementById('pending-requests').textContent = analytics.overview.pendingRequests;
            document.getElementById('active-volunteers').textContent = analytics.overview.activeVolunteers;
            document.getElementById('resolved-cases').textContent = analytics.overview.resolvedRequests;
            document.getElementById('affected-areas').textContent = Object.keys(analytics.breakdowns.locationBreakdown).length;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load alerts
async function loadAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/alerts`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        });
        const alerts = await response.json();
        const alertsList = document.getElementById('alerts-list');
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<p>No alerts at the moment.</p>';
            return;
        }
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-card urgency-${alert.urgency}">
                <h4>${alert.title}</h4>
                <p><strong>Type:</strong> ${capitalizeFirst(alert.type)}</p>
                <p><strong>Description:</strong> ${alert.description}</p>
                <p><strong>Location:</strong> ${alert.location}</p>
                <p><strong>Urgency:</strong> ${capitalizeFirst(alert.urgency)}</p>
                <p><strong>Issued:</strong> ${new Date(alert.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Contact form
async function handleContact(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Message sent successfully!', 'success');
            document.getElementById('contact-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to send message. Please try again.', 'error');
    }
}

// Load profile data
async function loadProfileData() {
   const token = localStorage.getItem('token');
   if (!token) return;
    
    try {
        // Load user profile data from backend
        const response = await fetch(`${API_BASE_URL}/api/profile/data`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            // Populate form with user data
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-email').value = userData.email || '';
            document.getElementById('profile-phone').value = userData.phone || '';
            document.getElementById('profile-location').value = userData.location || '';
            document.getElementById('profile-bio').value = userData.bio || '';
            document.getElementById('profile-emergency-contact').value = userData.emergencyContact || '';
            document.getElementById('profile-skills').value = userData.skills || '';
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }
    
    // Load user statistics
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

// Handle profile form submission
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        location: document.getElementById('profile-location').value,
        bio: document.getElementById('profile-bio').value,
        emergencyContact: document.getElementById('profile-emergency-contact').value,
        skills: document.getElementById('profile-skills').value
    };
    showMessage('Profile updated successfully!', 'success');
    updateNavigation();
}

// Handle change password
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Password changed successfully!', 'success');
            closeModal('change-password-modal');
            document.getElementById('change-password-form').reset();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to change password. Please try again.', 'error');
    }
}

// Download user data
function downloadData() {
    const userData = {
        profile: currentUser,
        settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-reliefnet-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showMessage('Data downloaded successfully!', 'success');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
}

async function acceptTask(taskData) {
    console.log("User from token:", req.user); 
    if (!currentUser || currentUser.role !== 'volunteer') return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                volunteerId: currentUser.id,
                requestId: taskData.requestId,
                taskType: taskData.taskType,
                location: taskData.location,
                urgency: taskData.urgency,
                notes: taskData.notes || ''
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Task assigned successfully!', 'success');
            loadTasks();  // Refresh the task list on volunteer dashboard
        } else {
            showMessage(data.message || 'Failed to assign task.', 'error');
        }
    } catch (error) {
        showMessage('Failed to assign task. Please try again.', 'error');
        console.error('Assignment error:', error);
    }
}


// Assign volunteer (NGO function)
async function assignVolunteer(requestId) {
    if (!currentUser || currentUser.role !== 'ngo') return;

    try {
        // Get available volunteers
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const volunteers = await response.json();

        if (!Array.isArray(volunteers) || volunteers.length === 0) {
            showMessage('No volunteers available at the moment.', 'info');
            return;
        }

        // Prompt to select a volunteer
        const selectedIndex = prompt(
            `Select a volunteer:\n${volunteers.map((v, i) => `${i + 1}. ${v.name} (${v.location})`).join('\n')}\n\nEnter the number:`
        );

        if (selectedIndex && selectedIndex > 0 && selectedIndex <= volunteers.length) {
            const selectedVolunteer = volunteers[selectedIndex - 1];
            console.log("Selected Volunteer:", selectedVolunteer);

            const assignUrl = `${API_BASE_URL}/api/requests/${requestId}/assign`;
            console.log("Assigning volunteer to:", assignUrl);

            const assignResponse = await fetch(assignUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ volunteerId: selectedVolunteer._id })
            });

            const assignText = await assignResponse.text();
            console.log("Raw response:", assignText);

            try {
                const assignData = JSON.parse(assignText);

                if (assignResponse.ok) {
                    // ✅ Volunteer assigned successfully in HelpRequest

                    // 🔧 Now assign actual task to the volunteer
                    const taskAssignResponse = await fetch(`${API_BASE_URL}/api/tasks/assign`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            volunteerId: selectedVolunteer._id,
                            requestId: requestId,
                            taskType: 'Medical Aid', // Replace with actual value if available
                            location: 'Pune',        // Replace with actual value
                            urgency: 'High',         // Replace with actual value
                            notes: 'Assigned via NGO dashboard'
                        })
                    });

                    const taskResult = await taskAssignResponse.json();
                    console.log("Task assignment result:", taskResult);

                    if (taskAssignResponse.ok) {
                        showMessage(`Volunteer ${selectedVolunteer.name} assigned and task created successfully!`, 'success');
                        loadAllRequests();
                        loadDashboardStats();
                    } else {
                        showMessage(taskResult.message || 'Task creation failed.', 'error');
                    }

                } else {
                    console.error('API responded with error:', assignData);
                    showMessage(assignData.message || 'Failed to assign volunteer.', 'error');
                }

            } catch (err) {
                console.error('Failed to parse response as JSON:', assignText);
                showMessage('Unexpected response format. Check console.', 'error');
            }
        }
    } catch (error) {
        console.error('Assign Volunteer Failed:', error);
        showMessage('Failed to assign volunteer due to network/server error.', 'error');
    }
}



// Mark request as resolved
async function markResolved(requestId) {
    if (!currentUser || currentUser.role !== 'ngo') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'resolved' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Request marked as resolved!', 'success');
            loadAllRequests();
            loadDashboardStats();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to update request status. Please try again.', 'error');
    }
}

// Utility functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showLogin() {
    showModal('login-modal');
}

function showRegister() {
    showModal('register-modal');
}

function showVolunteerRegister() {
    showModal('register-modal');
    document.getElementById('register-role').value = 'volunteer';
}

function showNotifications() {
    showModal('notification-modal');
}

function showProfile() {
    showSection('profile');
    loadProfileData();
}

function showChangePassword() {
    showModal('change-password-modal');
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of main content
    const mainContent = document.getElementById('main-content');
    const firstChild = mainContent.firstChild;
    mainContent.insertBefore(messageDiv, firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function capitalizeFirst(str) {
  if (!str || typeof str !== 'string') return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
});
