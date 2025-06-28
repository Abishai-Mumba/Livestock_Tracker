# Livestock Tracker

Brief description of what your project does, e.g.:

> A web application for real-time livestock tracking using React (client) and Node.js/Express (server).

---

## 📁 Project Structure

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js & npm](https://nodejs.org/) (v16+ recommended)

---

## 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

## Running the App
Start Backend

cd server
npm run serve

Start Frontend

cd client
npm run dev

## Environment Variables

SMTP_USER=your_email@gmail.com               # Email address used to send messages
GMAIL_APP_PASSWORD=your_gmail_app_password   # Gmail app-specific password
EMAIL_TOKEN_SECRET=your_email_token_secret   # Secret used to sign email verification tokens

DEFAULT_USER_NAME=admin                      # Default admin user name
DEFAULT_USER_EMAIL=admin@example.com         # Default admin email
DEFAULT_USER_PASSWORD=your_admin_password    # Default admin password

USER_LOGIN_SECRETE=your_login_token_secret   # Secret for signing login tokens
USER_LOGIN_TIME=10m                          # Login token expiration (e.g., 10m = 10 minutes)
EMAIL_TOKEN_TIME=1m                          # Email token expiration (e.g., 1m = 1 minute)
