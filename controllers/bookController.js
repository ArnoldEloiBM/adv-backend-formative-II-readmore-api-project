
const Book = require('../models/Book');
const Author = require('../models/Author');


// Create a new book
const createBook = async (req, res) => {
  try {
    // Check whether the author ID was provided
    if (!req.body.author) {
      return res.status(400).json({
        status: 'error',
        message: 'Author ID is required'
      });
    }

    // Check whether the author exists
    const author = await Author.findById(req.body.author);

    if (!author) {
      return res.status(400).json({
        status: 'error',
        message: 'The specified author does not exist'
      });
    }

    // Create the book
    const book = await Book.create(req.body);

    await book.populate('author');

    res.status(201).json({
      status: 'success',
      data: book
    });
  
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'This author already has a book with this title'
      });
    }

    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

};


// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('author');

    res.status(200).json({
      status: 'success',
      results: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get one book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: book
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('author');

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: book
    });
  
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'This author already has a book with this title'
      });
    }

    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all books belonging to an author
const getBooksByAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        status: 'error',
        message: 'Author not found'
      });
    }

    const books = await Book.find({
      author: req.params.id
    }).populate('author');

    res.status(200).json({
      status: 'success',
      author: author.name,
      results: books.length,
      data: books
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByAuthor
};
