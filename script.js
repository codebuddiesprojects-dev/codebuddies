/* ============================================================
   CODEBUDDIES – script.js
   ============================================================ */

// ===== SPACE CANVAS =====
(function() {
  const canvas = document.getElementById('spaceCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], nebulae = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });

  function rand(a, b) { return a + Math.random() * (b - a); }

  function init() {
    // Stars
    stars = Array.from({ length: 280 }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.3, 2.2),
      alpha: rand(0.2, 0.9),
      speed: rand(0.02, 0.08),
      twinkleSpeed: rand(0.005, 0.02),
      twinkleDir: 1,
      color: Math.random() > 0.7 ? '#a0c8ff' : Math.random() > 0.5 ? '#c8aaff' : '#ffffff'
    }));

    // Nebula blobs
    nebulae = Array.from({ length: 5 }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(120, 300),
      alpha: rand(0.01, 0.04),
      hue: Math.random() > 0.5 ? '200, 245, 255' : '168, 85, 247',
      dx: rand(-0.1, 0.1),
      dy: rand(-0.1, 0.1)
    }));
  }
  init();

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw nebulae
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `rgba(${n.hue}, ${n.alpha})`);
      g.addColorStop(1, `rgba(${n.hue}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      n.x += n.dx; n.y += n.dy;
      if (n.x < -n.r) n.x = W + n.r;
      if (n.x > W + n.r) n.x = -n.r;
      if (n.y < -n.r) n.y = H + n.r;
      if (n.y > H + n.r) n.y = -n.r;
    });

    // Draw stars
    stars.forEach(s => {
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha >= 1 || s.alpha <= 0.1) s.twinkleDir *= -1;
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = rand(0, W); }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Occasional glow for brighter stars
      if (s.r > 1.5) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        g.addColorStop(0, `rgba(180, 220, 255, ${s.alpha * 0.3})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== CUSTOM CURSOR =====
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});
document.querySelectorAll('a, button, .faq-q, .intern-card, .service-card, .why-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorGlow.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursorGlow.classList.remove('expanded'));
});

// ===== NAVIGATION =====
const mainNav  = document.getElementById('mainNav');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNav();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Smooth scroll on nav links
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
updateActiveNav();

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isDecimal = el.classList.contains('stat-decimal');
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// Trigger counters when hero stats are visible
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounters();
    statsObserver.disconnect();
  }
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== PARALLAX HERO =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.querySelector('#hero .hero-content');
  if (hero && scrollY < window.innerHeight) {
    hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }
  const planets = document.querySelectorAll('.planet');
  planets.forEach((p, i) => {
    const factor = [0.15, 0.1, 0.2][i] || 0.1;
    p.style.transform += ` translateY(${scrollY * factor}px)`;
  });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== LEGAL MODALS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

document.getElementById('privacyToggle').addEventListener('click', () => openModal('privacyModal'));
document.getElementById('termsToggle'  ).addEventListener('click', () => openModal('termsModal'));
document.getElementById('privacyClose' ).addEventListener('click', () => closeModal('privacyModal'));
document.getElementById('termsClose'   ).addEventListener('click', () => closeModal('termsModal'));

document.querySelectorAll('.legal-modal').forEach(modal => {
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal.id); });
});

// ===== AI CHATBOT =====
(function() {
  const aiBtn   = document.getElementById('aiBtn');
  const aiModal = document.getElementById('aiModal');
  const aiClose = document.getElementById('aiClose');
  const chatBody = document.getElementById('chatBody');
  const aiOptions = document.getElementById('aiOptions');

  let chatCount = 0;
  const LIMIT = 10;

  function addMsg(text, cls) {
    const d = document.createElement('div');
    d.className = 'message ' + cls;
    d.textContent = text;
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  const ai   = t => addMsg(t, 'ai-message');
  const user = t => addMsg(t, 'user-message');

  function showMainOptions() {
    aiOptions.innerHTML = `
      <button data-cat="concept">Concept explanations</button>
      <button data-cat="coding">Coding doubts</button>
      <button data-cat="error">Error fixing</button>
      <button data-cat="learning">Learning paths</button>
      <button data-cat="project">Project guidance</button>
      <button data-cat="docs">Docs & resume</button>
    `;
  }

  function showWelcome() {
    ai("Hello! I'm CodeBuddies AI 👋\n\nI can help with:\n• Concept explanations\n• Coding doubts\n• Error understanding\n• Learning paths\n• Project guidance\n• Docs & resume tips\n\nFor advanced help, connect with us directly!");
    showMainOptions();
  }

  aiBtn.addEventListener('click', () => {
    aiModal.classList.add('active');
    if (!chatBody.children.length) showWelcome();
  });
  aiClose.addEventListener('click', () => aiModal.classList.remove('active'));

  const map = {
    concept:  ['What is Python?', 'What is JavaScript?', 'What is Machine Learning?'],
    coding:   ['How to debug code?', 'What are logic errors?', 'How to use APIs?'],
    error:    ['Syntax error help', 'Runtime error help', 'Logic error help'],
    learning: ['Python learning path', 'Web dev path', 'AI/ML learning path'],
    project:  ['Project ideas for CSE', 'IoT project ideas', 'Data science projects'],
    docs:     ['Resume tips', 'How to write documentation', 'Course completion report format']
  };

  const answers = {
    'What is Python?': "Python is a beginner-friendly, versatile language used in AI, data science, automation, and web development. It's one of the best first languages to learn!",
    'What is JavaScript?': "JavaScript is the language of the web. It runs in browsers and on servers (Node.js), making it essential for web development.",
    'What is Machine Learning?': "Machine Learning is a branch of AI where systems learn patterns from data to make predictions or decisions without being explicitly programmed.",
    'How to debug code?': "Start by reading the error message carefully. Then: 1) Print variable values, 2) Comment out sections to isolate the bug, 3) Use a debugger tool.",
    'Python learning path': "For Python: Start with basics (variables, loops, functions) → OOP → libraries (NumPy, Pandas) → a mini project. Aim for 2-3 hours/day!",
    'Web dev path': "For web dev: HTML/CSS → JavaScript → React or Vue → Node.js backend → Database → Deploy a full-stack project.",
    'AI/ML learning path': "For AI/ML: Python basics → Math (linear algebra, stats) → Scikit-learn → Deep Learning (TensorFlow/PyTorch) → Real projects.",
  };

  aiOptions.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    if (++chatCount > LIMIT) {
      ai("You've reached today's limit! 😊\n\nContact us directly:\n📞 +91 97890 01021\n📧 connect@codebuddies.co.in");
      aiOptions.innerHTML = '';
      return;
    }
    const cat = e.target.dataset.cat;
    const q   = e.target.dataset.q;
    if (cat) {
      user(e.target.textContent);
      aiOptions.innerHTML = map[cat].map(q => `<button data-q="${encodeURIComponent(q)}">${q}</button>`).join('') + '<button id="backBtn">← Back</button>';
      document.getElementById('backBtn').onclick = () => { showMainOptions(); };
      return;
    }
    if (q) {
      const decoded = decodeURIComponent(q);
      user(decoded);
      const ans = answers[decoded] || "Great question! For a detailed answer tailored to your situation, I recommend reaching out to our mentors at CodeBuddies. We'd love to help you directly! 🚀";
      setTimeout(() => ai(ans), 400);
      setTimeout(showMainOptions, 1200);
    }
  });
})();

// ===== TYPING EFFECT FOR HERO TITLE =====
(function() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  title.style.opacity = '1';
  // Title is revealed via CSS animation; no need for JS typing here.
})();

// ===== CARD TILT EFFECT =====
document.querySelectorAll('.intern-card, .why-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== CONTACT FORM – EMAILJS + SMART ROUTING =====
// Sends a real email to connect@codebuddies.co.in via EmailJS,
// then opens the correct Google registration form in a new tab.
//
// ── SETUP (one-time, 5 minutes) ──────────────────────────────
// 1. Go to https://www.emailjs.com and sign up free
// 2. Dashboard → Email Services → Add Service → Gmail
//    Connect your connect@codebuddies.co.in Gmail account
//    Copy the Service ID  →  paste as EMAILJS_SERVICE_ID below
// 3. Dashboard → Email Templates → Create Template
//    Paste this template (exact variable names matter):
//    ─────────────────────────────────────────────
//    Subject:  New Enquiry: {{interest}} — {{from_name}}
//    Body:
//    You have a new enquiry from the CodeBuddies website.
//
//    Name:     {{from_name}}
//    Email:    {{from_email}}
//    Interest: {{interest}}
//    Message:  {{message}}
//
//    — Sent from codebuddies.co.in
//    ─────────────────────────────────────────────
//    In template settings set "To Email" to connect@codebuddies.co.in
//    Copy the Template ID  →  paste as EMAILJS_TEMPLATE_ID below
// 4. Dashboard → Account → Public Key
//    Copy the Public Key  →  paste as EMAILJS_PUBLIC_KEY below
// ─────────────────────────────────────────────────────────────

(function () {
  // ↓↓↓ PASTE YOUR EMAILJS CREDENTIALS HERE ↓↓↓
  const EMAILJS_SERVICE_ID  = 'service_6uyfdn8';
  const EMAILJS_TEMPLATE_ID = 'template_aq3dipg';
  const EMAILJS_PUBLIC_KEY  = 'IbVHBPGql6iBZujQL';
  // ↑↑↑ ─────────────────────────────────────── ↑↑↑

  const COURSE_FORM  = 'https://docs.google.com/forms/d/e/1FAIpQLScg6iBAU5OQoYykUS06jeDqaYPb6EXknP8qqA2IJ8lIIfJAEA/viewform?usp=header';
  const PROJECT_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfAk4xsXGvi0W4Ze7LbxbOxAWCgQJNl9j85Ha8zFxKGvEUVug/viewform?usp=header';

  // Initialise EmailJS with your public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form      = document.getElementById('contactForm');
  const feedback  = document.getElementById('cf-feedback');
  const submitBtn = document.getElementById('cf-submit');

  if (!form) return;

  function showFeedback(msg, type) {
    feedback.style.cssText = [
      'display:block',
      'padding:10px 14px',
      'border-radius:10px',
      'font-family:var(--font-ui)',
      'font-size:0.85rem',
      'margin-bottom:12px',
      'line-height:1.5',
      type === 'error'
        ? 'background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.3);color:#ff8080;'
        : 'background:rgba(16,255,168,0.08);border:1px solid rgba(16,255,168,0.3);color:#10ffa8;'
    ].join(';');
    feedback.textContent = msg;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const select  = document.getElementById('cf-program');
    const type    = select.value;
    const label   = select.options[select.selectedIndex]?.dataset?.label
                    || select.options[select.selectedIndex]?.text || '';
    const message = document.getElementById('cf-message').value.trim();

    // ── Validation ──
    if (!name)  { showFeedback('⚠ Please enter your name.', 'error'); return; }
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      showFeedback('⚠ Please enter a valid email address.', 'error'); return;
    }
    if (!type)  { showFeedback('⚠ Please select a program of interest.', 'error'); return; }

    // ── UI: loading state ──
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-glow"></span>Sending... ⏳';
    feedback.style.display = 'none';

    const destURL = type === 'project' ? PROJECT_FORM : COURSE_FORM;

    // ── Send email via EmailJS ──
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name : name,
        from_email: email,
        interest  : label,
        message   : message || '(no message)',
      });

      // ── Success ──
      showFeedback('✅ Message sent! We\'ll be in touch soon. Opening your registration form now...', 'success');
      submitBtn.innerHTML = '<span class="btn-glow"></span>Sent ✓';

      // Reset form fields
      form.reset();

      // Open the correct registration form in a new tab
      setTimeout(() => { window.open(destURL, '_blank'); }, 1000);

    } catch (err) {
      // ── Error ──
      console.error('EmailJS error:', err);
      showFeedback('⚠ Could not send message. Please email us directly at connect@codebuddies.co.in', 'error');
      submitBtn.innerHTML = '<span class="btn-glow"></span>Send &amp; Register 🚀';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

// ===== PERFORMANCE: defer non-critical =====
window.addEventListener('load', () => {
  // Trigger initial reveals for above-fold elements
  document.querySelectorAll('#hero .reveal-up').forEach(el => el.classList.add('visible'));
});
