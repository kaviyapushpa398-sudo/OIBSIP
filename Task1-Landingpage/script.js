/* ===========================
   StudyCircle — script.js
=========================== */

// ── NAV SCROLL EFFECT ──────────────────────────────────────────────
const nav = document.getElementById('nav');

function handleNavScroll() {
  if (window.scrollY > 30) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();


// ── HAMBURGER MENU ─────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


// ── SCROLL REVEAL ──────────────────────────────────────────────────
function addRevealClasses() {
  const targets = [
    '.feature-card',
    '.step',
    '.admin-card',
    '.int-feature',
    '.section-tag',
    '.section-title',
    '.section-sub',
    '.lb-wrap',
    '.interactive-text',
    '.interactive-visual',
    '.quiz-card',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings inside the same parent
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) * 80 : i * 60;
      el.style.transitionDelay = delay + 'ms';
    });
  });
}

addRevealClasses();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── COUNTER ANIMATION ──────────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const startVal = 0;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = Math.floor(startVal + (target - startVal) * eased);

    // Format with commas
    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(step);
}

// Observe stat numbers and start counter when visible
const statNums = document.querySelectorAll('.stat-num[data-target]');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

statNums.forEach(el => counterObserver.observe(el));


// ── SCORE BAR ANIMATION ────────────────────────────────────────────
const scoreFill = document.getElementById('scoreFill');

if (scoreFill) {
  const scoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            scoreFill.style.width = '87%';
          }, 400);
          scoreObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  scoreObserver.observe(scoreFill);
}


// ── QUIZ OPTION INTERACTION ────────────────────────────────────────
document.querySelectorAll('.quiz-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    // Remove any previously-selected class from siblings
    const siblings = this.closest('.quiz-options').querySelectorAll('.quiz-opt');
    siblings.forEach(s => s.classList.remove('selected', 'wrong'));

    if (this.classList.contains('correct')) {
      // Already styled as correct — give it a pulse
      this.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: 'ease' }
      );
    } else {
      this.classList.add('wrong');
      // Highlight the correct answer
      document.getElementById('correctOpt')?.classList.add('correct');
    }
  });
});

// Add CSS for "wrong" state dynamically
(function injectWrongStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .quiz-opt.wrong {
      background: rgba(220,38,38,0.15) !important;
      border-color: rgba(220,38,38,0.5) !important;
      color: #f87171 !important;
    }
  `;
  document.head.appendChild(style);
})();


// ── LEADERBOARD TAB SWITCHING ──────────────────────────────────────
const lbData = {
  cs: [
    { rank: '🥇 1', name: 'Group Alpha',  members: 'Arun, Priya, Dev',   score: '2840 pts', sessions: '24 sessions' },
    { rank: '🥈 2', name: 'Group Nova',   members: 'Meera, Kiran, Sam',  score: '2610 pts', sessions: '22 sessions' },
    { rank: '🥉 3', name: 'Group Spark',  members: 'Tara, Ravi, Leo',    score: '2390 pts', sessions: '20 sessions' },
    { rank: '4',    name: 'Group Delta',  members: 'Nia, Vik, Asha',     score: '2100 pts', sessions: '18 sessions' },
    { rank: '5',    name: 'Group Zenith', members: 'Raj, Pooja, Chris',  score: '1980 pts', sessions: '17 sessions' },
  ],
  mech: [
    { rank: '🥇 1', name: 'Group Torque',  members: 'Arjun, Sana, Ben',   score: '2760 pts', sessions: '23 sessions' },
    { rank: '🥈 2', name: 'Group Piston',  members: 'Kavya, Tom, Nira',   score: '2480 pts', sessions: '21 sessions' },
    { rank: '🥉 3', name: 'Group Gear',    members: 'Suresh, Lily, Omar', score: '2200 pts', sessions: '19 sessions' },
    { rank: '4',    name: 'Group Volt',    members: 'Mia, Raj, Hema',     score: '1950 pts', sessions: '16 sessions' },
    { rank: '5',    name: 'Group Flux',    members: 'Dan, Anita, Yash',   score: '1820 pts', sessions: '15 sessions' },
  ],
  ee: [
    { rank: '🥇 1', name: 'Group Circuit', members: 'Priya, Ken, Diya',   score: '2900 pts', sessions: '25 sessions' },
    { rank: '🥈 2', name: 'Group Ohm',     members: 'Rohan, Sara, Jo',    score: '2630 pts', sessions: '22 sessions' },
    { rank: '🥉 3', name: 'Group Watt',    members: 'Leila, Max, Tina',   score: '2350 pts', sessions: '20 sessions' },
    { rank: '4',    name: 'Group Amp',     members: 'Carlos, Nisha, Ed',  score: '2050 pts', sessions: '18 sessions' },
    { rank: '5',    name: 'Group Hertz',   members: 'Aditi, Mark, Rupa',  score: '1900 pts', sessions: '16 sessions' },
  ],
};

const rankClasses = ['gold', 'silver', 'bronze', '', ''];

function renderLeaderboard(dept) {
  const table = document.querySelector('.lb-table');
  if (!table) return;

  // Keep header row
  const header = table.querySelector('.lb-header');

  // Remove old data rows
  table.querySelectorAll('.lb-row:not(.lb-header)').forEach(r => r.remove());

  const rows = lbData[dept] || [];

  rows.forEach((row, i) => {
    const div = document.createElement('div');
    div.className = 'lb-row' + (i === 0 ? ' lb-top' : '');
    div.innerHTML = `
      <span class="rank-badge ${rankClasses[i]}">${row.rank}</span>
      <span>${row.name}</span>
      <span>${row.members}</span>
      <span>${row.score}</span>
      <span>${row.sessions}</span>
    `;
    // Animate in
    div.style.opacity = '0';
    div.style.transform = 'translateX(-10px)';
    table.appendChild(div);

    setTimeout(() => {
      div.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      div.style.opacity = '1';
      div.style.transform = 'translateX(0)';
    }, i * 60);
  });
}

document.querySelectorAll('.lb-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    renderLeaderboard(this.dataset.dept);
  });
});


// ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ── CTA BUTTON RIPPLE EFFECT ───────────────────────────────────────
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 0; height: 0;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      left: ${x}px; top: ${y}px;
      pointer-events: none;
      animation: rippleAnim 0.6s ease-out forwards;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 700);
  });
});

// Inject ripple keyframe
(function injectRipple() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { width: 200px; height: 200px; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();


// ── PHONE CHAT ANIMATION ───────────────────────────────────────────
(function animateChat() {
  const bubbles = document.querySelectorAll('.chat-bubble');
  bubbles.forEach((bubble, i) => {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(6px)';
    setTimeout(() => {
      bubble.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0)';
    }, 500 + i * 600);
  });
})();


// ── TIMER COUNTDOWN (visual only) ─────────────────────────────────
(function startTimer() {
  const timerEl = document.querySelector('.timer-text');
  if (!timerEl) return;

  let totalSeconds = 24 * 60 + 13;

  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 30 * 60;
    totalSeconds--;
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;

    // Update ring progress
    const ring = document.querySelector('.phone-timer circle:last-child');
    if (ring) {
      const total = 30 * 60;
      const progress = totalSeconds / total;
      const circumference = 163;
      ring.setAttribute('stroke-dashoffset', circumference * (1 - progress));
    }
  }, 1000);
})();


// ── ACTIVE NAV LINK ON SCROLL ──────────────────────────────────────
(function trackActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--text)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));
})();
