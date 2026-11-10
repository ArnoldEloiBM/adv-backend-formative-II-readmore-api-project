
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  publishedYear: {
    type: Number,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  }
});

// Prevent duplicate book titles for the same author
bookSchema.index(
  { title: 1, author: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
