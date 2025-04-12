document.addEventListener('DOMContentLoaded', async () => {
  loadTheme();
  await loadProxies(); // Load proxies only once during initial load
  await loadSuggestedProxies(); // Load suggested proxies
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

// Fetch and display suggested proxies
async function loadSuggestedProxies() {
  try {
    const res = await fetch('/api/suggested-proxies');
    if (!res.ok) throw new Error('Failed to fetch suggested proxies');
    
    const suggestedProxies = await res.json();
    const suggestedList = document.getElementById('suggestedProxiesList');
    suggestedList.innerHTML = ''; // Clear the list first

    suggestedProxies.forEach(({ name, url, logo }) => {
      const card = document.createElement('div');
      card.className = 'suggested-card';

      // Create and append the logo (if available)
      if (logo) {
        const logoImg = document.createElement('img');
        logoImg.src = logo;
        logoImg.alt = `${name} logo`;
        logoImg.className = 'suggested-card-logo';
        card.appendChild(logoImg);
      }

      // Add the proxy name
      const nameElement = document.createElement('div');
      nameElement.className = 'suggested-card-name';
      nameElement.textContent = name;
      card.appendChild(nameElement);

      // Add the proxy URL
      const urlElement = document.createElement('p');
      urlElement.textContent = url;
      card.appendChild(urlElement);

      // Append the card to the list
      suggestedList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading suggested proxies:', error);
    alert('Error loading suggested proxies, please try again later.');
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

// Add a new proxy suggestion
async function submitSuggestion() {
  const name = document.getElementById('suggestionName').value;
  const url = document.getElementById('suggestionUrl').value;
  const logoFile = document.getElementById('suggestionLogo').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('url', url);
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  try {
    const res = await fetch('/api/suggested-proxies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Ensure JWT is included
      },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert('Proxy suggestion submitted!');
      await loadSuggestedProxies(); // Reload the list of suggested proxies
    } else {
      alert('Failed to submit proxy suggestion');
    }
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    alert('Error submitting suggestion, please try again later.');
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
