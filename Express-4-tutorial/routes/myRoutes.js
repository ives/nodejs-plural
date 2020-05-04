const express = require('express');
const bookController = require('../controllers/bookController');

// Will pass this to bookController():
const bookService = require('../services/goodreadsService');

const myRouter = express.Router();

// in main file:
// app.use("/books", myRouter);

// wrap in a function so we can pass config project (optional)

function router() {
  const { getIndex, getById, protectRoutesMW } = bookController(bookService);

  // Protecting routes - another way:
  // Also with custom middleware
  myRouter.use(protectRoutesMW);

  myRouter
    .route('/') // relative after books
    .get(getIndex);

  // details view by ID
  myRouter
    .route('/:id') // nested after books
    .get(getById);

  return myRouter;
}
module.exports = router;
