(function () {
  function normalize(pathname) {
    return pathname.replace(/\/+$/, '') || '/';
  }

  function setActive(pathname) {
    var current = normalize(pathname);
    var activeKey = keyForPath(current);
    document.body.dataset.currentPath = current;
    document.querySelectorAll('[data-nav-link].active').forEach(function (link) {
      link.classList.remove('active');
    });
    var activeLink = activeKey ? document.querySelector('[data-nav-link][data-nav-key="' + cssEscape(activeKey) + '"]') : null;
    if (activeLink) activeLink.classList.add('active');
    document.body.classList.remove('sidebar-open');
  }

  function keyForPath(pathname) {
    var current = normalize(pathname);
    if (current === '/citizen/new' || /^\/citizen\/[^/]+(?:\/edit)?$/.test(current)) return 'directory';
    if (/^\/qr-pass\/[^/]+$/.test(current)) return 'qr-passes';
    var match = document.querySelector('[data-nav-link][href="' + cssEscape(current) + '"]');
    return match ? match.dataset.navKey : '';
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function replaceDocument(html, url) {
    var next = new DOMParser().parseFromString(html, 'text/html');
    var nextShell = next.querySelector('.content-shell');
    var currentShell = document.querySelector('.content-shell');
    var nextSidebar = next.querySelector('.sidebar');
    var currentSidebar = document.querySelector('.sidebar');
    if (!nextShell || !currentShell) {
      window.location.href = url;
      return;
    }
    currentShell.innerHTML = nextShell.innerHTML;
    if (nextSidebar && currentSidebar) currentSidebar.innerHTML = nextSidebar.innerHTML;
    document.title = next.title || document.title;
    setActive(new URL(url, window.location.origin).pathname);
    window.scrollTo(0, 0);
  }

  async function visit(url, push) {
    var response = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
    if (response.redirected || !response.ok) {
      window.location.href = response.url || url;
      return;
    }
    var html = await response.text();
    if (push) history.pushState({}, '', url);
    replaceDocument(html, url);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === '/logout' || url.searchParams.has('export') || link.target || link.hasAttribute('download')) return;
    event.preventDefault();
    visit(url.href, true).catch(function () { window.location.href = url.href; });
  });

  window.addEventListener('popstate', function () {
    visit(window.location.href, false).catch(function () { window.location.reload(); });
  });

  setActive(window.location.pathname);
}());
