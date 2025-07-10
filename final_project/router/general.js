const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

    // Check for missing fields
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    // Register the user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Async-Await version of fetching books
public_users.get("/", async (req, res) => {
    try {
        // Simulating async fetch using axios on local server itself
        const response = await axios.get('http://localhost:5000/books');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    res.send(books[isbn]);
 });


public_users.get("/isbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:5000/books/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found via axios", error: error.message });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const allBooks = Object.values(books);
    const matchingBooks = allBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found for the given author." });
    }
});

public_users.get("/author/:author", async (req, res) => {
    const author = req.params.author;

    try {
        const response = await axios.get(`http://localhost:5000/books/author/${author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Books not found via axios", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const allBooks = Object.values(books);
    const matchingBooks = allBooks.filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found for the given author." });
    }
});


public_users.get("/title/:title", async (req, res) => {
    const title = req.params.title;

    try {
        const response = await axios.get(`http://localhost:5000/books/title/${title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Books not found via axios", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found for the given ISBN." });
    }
});

module.exports.general = public_users;
