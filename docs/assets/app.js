(() => {
  const sections = [...document.querySelectorAll('.section')];
  const navLinks = [...document.querySelectorAll('#section-nav a')];
  const progressBar = document.querySelector('#progress-bar');
  const currentStep = document.querySelector('#current-step');
  const totalSteps = document.querySelector('#total-steps');
  const presentButton = document.querySelector('#present-button');
  const exitPresentationButton = document.querySelector('#exit-presentation');
  const previousButton = document.querySelector('#previous-section');
  const nextButton = document.querySelector('#next-section');
  const toast = document.querySelector('#toast');
  let activeIndex = 0;
  let toastTimer;

  totalSteps.textContent = String(sections.length);

  const setActive = (index, updateHash = false) => {
    activeIndex = Math.max(0, Math.min(index, sections.length - 1));
    const section = sections[activeIndex];
    sections.forEach((item, itemIndex) => item.classList.toggle('present-active', itemIndex === activeIndex));
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${section.id}`));
    currentStep.textContent = String(activeIndex + 1);
    progressBar.style.width = `${((activeIndex + 1) / sections.length) * 100}%`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === sections.length - 1;
    if (updateHash) history.replaceState(null, '', `#${section.id}`);
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 1400);
  };

  document.querySelectorAll('pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy command');
    button.textContent = '⧉';
    button.addEventListener('click', async () => {
      const text = pre.querySelector('code')?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text.trim());
        showToast('Command copied');
      } catch {
        showToast('Copy unavailable');
      }
    });
    pre.append(button);
  });

  document.querySelectorAll('[data-checklist]').forEach((list) => {
    const key = `care-workshop-checklist-${list.dataset.checklist}`;
    const inputs = [...list.querySelectorAll('input[type="checkbox"]')];
    let stored = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      stored = Array.isArray(parsed) ? parsed : [];
    } catch { stored = []; }
    inputs.forEach((input, index) => {
      input.checked = Boolean(stored[index]);
      input.addEventListener('change', () => {
        try { localStorage.setItem(key, JSON.stringify(inputs.map((item) => item.checked))); } catch { /* Keep the checklist usable when storage is unavailable. */ }
      });
    });
    list.querySelector('.reset-checks')?.addEventListener('click', () => {
      inputs.forEach((input) => { input.checked = false; });
      try { localStorage.removeItem(key); } catch { /* Keep reset usable when storage is unavailable. */ }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    if (document.body.classList.contains('presentation')) return;
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = sections.indexOf(visible.target);
    if (index >= 0) setActive(index);
  }, { threshold: [0.35, 0.55, 0.75] });
  sections.forEach((section) => observer.observe(section));

  const enterPresentation = () => {
    document.body.classList.add('presentation');
    presentButton.setAttribute('aria-pressed', 'true');
    presentButton.textContent = 'Exit';
    const hashIndex = sections.findIndex((section) => `#${section.id}` === location.hash);
    setActive(hashIndex >= 0 ? hashIndex : activeIndex, true);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const exitPresentation = () => {
    document.body.classList.remove('presentation');
    presentButton.setAttribute('aria-pressed', 'false');
    presentButton.textContent = 'Present';
    document.exitFullscreen?.().catch(() => {});
    sections[activeIndex].scrollIntoView({ block: 'start' });
  };

  presentButton.addEventListener('click', () => {
    document.body.classList.contains('presentation') ? exitPresentation() : enterPresentation();
  });
  exitPresentationButton.addEventListener('click', exitPresentation);
  previousButton.addEventListener('click', () => setActive(activeIndex - 1, true));
  nextButton.addEventListener('click', () => setActive(activeIndex + 1, true));

  document.addEventListener('keydown', (event) => {
    if (!document.body.classList.contains('presentation')) return;
    if (event.key === 'Escape') {
      exitPresentation();
      return;
    }
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, summary, [contenteditable="true"]')) return;

    const activeSection = sections[activeIndex];
    const pageStep = Math.max(120, Math.round(activeSection.clientHeight * 0.8));
    const atTop = activeSection.scrollTop <= 1;
    const atBottom = activeSection.scrollTop + activeSection.clientHeight >= activeSection.scrollHeight - 1;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActive(activeIndex + 1, true);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActive(activeIndex - 1, true);
    }
    if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      if (atBottom) setActive(activeIndex + 1, true);
      else activeSection.scrollBy({ top: event.key === 'ArrowDown' ? 80 : pageStep, behavior: 'smooth' });
    }
    if (['ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      if (atTop) setActive(activeIndex - 1, true);
      else activeSection.scrollBy({ top: event.key === 'ArrowUp' ? -80 : -pageStep, behavior: 'smooth' });
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('presentation')) exitPresentation();
  });

  window.addEventListener('scroll', () => {
    if (document.body.classList.contains('presentation')) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) progressBar.style.width = `${(window.scrollY / max) * 100}%`;
  }, { passive: true });

  const initialIndex = sections.findIndex((section) => `#${section.id}` === location.hash);
  setActive(initialIndex >= 0 ? initialIndex : 0);
})();
