[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21480804&assignment_repo_type=AssignmentRepo)
📰 News Aggregator API

A full-featured Node.js + Express REST API that allows users to:

Register and authenticate with JWT

Set news preferences (categories & languages)

Fetch personalized news from an external API (NewsAPI.org)

Cache news articles to reduce API load

Mark articles as read or favorite

Search for news articles by keyword

Automatically refresh cached data periodically

🧩 Tech Stack
Technology	Purpose
Node.js + Express	REST API framework
MongoDB + Mongoose	User data & preferences storage
bcrypt	Password hashing
jsonwebtoken (JWT)	Authentication
axios	External News API requests
node-cache	In-memory caching
Joi	Input validation
dotenv	Environment configuration
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/yourusername/news-aggregator-api.git
cd news-aggregator-api

2️⃣ Install Dependencies
npm install

3️⃣ Create a .env File
PORT=5000
MONGO_URI=mongodb://localhost:27017/newsdb
JWT_SECRET=your_secret_key
NEWS_API_KEY=your_newsapi_key_here


Get your News API key from https://newsapi.org

4️⃣ Start the Server
npm start


Server runs on:
👉 http://localhost:5000

🔐 Authentication

All protected routes require a JWT token in the Authorization header:

Authorization: Bearer <your_token>


Tokens are issued after a successful login and expire after 1 hour.

🧠 API Endpoints Documentation
Auth & User Management
POST /register

Register a new user.

Body:

{
  "username": "john",
  "email": "john@example.com",
  "password": "mypassword"
}


Responses:

✅ 201: User registered successfully

❌ 400: Validation error or user already exists

POST /login

Authenticate user and get a JWT token.

Body:

{
  "email": "john@example.com",
  "password": "mypassword"
}


Response:

{
  "message": "Login successful",
  "token": "eyJhbGciOi..."
}

User Preferences
GET /preferences

Retrieve logged-in user’s news preferences.

Response:

{
  "preferences": {
    "categories": ["technology"],
    "languages": ["en"]
  }
}

PUT /preferences

Update user preferences.

Body:

{
  "categories": ["business", "sports"],
  "languages": ["en"]
}

News Fetching
GET /news

Fetch personalized news based on stored preferences.

Headers:

Authorization: Bearer <token>


Response:

{
  "source": "NewsAPI.org",
  "articles": [
    {
      "title": "Tech innovation 2025",
      "url": "https://example.com/article",
      "source": { "name": "TechCrunch" }
    }
  ]
}


⚡ Cached for 10 minutes to minimize external API calls.

Search
GET /news/search/:keyword

Search for news articles by keyword (cached).

Example:

GET /news/search/bitcoin


Response:

{
  "source": "NewsAPI.org",
  "articles": [ ... ]
}

Read & Favorite Articles
POST /news/:id/read

Mark an article as read.

Body:

{
  "title": "AI revolutionizes finance",
  "url": "https://example.com/article",
  "source": "TechCrunch"
}

POST /news/:id/favorite

Mark an article as favorite.

GET /news/read

Retrieve all read articles.

GET /news/favorites

Retrieve all favorite articles.

🕒 Periodic Cache Updates

Cached news articles are automatically refreshed every 5 minutes.

This simulates a real-time feed without hitting the external API frequently.

🧪 Example curl Commands
Register
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"mypassword"}'

Login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"mypassword"}'

Fetch News
curl -X GET http://localhost:5000/news \
  -H "Authorization: Bearer <your_token>"

⚠️ Error Handling
Error	Description
400 Bad Request	Input validation failed
401 Unauthorized	Missing or invalid JWT
404 Not Found	Resource doesn’t exist
500 Internal Server Error	Unexpected server error
502 Bad Gateway	External News API failure

All errors return consistent JSON:

{ "message": "Error description" }

🧩 Folder Structure
news-aggregator-api/
│
├── models/
│   └── User.js
│
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
│
├── utils/
│   └── cache.js
│
├── validation/
│   └── validation.js
│
├── server.js
└── README.md

🚀 Future Enhancements

🔁 Migrate caching to Redis for distributed environments

🌐 Support for multiple external APIs (e.g., GNews, NYTimes)

🧍 User notifications when new relevant articles appear

💾 Pagination and infinite scroll support

📱 Frontend dashboard with React or Next.js

🧑‍💻 Author

Tishon Chattopadhyay
NetSuite & Backend Developer
📧 YourEmail@example.com
