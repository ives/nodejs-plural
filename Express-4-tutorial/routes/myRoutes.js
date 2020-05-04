const express = require('express');

const myRouter = express.Router();
const { MongoClient, ObjectID } = require('mongodb');
// so only visible in debug mode:
const debug = require('debug')('server:myRoutes'); // detailed logout

// in main file:
// app.use("/books", myRouter);

// wrap in a function so we can pass config project (optional)

async function talkToDb() {
  // delay by 2 sec
  return new Promise((resolve) => setTimeout(() => {
    resolve('DATA from DB');
  }, 1000));
}

const url = 'mongodb://localhost:27017';
const dbName = 'pluralLibraryApp';

function router(confDemo) {
  // Protecting routes - another way:
  // Also with custom middleware
  myRouter.use((req, res, next) => {
    // if user is signed in:
    if (req.user) {
    // OPTION if (req.user.admin) {
    // OPTION req.user.roles INCLUDES ABC
      next(); // do nothing
    } else {
      res.redirect('/');
    }
  });

  myRouter
    .route('/') // relative after books
    .get((req, res) => {
      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('connected to Mongo - List');

          const db = client.db(dbName);

          const colln = await db.collection('books');
          const books = await colln.find().toArray();
          debug(books);
          // send back a JSON object
          // res.send(books);
          res.render('book-list', { books });
        } catch (err) {
          debug(err.stack);
        }

        client.close();
      }());
    });

  // details view by ID
  myRouter
    .route('/:id') // nested after books
    .get((req, res) => {
      // Wrap anything ASYNC:
      (async function query() {
        const result = await talkToDb('select * from books');
        debug(result);

        // passed val:
        const { id } = req.params;

        (async function mongo() {
          try {
            client = await MongoClient.connect(url);
            debug('connected to Mongo - Detail');
            const db = client.db(dbName);
            const colln = await db.collection('books');
            // findOne - Finds the first one:
            const book = await colln.findOne({ _id: ObjectID(id) });

            // send back a JSON object
            res.send(book);
          } catch (err) {
            debug(err.stack);
          }
        }());
        // res.send(`<p>Looking at a single book: ${id}</p>`);
      }());

      debug('sync code');
    });

  return myRouter;
}
module.exports = router;
