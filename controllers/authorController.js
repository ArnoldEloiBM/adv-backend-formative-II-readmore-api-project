
const Author = require('../models/Author');
const Book = require('../models/Book');

// Create a new author
const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);

    res.status(201).json({
      status: 'success',
      data: author
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();

    res.status(200).json({
      status: 'success',
      results: authors.length,
      data: authors
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get one author by ID
const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        status: 'error',
        message: 'Author not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: author
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update an author
const updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!author) {
      return res.status(404).json({
        status: 'error',
        message: 'Author not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: author
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};


// Delete an author
const deleteAuthor = async (req, res) => {
  try {
    // Check whether the author exists
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        status: 'error',
        message: 'Author not found'
      });
    }

    // Check whether the author has any books
    const books = await Book.exists({
      author: req.params.id
    });

    if (books) {
      return res.status(409).json({
        status: 'error',
        message: 'Cannot delete author because they still have books'
      });
    }

    // Delete the author if no books are associated
    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Author deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor
};
