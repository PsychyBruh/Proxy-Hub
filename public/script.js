document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  await loadProxies(); // Load proxies only once during initial load
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

// Add a new proxy
async function addProxy() {
  const name = document.getElementById('newName').value;
  const url = document.getElementById('newUrl').value;
  const logo = document.getElementById('newLogo').value; // Add logo URL input

  // Validate inputs
  if (!name || !url) {
    alert('Please provide both a name and a URL for the proxy.');
    return;
  }

  try {
    // Add proxy data including the logo to the server
    const res = await fetch('/api/proxies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, logo }) // Send logo along with other details
    });

    if (!res.ok) throw new Error('Failed to add proxy');
    
    // Clear the inputs after adding
    document.getElementById('newName').value = '';
    document.getElementById('newUrl').value = '';
    document.getElementById('newLogo').value = ''; // Clear logo input as well

    // Dynamically add the new proxy to the list without reloading the entire list
    const newProxy = { name, url, logo };
    displayProxy(newProxy);

  } catch (error) {
    console.error('Error adding proxy:', error);
    alert('Error adding proxy, please try again later.');
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
