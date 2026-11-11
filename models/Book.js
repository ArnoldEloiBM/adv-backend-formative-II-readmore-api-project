// models/Author.js
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
    required: true,
    min: [0.01, 'Price must be greater than zero']
  },
  publishedYear: {
    type: Number,
    required: true,
    min: [1450, 'Publication year must be 1450 or later'],
    max: [new Date().getFullYear(), 'Publication year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: 'Publication year must be a whole number'
    },

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
