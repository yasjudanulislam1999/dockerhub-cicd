/* ===== NAVIGATION ===== */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  updateActiveNavLink();
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
}

mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      const raw = entry.target.dataset.count;
      const suffix = entry.target.dataset.suffix || '';
      const target = parseFloat(raw);
      animateCounter(entry.target, target, 1800, suffix);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ===== CONTACT FORM TABS ===== */
const enquiryBtns = document.querySelectorAll('.enquiry-btn');
const enquiryTypeInput = document.getElementById('enquiry-type');

enquiryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    enquiryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (enquiryTypeInput) {
      enquiryTypeInput.value = btn.dataset.type;
    }
  });
});

/* ===== FORM SUBMISSION ===== */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent</span>';
      btn.style.background = 'linear-gradient(135deg, #2d6a2d, #1e4d1e)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
        enquiryBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
      }, 3500);
    }, 1500);
  });
}

/* ===== NEWSLETTER FORM ===== */
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn = form.querySelector('button');
    btn.innerHTML = '✓';
    btn.style.background = '#2d6a2d';
    input.value = '';
    setTimeout(() => {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>`;
      btn.style.background = '';
    }, 2500);
  });
});

/* ===== SMOOTH SCROLL FOR ANCHOR LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
