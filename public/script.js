document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  const res = await fetch('/api/proxies');
  const proxies = await res.json();
  const grid = document.getElementById('proxyList');

  proxies.forEach(({ name, url, logo }) => {
    const card = document.createElement('div');
    card.className = 'card';

    // Create and append the logo (if available)
    if (logo) {
      const logoImg = document.createElement('img');
      logoImg.src = logo;
      logoImg.alt = `${name} logo`;
      logoImg.className = 'card-logo';
      card.appendChild(logoImg);
    }

    // Add the proxy name and URL
    const nameElement = document.createElement('div');
    nameElement.className = 'card-name';
    nameElement.textContent = name;
    card.appendChild(nameElement);

    // Add an event listener for clicking on the proxy
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

  // Save to localStorage for recent proxies
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

// Function to add proxy (for admin panel or other parts)
async function addProxy() {
  const name = document.getElementById('newName').value;
  const url = document.getElementById('newUrl').value;
  const logo = document.getElementById('newLogo').value; // Add logo URL input

  // Add proxy data including the logo to the server
  await fetch('/api/proxies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url, logo }) // Send logo along with other details
  });

  // Clear the inputs after adding
  document.getElementById('newName').value = '';
  document.getElementById('newUrl').value = '';
  document.getElementById('newLogo').value = ''; // Clear logo input as well

  // Reload proxies to reflect the newly added proxy
  loadProxies();
}

// Function to load proxies after adding/removing
async function loadProxies() {
  const res = await fetch('/api/proxies');
  const proxies = await res.json();
  const grid = document.getElementById('proxyList');
  grid.innerHTML = ''; // Clear the grid first

  proxies.forEach(({ name, url, logo }) => {
    const card = document.createElement('div');
    card.className = 'card';

    if (logo) {
      const logoImg = document.createElement('img');
      logoImg.src = logo;
      logoImg.alt = `${name} logo`;
      logoImg.className = 'card-logo';
      card.appendChild(logoImg);
    }

    const nameElement = document.createElement('div');
    nameElement.className = 'card-name';
    nameElement.textContent = name;
    card.appendChild(nameElement);

    card.onclick = () => launchProxy(name, url);
    grid.appendChild(card);
  });
}
