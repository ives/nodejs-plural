/*
  "controllers" — functions that separate out the code to
  route requests from the code that actually processes requests.
 */
const { MongoClient, ObjectID } = require('mongodb');
// so only visible in debug mode:
const debug = require('debug')('server:bookController');

const url = 'mongodb://localhost:27017';
const dbName = 'pluralLibraryApp';

function bookController(bookService) {
  function getIndex(req, res) {
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
  }
  function getById(req, res) {
    // Wrap anything ASYNC:
    (async function query() {
      // const result = await talkToDb('select * from books');
      // debug(result);

      // passed val:
      const { id } = req.params;
      let client;
      (async function mongo() {
        try {
          client = await MongoClient.connect(url);
          debug('connected to Mongo - Detail');
          const db = client.db(dbName);
          const colln = await db.collection('books');
          // findOne - Finds the first one:
          const book = await colln.findOne({ _id: ObjectID(id) });

          // Hydrate from Goodreads API:
          book.details = await bookService.getBookById('100');

          // send back a JSON object
          res.send(book);
        } catch (err) {
          debug(err.stack);
        }
      }());
      // res.send(`<p>Looking at a single book: ${id}</p>`);
    }());

    debug('sync code');
  }

  function protectRoutesMW(req, res, next) {
    // if user is signed in:
    if (req.user) {
    // OPTION if (req.user.admin) {
    // OPTION req.user.roles INCLUDES ABC
      next(); // do nothing
    } else {
      res.redirect('/');
    }
  }

  async function talkToDb() {
    // delay by 2 sec
    return new Promise((resolve) => setTimeout(() => {
      resolve('DATA from DB');
    }, 1000));
  }


  // The Revealing module pattern:
  return {
    getIndex,
    getById,
    protectRoutesMW,
  };
}

// Note we will execute elsewhere when require
module.exports = bookController;
