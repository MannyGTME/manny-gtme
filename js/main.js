// ─── Load animation (home page stagger) ───────────────────────
document.querySelectorAll('[data-load]').forEach((el, i) => {
  el.style.transitionDelay = `${i * 90}ms`;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('loaded')));
});

// ─── Scroll reveal ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ─── Multi-step contact form ───────────────────────────────────
const form = document.getElementById('contact-form');
if (form) {
  let currentStep = 1;
  const totalSteps = 4;

  function getStepEl(n) {
    return form.querySelector(`[data-step="${n}"]`);
  }

  function setProgress(step) {
    const fill = document.querySelector('.progress-fill');
    const counter = document.querySelector('.step-counter');
    if (fill) fill.style.width = `${(step / totalSteps) * 100}%`;
    if (counter) counter.textContent = `Step ${step} of ${totalSteps}`;
  }

  function goToStep(next) {
    const currentEl = getStepEl(currentStep);
    const nextEl = getStepEl(next);
    if (!nextEl) return;

    currentEl.style.transition = 'opacity 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)';
    currentEl.style.opacity = '0';
    currentEl.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      currentEl.classList.remove('step-active');
      currentEl.style.opacity = '';
      currentEl.style.transform = '';
      currentEl.style.transition = '';

      nextEl.style.opacity = '0';
      nextEl.style.transform = 'translateY(14px)';
      nextEl.classList.add('step-active');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        nextEl.style.transition = 'opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        nextEl.style.opacity = '1';
        nextEl.style.transform = 'none';
      }));

      currentStep = next;
      setProgress(next);
    }, 260);
  }

  function validateStep(stepEl) {
    // Validate text/email/url inputs
    const textInputs = stepEl.querySelectorAll('input[type="text"], input[type="email"], input[type="url"]');
    for (const input of textInputs) {
      if (input.required && !input.value.trim()) return false;
    }
    // Validate at least one checkbox/radio per named group
    const names = new Set();
    stepEl.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => names.add(i.name));
    for (const name of names) {
      if (!stepEl.querySelector(`input[name="${name}"]:checked`)) return false;
    }
    return true;
  }

  // Next buttons
  form.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepEl = getStepEl(currentStep);
      if (!validateStep(stepEl)) {
        // Brief shake feedback
        stepEl.style.transform = 'translateX(-4px)';
        setTimeout(() => { stepEl.style.transform = 'translateX(4px)'; }, 60);
        setTimeout(() => { stepEl.style.transform = ''; }, 120);
        return;
      }
      goToStep(currentStep + 1);
    });
  });

  // Form submission
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const stepEl = getStepEl(currentStep);
    if (!validateStep(stepEl)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    // Serialize all form data
    const payload = {};
    new FormData(form).forEach((val, key) => {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = [].concat(payload[key], val);
      } else {
        payload[key] = val;
      }
    });

    try {
      await fetch('https://your-n8n-webhook-url.com/catch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // Show success regardless — network errors shouldn't block UX
    }

    // Transition to success state
    const container = document.getElementById('form-container');
    const success = document.getElementById('form-success');

    container.style.transition = 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)';
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      container.style.display = 'none';
      success.style.display = 'block';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        success.style.opacity = '1';
        success.style.transform = 'none';
      }));
    }, 300);
  });
}
