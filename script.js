/* === Sadaf Dashboard Script ===
   Handles login, signup, logout, theme switch, skills animation,
   project filter, contact form, and session timer.
   Uses localStorage only (no database needed).
*/

// Shortcuts for selecting elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Update footer year automatically ---
const currentYear = new Date().getFullYear();
$$('#year, #year2, #year3').forEach(el => el.textContent = currentYear);

// --- Helper functions for user data ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function setLoggedInUser(user, remember) {
  const data = JSON.stringify(user);
  if (remember) localStorage.setItem('loggedUser', data);
  else sessionStorage.setItem('loggedUser', data);
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser') || 'null');
}

function clearLoggedInUser() {
  localStorage.removeItem('loggedUser');
  sessionStorage.removeItem('loggedUser');
}

// --- Page redirection helper ---
function goTo(url) {
  window.location.href = url;
}

// --- Auth check ---
const user = getLoggedInUser();
const page = location.pathname.split('/').pop().toLowerCase();
const privatePages = ['index.html', 'skills.html', 'projects.html', ''];

// Redirect to login if not logged in
if (privatePages.includes(page) && !user) goTo('login.html');

// Redirect logged user away from login/signup
if ((page === 'login.html' || page === 'signup.html') && user) goTo('index.html');

// --- Signup Form ---
const signupForm = $('#signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim().toLowerCase();
    const password = $('#signupPassword').value;
    const age = Number($('#signupAge').value) || 20;

    $('#signupNameError').textContent = '';
    $('#signupEmailError').textContent = '';
    $('#signupPasswordError').textContent = '';
    $('#signupStatus').textContent = '';

    if (name.length < 2) return $('#signupNameError').textContent = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return $('#signupEmailError').textContent = 'Invalid email';
    if (password.length < 6) return $('#signupPasswordError').textContent = 'Password must be 6+ characters';

    const users = getUsers();
    if (users.some(u => u.email === email))
      return $('#signupStatus').textContent = 'Email already registered. Try logging in.';

    users.push({ name, email, password, age });
    saveUsers(users);
    $('#signupStatus').textContent = 'Account created! Redirecting...';
    setTimeout(() => goTo('login.html'), 1000);
  });
}

// --- Login Form ---
const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const remember = $('#rememberMe').checked;

    $('#loginStatus').textContent = '';

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return $('#loginStatus').textContent = 'Incorrect email or password';

    setLoggedInUser(user, remember);
    $('#loginStatus').textContent = 'Login successful!';
    setTimeout(() => goTo('index.html'), 800);
  });
}

// --- Logout ---
$$('#logoutBtn, #logoutSidebar').forEach(btn => {
  if (btn) {
    btn.addEventListener('click', () => {
      clearLoggedInUser();
      goTo('login.html');
    });
  }
});

// --- Show user info on home page ---
if (user) {
  const ageField = $('#displayAge');
  if (ageField) ageField.textContent = user.age;
}

// --- Theme Switch (Light/Dark) ---
const themeToggle = $('#themeToggle');
if (themeToggle) {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', savedTheme === 'dark');

  themeToggle.addEventListener('click', () => {
    const darkMode = document.body.classList.toggle('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  });
}

// --- Animate Skills ---
function animateSkills() {
  $$('.skill').forEach(skill => {
    const value = Number(skill.dataset.value) || 0;
    const bar = skill.querySelector('.progress-bar');
    if (bar) bar.style.width = value + '%';
  });
}

if (page === 'skills.html') setTimeout(animateSkills, 300);

// --- Filter Projects ---
const filters = $$('.filter-btn');
const cards = $$('.project-card');

if (filters.length && cards.length) {
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tech = btn.dataset.tech;
      cards.forEach(card => {
        const techs = card.dataset.tech.split(',');
        card.style.display = (tech === 'all' || techs.includes(tech)) ? 'block' : 'none';
      });
    });
  });
}

// --- Contact Form ---
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    $('#formStatus').textContent = '';

    if (name.length < 2) return $('#formStatus').textContent = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return $('#formStatus').textContent = 'Invalid email';
    if (message.length < 10) return $('#formStatus').textContent = 'Message too short';

    $('#formStatus').textContent = 'Message sent! (Demo only)';
    contactForm.reset();
  });
}

// --- Session Timer ---
const timerDisplay = $('#sessionTimer');
const lastDisplay = $('#lastDuration');
if (timerDisplay) {
  const start = Date.now();
  const lastTime = localStorage.getItem('lastSession') || '—';
  if (lastDisplay) lastDisplay.textContent = lastTime;

  setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    timerDisplay.textContent = `${h}:${m}:${s}`;
  }, 1000);

  window.addEventListener('beforeunload', () => {
    const total = Math.floor((Date.now() - start) / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    localStorage.setItem('lastSession', `${min}m ${sec}s`);
  });
}

// --- Sidebar toggle (for dashboard layout) ---
const sidebarToggle = $('#sidebarToggle');
const app = $('.app');

if (sidebarToggle && app) {
  sidebarToggle.addEventListener('click', () => {
    app.classList.toggle('sidebar-collapsed');
    sidebarToggle.textContent = app.classList.contains('sidebar-collapsed') ? 'Expand' : 'Collapse';
  });
}

// --- Fallback for missing images ---
$$('img').forEach(img => {
  img.addEventListener('error', () => {
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
  });
});
