const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const app = express();
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* ------------------ REGISTER ------------------ */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ LOGIN ------------------ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const mongoose = require("mongoose");

//Step 1: Update Your User Model

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    categories: { type: [String], default: [] },
    languages: { type: [String], default: [] },
  },
});

module.exports = mongoose.model("User", userSchema);

//Step 2: Create Authentication Middleware
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

//Step 3: Add Preferences Endpoints
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

/* ------------------ REGISTER ------------------ */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ LOGIN ------------------ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ GET PREFERENCES ------------------ */
app.get("/preferences", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("preferences");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ UPDATE PREFERENCES ------------------ */
app.put("/preferences", auth, async (req, res) => {
  try {
    const { categories, languages } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences: { categories, languages } },
      { new: true }
    ).select("preferences");

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

//Add a GET /news Endpoint

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");
const User = require("./models/User");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

/* ------------------ REGISTER ------------------ */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ LOGIN ------------------ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ GET PREFERENCES ------------------ */
app.get("/preferences", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("preferences");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ UPDATE PREFERENCES ------------------ */
app.put("/preferences", auth, async (req, res) => {
  try {
    const { categories, languages } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences: { categories, languages } },
      { new: true }
    ).select("preferences");

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ GET NEWS (External API Integration) ------------------ */
app.get("/news", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { categories, languages } = user.preferences;

    if (!categories.length && !languages.length)
      return res.status(400).json({
        message:
          "No preferences found. Please set categories or languages first.",
      });

    // Build query parameters for NewsAPI
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey)
      return res
        .status(500)
        .json({ message: "Missing NEWS_API_KEY in environment." });

    const params = {
      apiKey,
      pageSize: 10,
      language: languages[0] || "en",
      category: categories[0] || "general",
    };

    // Make API Request
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params,
    });

    if (!response.data.articles)
      return res.status(502).json({ message: "Failed to fetch news articles" });

    res.json({
      source: "NewsAPI.org",
      preferences: { categories, languages },
      articles: response.data.articles,
    });
  } catch (err) {
    console.error("Error fetching news:", err.message);
    if (err.response) {
      res.status(err.response.status).json({
        message: err.response.data.message || "External API error",
      });
    } else {
      res.status(500).json({ message: "Server error fetching news" });
    }
  }
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

//Create a validation.js Utility
const Joi = require("joi");

// User Registration Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  return schema.validate(data);
};

// User Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
  });
  return schema.validate(data);
};

// Preferences Validation
const preferencesValidation = (data) => {
  const schema = Joi.object({
    categories: Joi.array().items(Joi.string()).default([]),
    languages: Joi.array().items(Joi.string().length(2)).default([]),
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  preferencesValidation,
};

//Add Centralized Error Handling Middleware
module.exports = function (err, req, res, next) {
  console.error("🔥 Error:", err.message);

  if (err.isJoi) {
    return res.status(400).json({ message: err.details[0].message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

//Update server.js for Validation and Error Handling
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");
const User = require("./models/User");
const auth = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const {
  registerValidation,
  loginValidation,
  preferencesValidation,
} = require("./validation/validation");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

/* ------------------ REGISTER ------------------ */
app.post("/register", async (req, res, next) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) throw error;

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
});

/* ------------------ LOGIN ------------------ */
app.post("/login", async (req, res, next) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) throw error;

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
});

/* ------------------ GET PREFERENCES ------------------ */
app.get("/preferences", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("preferences");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ preferences: user.preferences });
  } catch (err) {
    next(err);
  }
});

/* ------------------ UPDATE PREFERENCES ------------------ */
app.put("/preferences", auth, async (req, res, next) => {
  try {
    const { error } = preferencesValidation(req.body);
    if (error) throw error;

    const { categories, languages } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences: { categories, languages } },
      { new: true }
    ).select("preferences");

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------ GET NEWS (External API Integration) ------------------ */
app.get("/news", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { categories, languages } = user.preferences;

    if (!categories.length && !languages.length)
      return res.status(400).json({
        message: "Please set preferences before fetching news.",
      });

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey)
      return res.status(500).json({
        message: "Missing NEWS_API_KEY in environment variables",
      });

    const params = {
      apiKey,
      pageSize: 10,
      language: languages[0] || "en",
      category: categories[0] || "general",
    };

    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params,
    });

    if (!response.data.articles)
      return res.status(502).json({ message: "Failed to fetch news articles" });

    res.json({
      source: "NewsAPI.org",
      preferences: { categories, languages },
      articles: response.data.articles,
    });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        message: err.response.data.message || "External API error",
      });
    }
    next(err);
  }
});

// Centralized Error Handler
app.use(errorHandler);

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

//Setup In-Memory Cache
const NodeCache = require("node-cache");

// Cache TTL = 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = cache;

//Extend User Model to Track Read/Favorite Articles
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  articleId: String, // unique identifier from NewsAPI
  title: String,
  url: String,
  source: String,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    categories: { type: [String], default: [] },
    languages: { type: [String], default: [] },
  },
  readArticles: [articleSchema],
  favoriteArticles: [articleSchema],
});

module.exports = mongoose.model("User", userSchema);

//Update /news Endpoint with Caching Logic
const cache = require("./utils/cache");

/* ------------------ GET NEWS (with caching) ------------------ */
app.get("/news", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { categories, languages } = user.preferences;
    if (!categories.length && !languages.length)
      return res.status(400).json({
        message: "Please set preferences before fetching news.",
      });

    const cacheKey = `${categories.join(",")}-${languages.join(",")}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      console.log("✅ Returning cached news");
      return res.json({ source: "cache", articles: cachedData });
    }

    console.log("📰 Fetching news from external API...");
    const apiKey = process.env.NEWS_API_KEY;
    const params = {
      apiKey,
      pageSize: 10,
      language: languages[0] || "en",
      category: categories[0] || "general",
    };

    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params,
    });

    const articles = response.data.articles || [];
    cache.set(cacheKey, articles);

    res.json({ source: "NewsAPI.org", articles });
  } catch (err) {
    next(err);
  }
});

//Mark Articles as Read/Favorite

app.post("/news/:id/read", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url, source } = req.body;

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { readArticles: { articleId: id, title, url, source } },
    });

    res.json({ message: "Article marked as read" });
  } catch (err) {
    next(err);
  }
});

app.post("/news/:id/favorite", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url, source } = req.body;

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { favoriteArticles: { articleId: id, title, url, source } },
    });

    res.json({ message: "Article marked as favorite" });
  } catch (err) {
    next(err);
  }
});

//Retrieve Read/Favorite Articles
app.get("/news/read", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("readArticles");
    res.json({ readArticles: user.readArticles });
  } catch (err) {
    next(err);
  }
});

app.get("/news/favorites", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("favoriteArticles");
    res.json({ favoriteArticles: user.favoriteArticles });
  } catch (err) {
    next(err);
  }
});

//Search News by Keyword

app.get("/news/search/:keyword", auth, async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const cacheKey = `search-${keyword.toLowerCase()}`;
    const cachedResults = cache.get(cacheKey);

    if (cachedResults) {
      console.log("✅ Returning cached search results");
      return res.json({ source: "cache", articles: cachedResults });
    }

    const apiKey = process.env.NEWS_API_KEY;
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: { apiKey, q: keyword, pageSize: 10, language: "en" },
    });

    const articles = response.data.articles || [];
    cache.set(cacheKey, articles);

    res.json({ source: "NewsAPI.org", articles });
  } catch (err) {
    next(err);
  }
});

//Periodic Cache Updates (Simulated Real-Time Feed)
setInterval(async () => {
  console.log("♻️ Updating cached news articles...");
  const keys = cache.keys();

  for (const key of keys) {
    if (!key.includes("search-")) {
      try {
        const [categories, languages] = key.split("-");
        const apiKey = process.env.NEWS_API_KEY;
        const params = {
          apiKey,
          pageSize: 10,
          language: languages?.split(",")[0] || "en",
          category: categories?.split(",")[0] || "general",
        };

        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
          params,
        });

        cache.set(key, response.data.articles || []);
        console.log(`🔄 Refreshed cache for ${key}`);
      } catch (err) {
        console.error(`❌ Failed to refresh cache for ${key}:`, err.message);
      }
    }
  }
}, 5 * 60 * 1000); // every 5 minutes




