
# Proxy Hub

Proxy Hub is a web application that allows you to manage and access multiple proxies easily. The admin panel provides functionality to add and remove proxy backends. The proxies can be accessed from a public hub page.

## Features

- **Admin Panel**: 
  - Add and remove proxy backends.
  - Manage proxy settings (name, target URL, and prefix).
  - Password protected admin access.
  
- **Public Hub Page**:
  - List all available proxies with their logos.
  - Access proxies with a simple click.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PsychyBruh/proxy-hub.git
   cd proxy-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file at the root of the project and add your admin password:
   ```env
   ADMIN_PASS=yourPasswordHere
   ```

4. Run the application:
   ```bash
   npm start
   ```

5. Access the application:
   - **Public Hub**: `http://localhost:8080`
   - **Admin Panel**: `http://localhost:8080/admin/login` (password required)

## Folder Structure

```
.
├── public/                  # Static files (e.g., logos)
├── views/                   # EJS templates
├── .env                     # Environment variables (password)
├── .gitignore               # Git ignore file
├── backend.json             # Stores proxy backend configuration
├── server.js                # Main application logic
├── package.json             # Project metadata and dependencies
├── README.md                # Project documentation
```

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

Distributed under the MIT License. See LICENSE for more information.
