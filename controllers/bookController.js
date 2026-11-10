
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

// Get all books with dynamic search, filtering and sorting
const getAllBooks = async (req, res) => {
  try {
    const filter = {};

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

    const books = await Book.find(filter)
      .populate('author')
      .sort({ [sortField]: sortOrder });

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
