document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    const res = await fetch('/api/proxies');
    const proxies = await res.json();
    const grid = document.getElementById('proxyList');
  
    proxies.forEach(({ name, url }) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = name;
      card.onclick = () => launchProxy(name, url);
      grid.appendChild(card);
    });
  });
  
  function launchProxy(name, url) {
    const cloak = confirm(`Open ${name} in about:blank cloaking mode?`);
    if (cloak) {
      const win = window.open("about:blank", "_blank");
      win.document.write(`
        <title>${name}</title>
        <style>html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }</style>
        <iframe src="${url}" frameborder="0" style="width: 100vw; height: 100vh; border: none;"></iframe>
      `);
    } else {
      window.open(url, '_blank');
    }
  
    // Save to localStorage
    let recent = JSON.parse(localStorage.getItem('recentProxies')) || [];
    if (!recent.includes(name)) {
      recent.push(name);
      localStorage.setItem('recentProxies', JSON.stringify(recent));
    }
  }
  
  function toggleTheme() {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  }
  
  function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.body.classList.add('light');
    }
  }
  