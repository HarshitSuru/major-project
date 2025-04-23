# 🌍 Wanderlust

**Wanderlust** is a full-stack travel platform where users can discover travel destinations, leave reviews, and property owners can list their places. The application features user authentication, dynamic content management, and a clean UI using EJS templates.

---

## 🚀 Features

- 🧑‍💼 **User Authentication**  
  Users can securely register, log in, and manage their session using **Passport.js** and **Express sessions**.

- 🏕️ **List Travel Destinations**  
  Property owners can add and manage their listings with descriptions and images.

- ✍️ **Leave Reviews**  
  Registered users can post reviews for listed destinations.

- 🖥️ **Responsive UI**  
  Built with EJS templates, HTML, CSS, and JavaScript to ensure a smooth user experience.

- 🌐 **RESTful Routing**  
  Modular routing and middleware with Express.js for better maintainability.

- 🗃️ **MongoDB Integration**  
  Destination data, user profiles, and reviews are stored in a MongoDB database.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, HTML, CSS, JavaScript
- **Authentication:** Passport.js
- **Database:** MongoDB, Mongoose
- **Version Control:** Git & GitHub

---

## 📂 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HarshitSuru/wanderlust.git
   cd wanderlust

2. **Install dependencies**
   ```bash
   npm install

3. **Set up your environment variables Create a .env file and add:**
   ```bash
   CLOUD_NAME=cloud name for uploading photos(cloudinary)
    CLOUD_API_KEY=API key
    CLOUD_API_SECRET=API key secret


    MAP_TOKEN=map token for mapbox
    ATLASDB_URL=your atlas mongobd url


    SECRET=your session secret


    EMAIL_USER=your email to send reset password links
    EMAIL_PASS=password from google



