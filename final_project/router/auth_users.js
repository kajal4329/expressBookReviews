const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Utility: Check if username is valid (not already taken)
const isValid = (username) => {
  return !users.find(user => user.username === username);
};

// Utility: Check if user credentials match
const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// Middleware: Verify JWT and attach user to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: "No token provided." });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  jwt.verify(token, "access", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    req.user = user;
    next();
  });
};

// Route: Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign({ username: user.username }, "access", { expiresIn: '1h' });

  return res.status(200).json({ message: "Login successful", token });
});

// Route: Add or modify book review (Protected)
regd_users.put("/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }

  if (!book.reviews) {
    book.reviews = {};
  } 

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found for the given ISBN." });
    }
  
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "No review found by this user for this book." });
    }
  
    // Delete the user's review
    delete book.reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
