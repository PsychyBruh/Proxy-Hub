document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  await loadProxies(); // Load proxies only once during initial load
  await loadSuggestedProxies(); // Load suggested proxies for the admin
});

// Fetch and display proxies in the grid
async function loadProxies() {
  try {
    const res = await fetch('/api/proxies');
    if (!res.ok) throw new Error('Failed to fetch proxies');
    
    const proxies = await res.json();
    const grid = document.getElementById('proxyList');
    grid.innerHTML = ''; // Clear the grid first

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

      // Add the proxy name
      const nameElement = document.createElement('div');
      nameElement.className = 'card-name';
      nameElement.textContent = name;
      card.appendChild(nameElement);

      // Add an event listener for clicking on the proxy
      card.onclick = () => launchProxy(name, url);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading proxies:', error);
    alert('Error loading proxies, please try again later.');
  }
}

// Load suggested proxies (for admin)
async function loadSuggestedProxies() {
  try {
    const res = await fetch('/api/suggested-proxies');
    if (!res.ok) throw new Error('Failed to fetch suggested proxies');

    const proxies = await res.json();
    const list = document.getElementById('suggestedProxiesList');
    list.innerHTML = ''; // Clear the list first

    proxies.forEach(({ name, url, logo }) => {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(` ${name} - ${url} `));

      // Add logo if available
      if (logo) {
        const logoImg = document.createElement('img');
        logoImg.src = logo;
        logoImg.alt = `${name} logo`;
        logoImg.classList.add('proxy-logo');
        li.appendChild(logoImg);
      }

      // Add approve and deny buttons
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.onclick = () => approveProxy(name, url, logo);
      li.appendChild(approveBtn);

      const denyBtn = document.createElement('button');
      denyBtn.textContent = 'Deny';
      denyBtn.onclick = () => denyProxy(name);
      li.appendChild(denyBtn);

      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading suggested proxies:', error);
    alert('Error loading suggested proxies, please try again later.');
  }
}

// Approve a suggested proxy (admin action)
async function approveProxy(name, url, logo) {
  try {
    const res = await fetch('/api/approve-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, url, logo })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Failed to approve proxy');

    // Reload suggested proxies after approval
    await loadSuggestedProxies();

    // Optionally, add to the grid on the frontend
    displayProxy({ name, url, logo });

  } catch (error) {
    console.error('Error approving proxy:', error);
    alert('Error approving proxy, please try again later.');
  }
}

// Deny a suggested proxy (admin action)
async function denyProxy(name) {
  try {
    const res = await fetch('/api/deny-proxy', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Failed to deny proxy');

    // Reload suggested proxies after denial
    await loadSuggestedProxies();

  } catch (error) {
    console.error('Error denying proxy:', error);
    alert('Error denying proxy, please try again later.');
  }
}

// Display a single proxy card (used when a new proxy is added)
function displayProxy(proxy) {
  const { name, url, logo } = proxy;
  const grid = document.getElementById('proxyList');
  
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

  // Add the proxy name
  const nameElement = document.createElement('div');
  nameElement.className = 'card-name';
  nameElement.textContent = name;
  card.appendChild(nameElement);

  // Add an event listener for clicking on the proxy
  card.onclick = () => launchProxy(name, url);
  grid.appendChild(card);
}

// Open proxy in a new window or cloaked mode
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

// Toggle light/dark theme and save to localStorage
function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

// Load theme based on localStorage
function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.body.classList.add('light');
  }
}
