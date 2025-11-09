(function(){
  // helpers
  const qs = s => document.querySelector(s)
  const qsa = s => Array.from(document.querySelectorAll(s))
  const nowYear = new Date().getFullYear()
  qsa('#year,#year2,#year3').forEach(el => { if(el) el.textContent = nowYear })

  // ---------- AUTH FUNCTIONS ----------
  function getUsers(){ 
    try { 
      return JSON.parse(localStorage.getItem('sadaf_users') || '[]'); 
    } catch(e){ 
      return []; 
    } 
  }

  function saveUsers(users){ 
    localStorage.setItem('sadaf_users', JSON.stringify(users)); 
  }

  function setLogged(userObj, remember){
    const serialized = JSON.stringify(userObj);
    if(remember) {
      localStorage.setItem('sadaf_logged', serialized);
    } else {
      sessionStorage.setItem('sadaf_logged', serialized);
    }
  }

  function clearLogged(){
    localStorage.removeItem('sadaf_logged'); 
    sessionStorage.removeItem('sadaf_logged');
  }

  function getLogged(){
    const logged = localStorage.getItem('sadaf_logged') || sessionStorage.getItem('sadaf_logged');
    return logged ? JSON.parse(logged) : null;
  }

  function go(url){ window.location.href = url; }

  // ---------- AUTH CHECK & REDIRECTION ----------
  const logged = getLogged();
  const path = location.pathname.split('/').pop().toLowerCase();

  // If on auth pages and already logged in -> go to index
  if((path === 'login.html' || path === 'signup.html') && logged){
    go('index.html');
  }

  // Protect pages: index.html, skills.html, projects.html require login
  const protectedPages = ['index.html','skill.html','project.html',''];
  if(protectedPages.includes(path) && !logged && path !== 'login.html' && path !== 'signup.html'){
    go('login.html');
  }

  // ---------- LOGOUT FUNCTIONALITY ----------
  function setupLogoutButtons() {
    qsa('#logoutBtn,#logoutBtn2,#logoutBtn3,#logoutSidebar').forEach(btn => {
      if(btn){
        btn.addEventListener('click', e => {
          e.preventDefault();
          clearLogged();
          go('login.html');
        });
        
        // Show logout button if user is logged in
        if(logged) {
          btn.style.display = 'block';
        }
      }
    });
  }

  // Initialize logout buttons
  setupLogoutButtons();

  // Show user info if logged in
  if(logged){
    const displayAge = qs('#displayAge');
    if(displayAge) displayAge.textContent = logged.age || 21;
    
    // Show user name in sidebar if available
    const userMeta = qs('.user .meta div');
    if(userMeta && logged.name) {
      userMeta.textContent = logged.name;
    }
  }

  // ---------- THEME SWITCHER (home only) ----------
  const themeToggle = qs('#themeToggle')
  if(themeToggle && path === 'index.html'){
    // persist in localStorage
    const saved = localStorage.getItem('sadaf_home_theme') || 'light'
    document.body.classList.toggle('dark', saved === 'dark')
    themeToggle.setAttribute('aria-pressed', String(saved === 'dark'))
    const themeText = qs('#themeText')
    if(themeText) themeText.textContent = saved === 'dark' ? 'Dark Mode' : 'Light Mode'
    
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark')
      localStorage.setItem('sadaf_home_theme', isDark ? 'dark' : 'light')
      themeToggle.setAttribute('aria-pressed', String(isDark))
      if(themeText) themeText.textContent = isDark ? 'Dark Mode' : 'Light Mode'
    })
  }

  // ---------- SKILL BARS (skills page) ----------
  function animateSkills(){
    qsa('.skill-item').forEach(skill => {
      const value = Number(skill.dataset.value) || 0
      const bar = skill.querySelector('.progress-bar')
      if(bar){
        // Set the width immediately to the target value
        bar.style.width = value + '%'
      }
    })
  }
  
  // Initialize skill bars when page loads
  if(path === 'skill.html') {
    // Use Intersection Observer to animate when skills come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    const skillsSection = qs('.skills-categories');
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  }

  // ---------- PROJECT FILTER (projects page) ----------
  const filterBtns = qsa('.filter-btn')
  const projectCards = qsa('.project-card')
  if(filterBtns.length && projectCards.length){
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tech = btn.dataset.tech
        filterBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        
        projectCards.forEach(card => {
          const cardTechs = card.dataset.tech.split(',')
          if(tech === 'all' || cardTechs.includes(tech)){
            card.style.display = 'block'
          } else {
            card.style.display = 'none'
          }
        })
      })
    })
  }

  // ---------- CONTACT FORM (home page) ----------
  const contactForm = qs('#contactForm')
  if(contactForm){
    contactForm.addEventListener('submit', e => {
      e.preventDefault()
      const name = qs('#name').value.trim()
      const email = qs('#email').value.trim()
      const message = qs('#message').value.trim()
      
      qs('#nameError').textContent = ''
      qs('#emailError').textContent = ''
      qs('#messageError').textContent = ''
      qs('#formStatus').textContent = ''
      
      let ok = true
      if(name.length < 2){ 
        qs('#nameError').textContent = 'Enter your name'; 
        ok=false 
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if(!emailRegex.test(email)){ 
        qs('#emailError').textContent = 'Enter valid email'; 
        ok=false 
      }
      if(message.length < 10){ 
        qs('#messageError').textContent = 'Message too short'; 
        ok=false 
      }
      
      if(!ok) return
      
      qs('#formStatus').textContent = 'Message sent! (demo)'
      qs('#formStatus').style.color = '#00c853'
      contactForm.reset()
      setTimeout(() => { qs('#formStatus').textContent = '' }, 3000)
    })
  }

  // ---------- SESSION TIMER (home page) ----------
  const sessionTimer = qs('#sessionTimer')
  const lastDuration = qs('#lastDuration')
  if(sessionTimer){
    const startTime = Date.now()
    const last = localStorage.getItem('sadaf_last_duration') || '—'
    if(lastDuration) lastDuration.textContent = last
    
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const secs = Math.floor(elapsed / 1000)
      const hrs = Math.floor(secs / 3600)
      const mins = Math.floor((secs % 3600) / 60)
      const secsRemain = secs % 60
      sessionTimer.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secsRemain.toString().padStart(2, '0')}`
    }, 1000)
    
    // save duration on page unload
    window.addEventListener('beforeunload', () => {
      const elapsed = Date.now() - startTime
      const mins = Math.floor(elapsed / 60000)
      const secs = Math.floor((elapsed % 60000) / 1000)
      localStorage.setItem('sadaf_last_duration', `${mins}m ${secs}s`)
    })
  }

  // ---------- SIDEBAR TOGGLE ----------
  const sidebarToggle = qs('#sidebarToggle')
  const mobileSidebarToggle = qs('#mobileSidebarToggle')
  const app = qs('.app')
  
  if(sidebarToggle){
    sidebarToggle.addEventListener('click', () => {
      app.classList.toggle('sidebar-collapsed')
      sidebarToggle.textContent = app.classList.contains('sidebar-collapsed') ? 'Expand' : 'Collapse'
    })
  }
  
  if(mobileSidebarToggle){
    mobileSidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open')
    })
  }

  // ---------- IMAGE FALLBACK ----------
  qsa('img').forEach(img => {
    img.addEventListener('error', function(){
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='
    })
  })

  // ---------- FORM VALIDATION STYLING ----------
  // Add error styling to form inputs
  qsa('input, textarea').forEach(input => {
    input.addEventListener('blur', function() {
      const errorElement = this.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error') && errorElement.textContent) {
        this.style.borderColor = '#ff4d4d';
      } else {
        this.style.borderColor = '';
      }
    });
    
    input.addEventListener('input', function() {
      const errorElement = this.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error')) {
        errorElement.textContent = '';
        this.style.borderColor = '';
      }
    });
  });

})();