// routes/authorRoutes.js
const express = require('express');
const router = express.Router();

const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  getAuthorStatistics,
  updateAuthor,
  deleteAuthor
} = require('../controllers/authorController');

const {
  getBooksByAuthor
} = require('../controllers/bookController');

router.post('/', createAuthor);
router.get('/', getAllAuthors);
router.get('/:id', getAuthorById);
router.get('/:id/books', getBooksByAuthor);
router.get('/:id/stats', getAuthorStatistics);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);

module.exports = router;
