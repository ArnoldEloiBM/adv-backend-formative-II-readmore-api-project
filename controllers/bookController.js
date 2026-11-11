// controllers/bookController.js
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');

const sendBookError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'This author already has a book with this title'
    });
  }

  const failedPaths = error.name === 'ValidationError' ? Object.keys(error.errors) : [];
  const breaksBusinessRule = failedPaths.some((path) =>
    path === 'price' || path === 'publishedYear'
  );

  return res.status(breaksBusinessRule ? 422 : 400).json({
    status: 'error',
    message: error.message
  });
};


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
    sendBookError(res, error);
  }
};

// Get all books with dynamic search, filtering and sorting
const getAllBooks = async (req, res) => {
  try {
    const filter = {};

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Search by book title or genre
    if (req.query.search) {
      const searchTerm = req.query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { genre: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Filter by genre
    if (req.query.genre) {
      filter.genre = {
        $regex: req.query.genre,
        $options: 'i'
      };
    }

    // Filter by minimum price
    if (req.query.minPrice !== undefined) {
      filter.price = {
        ...filter.price,
        $gte: Number(req.query.minPrice)
      };
    }

    // Filter by maximum price
    if (req.query.maxPrice !== undefined) {
      filter.price = {
        ...filter.price,
        $lte: Number(req.query.maxPrice)
      };
    }

    // Filter by author id
    if (req.query.author !== undefined) {
      if (!mongoose.isValidObjectId(req.query.author)) {
        return res.status(400).json({
          status: 'error',
          message: 'author must be a valid id'
        });
      }

      filter.author = req.query.author;
    }

    // Filter by publication year
    if (req.query.publishedYear !== undefined) {
      filter.publishedYear = Number(req.query.publishedYear);
    }

    // Validate numeric filters
    const numericFilters = ['minPrice', 'maxPrice', 'publishedYear'];

    for (const field of numericFilters) {
      if (
        req.query[field] !== undefined &&
        (req.query[field].trim() === '' ||
          !Number.isFinite(Number(req.query[field])))
      ) {
        return res.status(400).json({
          status: 'error',
          message: `${field} must be a valid number`
        });
      }
    }

    // Check that minimum price is not greater than maximum price
    if (
      req.query.minPrice !== undefined &&
      req.query.maxPrice !== undefined &&
      Number(req.query.minPrice) > Number(req.query.maxPrice)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum price cannot exceed maximum price'
      });
    }

    // Sorting
    const allowedSortFields = ['title', 'price', 'publishedYear'];
    const sortField = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : 'title';

    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    const total = await Book.countDocuments(filter);

    const books = await Book.find(filter)
      .populate('author')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      page,
      limit,
      total,
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
    if (req.body.author !== undefined) {
      if (!req.body.author) {
        return res.status(400).json({
          status: 'error',
          message: 'Author ID is required'
        });
      }

      const author = await Author.findById(req.body.author);

      if (!author) {
        return res.status(400).json({
          status: 'error',
          message: 'The specified author does not exist'
        });
      }
    }

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
    sendBookError(res, error);
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
