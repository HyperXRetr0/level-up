
# LevelUp - Video Game E-Commerce Platform
![alt text](https://github.com/HyperXRetr0/level-up/blob/main/images/Level%20Up.png)



## About the Project
Level Up is an e-commerce platform where users can purchase video games. The web app is designed to provide a seamless and fast shopping experience by implementing efficient data retrieval mechanisms, secure payment options, and reliable user authentication.
## Features

- User Authentication: Secure sign-up, log-in, and account management using Firebase.
- Stripe Payment Integration: Secure and easy-to-use payment processing.
- Efficient Caching: Fast data retrieval to enhance user experience.
- Game Catalog: Browse and search through a comprehensive catalog of video games.
- Responsive Design: Optimized for both desktop and mobile devices.
## Tech Stack

- Frontend: React, TypeScript, Sass
- Backend: Node.js, Express.js, MongoDB
- Authentication: Firebase
- Payments: Stripe
- Caching: Node-Cache



## Installation

- Clone the repository:

```bash
git clone https://github.com/yourusername/LevelUp.git
cd LevelUp
```
- Install dependencies for both client and server:
```bash
cd client
npm install
cd ../server
npm install
```

- Set up environment variables:
    
    Create .env files in both the client and server directories
```plaintext
// Client (client/.env):
   
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SERVER=
VITE_STRIPE_KEY=
```

```plaintext
// Server (server/.env):

MONGO_URI=
PORT=
STRIPE_SECRET_KEY=
```

- Run the development servers:
    
```bash
cd client  
npm run dev
```
```bash
cd server  
npm run dev
```

    
## Usage

- Browse Games: Explore the catalog and search for your favorite games.
- Add to Cart: Add selected games to your cart for purchase.
- Checkout: Use Stripe for secure payment processing.
## Caching

- LevelUp utilizes caching to improve data retrieval speeds. This ensures that users have a smooth and responsive experience when browsing through the game catalog or accessing their account information.
## Stripe Integration
- Stripe is used for handling payments securely. It ensures that transactions are processed safely, providing users with confidence when purchasing games.
