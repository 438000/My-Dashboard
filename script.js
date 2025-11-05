const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));


const year = new Date().getFullYear();
$$('#year,#year2,#year3').forEach(el => (el.textContent = year));


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
  return (
    JSON.parse(localStorage.getItem('loggedUser') || 'null') ||
    JSON.parse(sessionStorage.getItem('loggedUser') || 'null')
  );
}
function clearLoggedInUser() {
  localStorage.removeItem('loggedUser');
  sessionStorage.removeItem('loggedUser');
}
function goTo(url) {
  window.location.href = url;
}


const currentUser = getLoggedInUser();
const page = location.pathname.split('/').pop().toLowerCase();
const privatePages = ['index.html', 'skills.html', 'projects.html', ''];

if (privatePages.includes(page) && !currentUser) goTo('login.html');
if ((page === 'login.html' || page === 'signup.html') && currentUser)
  goTo('index.html');


const signupForm = $('#signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim().toLowerCase();
    const password = $('#signupPassword').value.trim();
    const age = Number($('#signupAge').value) || 20;

   
    $('#signupStatus').textContent = '';
    $('#signupNameError').textContent = '';
    $('#signupEmailError').textContent = '';
    $('#signupPasswordError').textContent = '';

 
    if (name.length < 2) return ($('#signupNameError').textContent = 'Enter your full name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return ($('#signupEmailError').textContent = 'Invalid email');
    if (password.length < 6)
      return ($('#signupPasswordError').textContent = 'Password must be at least 6 characters');

    const users = getUsers();
    if (users.some(u => u.email === email))
      return ($('#signupStatus').textContent = 'Email already registered! Try login.');

    users.push({ name, email, password, age });
    saveUsers(users);
    $('#signupStatus').textContent = 'Account created! Redirecting...';
    setTimeout(() => goTo('login.html'), 1200);
  });
}

// ===== Login =====
const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value.trim();
    const remember = $('#rememberMe').checked;
    $('#loginStatus').textContent = '';

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return ($('#loginStatus').textContent = ' Incorrect email or password');

    setLoggedInUser(user, remember);
    $('#loginStatus').textContent = ' Login successful! Redirecting...';
    setTimeout(() => goTo('index.html'), 800);
  });
}

$$('#logoutBtn,#logoutSidebar').forEach(btn => {
  if (btn) {
    btn.addEventListener('click', () => {
      clearLoggedInUser();
      goTo('login.html');
    });
  }
});


if (currentUser) {
  const ageField = $('#displayAge');
  if (ageField) ageField.textContent = currentUser.age;
  const nameField = $('#displayName');
  if (nameField) nameField.textContent = currentUser.name;
}


const themeToggle = $('#themeToggle');
if (themeToggle) {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', savedTheme === 'dark');
  themeToggle.textContent = savedTheme === 'dark' ? '🌙 Dark' : '☀️ Light';

  themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    themeToggle.textContent = dark ? '🌙 Dark' : '☀️ Light';
  });
}


function animateSkills() {
  $$('.skill').forEach(skill => {
    const value = Number(skill.dataset.value) || 0;
    const bar = skill.querySelector('.progress-bar');
    if (bar) {
      bar.style.width = '0';
      setTimeout(() => (bar.style.width = value + '%'), 200);
    }
  });
}
if (page === 'skills.html') setTimeout(animateSkills, 400);


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
        card.style.display = tech === 'all' || techs.includes(tech) ? 'block' : 'none';
      });
    });
  });
}


const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const status = $('#formStatus');

    status.textContent = '';
    if (name.length < 2) return (status.textContent = 'Enter your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return (status.textContent = 'Invalid email');
    if (message.length < 10) return (status.textContent = 'Message too short');

    status.textContent = ' Message sent successfully (Demo only)';
    contactForm.reset();
  });
}


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


$$('img').forEach(img => {
  img.addEventListener('error', () => {
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTVlNWU1IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTQiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  });
});
