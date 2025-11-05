const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// Footer year
const year = new Date().getFullYear();
$$('#year,#year2,#year3').forEach(el => (el.textContent = year));

// User helpers
const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const saveUsers = u => localStorage.setItem('users', JSON.stringify(u));
const setUser = (u, remember) => {
  const data = JSON.stringify(u);
  remember ? localStorage.setItem('loggedUser', data) : sessionStorage.setItem('loggedUser', data);
};
const getUser = () =>
  JSON.parse(localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser') || 'null');
const clearUser = () => {
  localStorage.removeItem('loggedUser');
  sessionStorage.removeItem('loggedUser');
};
const goTo = url => (window.location.href = url);

// Auth redirects
const current = getUser();
const page = location.pathname.split('/').pop().toLowerCase();
const privatePages = ['index.html', 'skills.html', 'projects.html', ''];

if (privatePages.includes(page) && !current) goTo('login.html');
if ((page === 'login.html' || page === 'signup.html') && current) goTo('index.html');

// Signup
const signupForm = $('#signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim().toLowerCase();
    const pass = $('#signupPassword').value.trim();
    const age = Number($('#signupAge').value) || 20;

    if (!name || name.length < 2) return alert('Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Invalid email address.');
    if (pass.length < 6) return alert('Password must be at least 6 characters.');

    const users = getUsers();
    if (users.some(u => u.email === email)) return alert('This email already exists! Try logging in.');

    users.push({ name, email, password: pass, age });
    saveUsers(users);
    alert('Account created successfully! Redirecting to login...');
    setTimeout(() => goTo('login.html'), 1000);
  });
}

// Login
const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim().toLowerCase();
    const pass = $('#loginPassword').value.trim();
    const remember = $('#rememberMe').checked;

    if (!email || !pass) return alert('Please fill in both email and password.');

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) return alert('No account found with this email. Please sign up.');
    if (user.password !== pass) return alert('Wrong password. Try again.');

    setUser(user, remember);
    alert('Login successful! Redirecting...');
    setTimeout(() => goTo('index.html'), 800);
  });
}

// Logout
$$('#logoutBtn,#logoutSidebar').forEach(btn => {
  if (btn)
    btn.addEventListener('click', () => {
      clearUser();
      alert('You have been logged out.');
      goTo('login.html');
    });
});

// Show user info
if (current) {
  const nameEl = $('#displayName');
  const ageEl = $('#displayAge');
  if (nameEl) nameEl.textContent = current.name;
  if (ageEl) ageEl.textContent = current.age;
}

// Theme switch
const themeToggle = $('#themeToggle');
if (themeToggle) {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', saved === 'dark');
  themeToggle.textContent = saved === 'dark' ? '🌙 Dark' : '☀️ Light';
  themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    themeToggle.textContent = dark ? '🌙 Dark' : '☀️ Light';
  });
}

// Skills animation
function animateSkills() {
  $$('.skill').forEach(skill => {
    const val = Number(skill.dataset.value) || 0;
    const bar = skill.querySelector('.progress-bar');
    if (bar) {
      bar.style.width = '0';
      setTimeout(() => (bar.style.width = val + '%'), 200);
    }
  });
}
if (page === 'skills.html') setTimeout(animateSkills, 400);

// Project filter
const filters = $$('.filter-btn');
const cards = $$('.project-card');
if (filters.length && cards.length) {
  filters.forEach(btn =>
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tech = btn.dataset.tech;
      cards.forEach(card => {
        const techs = card.dataset.tech.split(',');
        card.style.display = tech === 'all' || techs.includes(tech) ? 'block' : 'none';
      });
    })
  );
}

// Contact form
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const msg = $('#message').value.trim();
    if (name.length < 2) return alert('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Invalid email.');
    if (msg.length < 10) return alert('Message too short.');
    alert('Message sent successfully! (Demo only)');
    contactForm.reset();
  });
}

// Session timer
const timerDisplay = $('#sessionTimer');
const lastDisplay = $('#lastDuration');
if (timerDisplay) {
  const start = Date.now();
  const last = localStorage.getItem('lastSession') || '—';
  if (lastDisplay) lastDisplay.textContent = last;

  setInterval(() => {
    const sec = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    timerDisplay.textContent = `${h}:${m}:${s}`;
  }, 1000);

  window.addEventListener('beforeunload', () => {
    const total = Math.floor((Date.now() - start) / 1000);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    localStorage.setItem('lastSession', `${min}m ${sec}s`);
  });
}

// Sidebar toggle
const sidebarToggle = $('#sidebarToggle');
const app = $('.app');
if (sidebarToggle && app) {
  sidebarToggle.addEventListener('click', () => {
    app.classList.toggle('sidebar-collapsed');
    sidebarToggle.textContent = app.classList.contains('sidebar-collapsed')
      ? 'Expand'
      : 'Collapse';
  });
}

// Fallback for images
$$('img').forEach(img =>
  img.addEventListener('error', () => {
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTVlNWU1IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTQiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  })
);
