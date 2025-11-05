// Simple Dashboard Script for Beginners
// This code runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
    
    // === HELPER FUNCTIONS ===
    
    // Short function to select one element
    function select(selector) {
        return document.querySelector(selector);
    }
    
    // Short function to select multiple elements
    function selectAll(selector) {
        return document.querySelectorAll(selector);
    }
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const yearElements = selectAll('#year, #year2, #year3');
    yearElements.forEach(function(element) {
        if (element) {
            element.textContent = currentYear;
        }
    });
    
    // === AUTHENTICATION SYSTEM ===
    
    // Function to get all users from storage
    function getUsers() {
        try {
            const usersString = localStorage.getItem('sadaf_users');
            if (usersString) {
                return JSON.parse(usersString);
            }
        } catch (error) {
            console.log('Error loading users');
        }
        return [];
    }
    
    // Function to save users to storage
    function saveUsers(usersArray) {
        localStorage.setItem('sadaf_users', JSON.stringify(usersArray));
    }
    
    // Function to check if user is logged in
    function getLoggedInUser() {
        try {
            const userString = localStorage.getItem('sadaf_logged') || sessionStorage.getItem('sadaf_logged');
            if (userString) {
                return JSON.parse(userString);
            }
        } catch (error) {
            console.log('Error checking login');
        }
        return null;
    }
    
    // Function to redirect to another page
    function goToPage(url) {
        window.location.href = url;
    }
    
    // Check if user needs to login
    const currentUser = getLoggedInUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require login
    const protectedPages = ['index.html', 'skills.html', 'projects.html', ''];
    
    // If on login/signup page but already logged in, go to dashboard
    if ((currentPage === 'login.html' || currentPage === 'signup.html') && currentUser) {
        goToPage('index.html');
    }
    
    // If on protected page but not logged in, go to login
    if (protectedPages.includes(currentPage) && !currentUser && currentPage !== 'login.html' && currentPage !== 'signup.html') {
        goToPage('login.html');
    }
    
    // === SIGNUP FORM ===
    const signupForm = select('#signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const name = select('#signupName').value.trim();
            const email = select('#signupEmail').value.trim().toLowerCase();
            const password = select('#signupPassword').value;
            const age = Number(select('#signupAge').value) || 21;
            
            // Clear error messages
            select('#signupNameError').textContent = '';
            select('#signupEmailError').textContent = '';
            select('#signupPasswordError').textContent = '';
            select('#signupStatus').textContent = '';
            
            // Validate name
            if (name.length < 2) {
                select('#signupNameError').textContent = 'Please enter your full name (at least 2 characters)';
                return;
            }
            
            // Validate email
            if (!email.includes('@') || !email.includes('.')) {
                select('#signupEmailError').textContent = 'Please enter a valid email address';
                return;
            }
            
            // Validate password
            if (password.length < 6) {
                select('#signupPasswordError').textContent = 'Password must be at least 6 characters long';
                return;
            }
            
            // Check if email already exists
            const users = getUsers();
            for (let i = 0; i < users.length; i++) {
                if (users[i].email === email) {
                    select('#signupStatus').textContent = 'This email is already registered. Please login instead.';
                    select('#signupStatus').style.color = 'red';
                    return;
                }
            }
            
            // Create new user
            users.push({
                name: name,
                email: email,
                password: password,
                age: age
            });
            
            // Save users
            saveUsers(users);
            
            // Show success message
            select('#signupStatus').textContent = 'Account created successfully! Redirecting to login...';
            select('#signupStatus').style.color = 'green';
            
            // Redirect to login page
            setTimeout(function() {
                goToPage('login.html');
            }, 1500);
        });
    }
    
    // === LOGOUT BUTTONS ===
    const logoutButtons = selectAll('#logoutBtn, #logoutBtn2, #logoutBtn3, #logoutSidebar');
    logoutButtons.forEach(function(button) {
        if (button) {
            button.style.display = 'block';
            button.addEventListener('click', function(event) {
                event.preventDefault();
                // Clear login data
                localStorage.removeItem('sadaf_logged');
                sessionStorage.removeItem('sadaf_logged');
                // Go to login page
                goToPage('login.html');
            });
        }
    });
    
    // Show user age on home page if logged in
    if (currentUser) {
        const ageDisplay = select('#displayAge');
        if (ageDisplay) {
            ageDisplay.textContent = currentUser.age || 21;
        }
    }
    
    // === SKILLS PAGE - ANIMATE PROGRESS BARS ===
    if (currentPage === 'skills.html') {
        setTimeout(function() {
            const skillElements = selectAll('.skill');
            skillElements.forEach(function(skill, index) {
                const value = Number(skill.getAttribute('data-value')) || 0;
                const progressBar = skill.querySelector('.progress-bar');
                if (progressBar) {
                    // Animate after a delay
                    setTimeout(function() {
                        progressBar.style.width = value + '%';
                    }, 200 + (index * 100));
                }
            });
        }, 500);
    }
    
    // === PROJECTS PAGE - FILTER BUTTONS ===
    const filterButtons = selectAll('.filter-btn');
    const projectCards = selectAll('.project-card');
    
    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const selectedTech = button.getAttribute('data-tech');
                
                // Show/hide projects based on filter
                projectCards.forEach(function(card) {
                    const cardTechs = card.getAttribute('data-tech').split(',');
                    
                    if (selectedTech === 'all' || cardTechs.includes(selectedTech)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // === CONTACT FORM ===
    const contactForm = select('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const name = select('#name').value.trim();
            const email = select('#email').value.trim();
            const message = select('#message').value.trim();
            
            // Clear errors
            select('#nameError').textContent = '';
            select('#emailError').textContent = '';
            select('#messageError').textContent = '';
            select('#formStatus').textContent = '';
            
            let hasErrors = false;
            
            // Validate name
            if (name.length < 2) {
                select('#nameError').textContent = 'Please enter your name (at least 2 characters)';
                hasErrors = true;
            }
            
            // Validate email
            if (!email.includes('@') || !email.includes('.')) {
                select('#emailError').textContent = 'Please enter a valid email address';
                hasErrors = true;
            }
            
            // Validate message
            if (message.length < 10) {
                select('#messageError').textContent = 'Message should be at least 10 characters long';
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Show success message (demo only)
            select('#formStatus').textContent = 'Thank you! Your message has been sent. (This is a demo)';
            select('#formStatus').style.color = 'green';
            
            // Clear form
            contactForm.reset();
            
            // Clear message after 3 seconds
            setTimeout(function() {
                select('#formStatus').textContent = '';
            }, 3000);
        });
    }
    
    // === SESSION TIMER ===
    const timerDisplay = select('#sessionTimer');
    const lastVisitDisplay = select('#lastDuration');
    
    if (timerDisplay) {
        let seconds = 0;
        
        // Update timer every second
        const timer = setInterval(function() {
            seconds++;
            
            // Calculate hours, minutes, seconds
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            // Format time as HH:MM:SS
            const timeString = 
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(remainingSeconds).padStart(2, '0');
            
            timerDisplay.textContent = timeString;
        }, 1000);
        
        // Show last visit duration
        const lastDuration = localStorage.getItem('sadaf_last_duration');
        if (lastDuration && lastVisitDisplay) {
            lastVisitDisplay.textContent = lastDuration;
        }
        
        // Save duration when leaving page
        window.addEventListener('beforeunload', function() {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            localStorage.setItem('sadaf_last_duration', minutes + 'm ' + remainingSeconds + 's');
        });
    }
    
    // === SIDEBAR TOGGLE ===
    const sidebarToggle = select('#sidebarToggle');
    const mobileToggle = select('#mobileSidebarToggle');
    const appContainer = select('.app');
    
    if (sidebarToggle && appContainer) {
        sidebarToggle.addEventListener('click', function() {
            appContainer.classList.toggle('sidebar-collapsed');
            
            if (appContainer.classList.contains('sidebar-collapsed')) {
                sidebarToggle.textContent = 'Expand';
            } else {
                sidebarToggle.textContent = 'Collapse';
            }
        });
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-open');
        });
    }
    
    // === IMAGE ERROR HANDLING ===
    const allImages = selectAll('img');
    allImages.forEach(function(img) {
        img.addEventListener('error', function() {
            // If image fails to load, show a placeholder
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
        });
    });
});
