function normalizePath(pathname) {
  var cleaned = (pathname || '').replace(/\/+$/, '');
  return cleaned || '/';
}

function initNavScroll() {
  var nav = document.getElementById('nav');
  if (!nav) return;

  function handleNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll);
}

function initNavDropdowns() {
  var nav = document.getElementById('nav');
  var navList = document.querySelector('.nav-links');
  if (!nav || !navList) return;
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var dropdownParents = [];

  function isMobileNav() {
    return mobileQuery.matches;
  }

  function closeDropdown(parentLi) {
    if (!parentLi) return;
    parentLi.classList.remove('mobile-open');
  }

  function closeAllDropdowns(exceptLi) {
    dropdownParents.forEach(function (parentLi) {
      if (exceptLi && parentLi === exceptLi) return;
      closeDropdown(parentLi);
    });
  }

  function openDropdown(parentLi) {
    closeAllDropdowns(parentLi);
    parentLi.classList.add('mobile-open');
  }

  var menuConfig = {
    art: [
      { label: 'Works', href: '/art/#works' },
      { label: 'About', href: '/art/#about' },
      { label: 'Process', href: '/art/#process' }
    ],
    projects: [
      { label: 'All Projects', href: '/projects/' },
      { label: 'Adaptive Task Intelligence', href: '/projects/chores/' },
      { label: 'Autonomous Portfolio Intelligence', href: '/projects/ai-investor/' }
    ],
    contact: [
      { label: 'Overview', href: '/contact/#contact-top' },
      { label: 'Details', href: '/contact/#contact-details' },
      { label: 'Experience', href: '/contact/#experience' },
      { label: 'Skills', href: '/contact/#skills' },
      { label: 'Education', href: '/contact/#education' }
    ]
  };

  var currentPath = normalizePath(window.location.pathname);
  var currentHash = window.location.hash || '';

  navList.querySelectorAll('li > a').forEach(function (linkEl) {
    var key = (linkEl.textContent || '').trim().toLowerCase();
    var options = menuConfig[key];
    if (!options || !options.length) return;

    var parentLi = linkEl.parentElement;
    if (!parentLi) return;

    parentLi.classList.add('nav-has-dropdown');
    linkEl.setAttribute('aria-haspopup', 'true');
    dropdownParents.push(parentLi);

    var dropdown = document.createElement('ul');
    dropdown.className = 'nav-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.setAttribute('aria-label', key + ' sections');

    options.forEach(function (opt) {
      var row = document.createElement('li');
      var a = document.createElement('a');
      a.href = opt.href;
      a.textContent = opt.label;

      var url = new URL(opt.href, window.location.origin);
      var samePath = normalizePath(url.pathname) === currentPath;
      if (samePath && (!url.hash || url.hash === currentHash)) {
        a.classList.add('submenu-active');
      }

      row.appendChild(a);
      dropdown.appendChild(row);
    });

    parentLi.appendChild(dropdown);

    linkEl.addEventListener('click', function (event) {
      if (!isMobileNav()) return;
      if (parentLi.classList.contains('mobile-open')) return;

      event.preventDefault();
      openDropdown(parentLi);
    });

    dropdown.querySelectorAll('a').forEach(function (subLink) {
      subLink.addEventListener('click', function () {
        closeAllDropdowns();
      });
    });
  });

  document.addEventListener('click', function (event) {
    if (!isMobileNav()) return;
    if (!nav.contains(event.target)) closeAllDropdowns();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAllDropdowns();
  });

  function handleMobileModeChange() {
    if (!isMobileNav()) closeAllDropdowns();
  }

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleMobileModeChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(handleMobileModeChange);
  }
}

function initRevealObserver() {
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
}

initNavScroll();
initNavDropdowns();
initRevealObserver();
