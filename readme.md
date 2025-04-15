# 🌐 **Proxy Hub**

**Proxy Hub** is a sleek, customizable dashboard for launching and managing web proxies from a single interface. With **theme toggling**, **cloaking support**, and an **optional admin panel**, it's designed for ease of use and future expansion.

---

## 🚀 **Features**

- 🌗 **Light/Dark mode toggle**  
- 🧩 **Organized proxy cards** with custom logos  
- 🪄 **`about:blank` cloaking mode** for stealthy browsing  
- 💾 **Recently used proxies** saved using `localStorage`  
- 🔐 **Optional admin panel** with usage stats  
- 📤 **Proxy suggestion form** *(coming soon)*  
- ⚙️ **Fully customizable frontend** — no backend required

---

## 📁 **Project Structure**

```
proxy-hub/ 
├── data # Directory for JSON's 
    ├── proxies.json # Stores the Proxies that are added
    ├── status.json  # Stores the current proxy status
    ├── suggestedProxies.json # Stores the proxies that were suggested (Planned)
├── public # Main Directory for HTML's and JS for HTML's
    ├── index.html # Main proxy dashboard 
    ├── styles.css # All theming and layout styles 
    ├── script.js # Logic for loading and launching proxies 
    ├── suggestion.html # (Planned) Form to suggest new proxies 
    ├── admin.html # Admin interface (optional) 
├── .gitignore
├── Dockerfile
├── package-lock.json
├── package.json
├── server.js
└── README.md # This file
```
---

## 🛠️ **Getting Started**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/PsychyBruh/proxy-hub.git
cd proxy-hub
npm start

OR 

docker build -t proxyhub .

docker run -d proxyhub
```

 ### 2️⃣ Adding Proxies
Manually edit the proxy array in proxies.json:

```
[
    {
      "name": "Emerald",
      "url": "https://emeraldproxy.vercel.app"
    },
    {
      "name": "Purplocity",
      "url": "https://purplocity.vercel.app"
    },
    {
      "name": "Void",
      "url": "https://voidproxy.vercel.app"
    }
  ]
  ```
--- 
  ### 🌐 Hosting Options
You can host Proxy Hub anywhere that supports static files:

**GitHub Pages**

**Vercel**

**Netlify**

**Cloudflare Pages**

**Northflank**

**Your own web server**

---

## 🧪 Planned Features

**✅ Light/Dark mode**

**✅ Cloaked proxy launching**

**✅ Recent proxy memory**

**✅ Admin panel**

**🛠️ Proxy suggestion form**

**🛠️ Approve/reject system for admins**

**🛠️ Usage analytics (launch count, optional IP logging)**

---

# 🙌 Credits
## Built with 💚 by Psychy
## Thanks to the open-source proxy community for inspiration.


# 📜 License

## MIT License
```
Copyright (c) 2025 Psychy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```






