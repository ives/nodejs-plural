const express = require("express");
const { MongoClient } = require("mongodb");
const debug = require('debug')('server:adminRoutes');

const booksData = [
  {
    title: 'War and Peace',
    read: true
  },
  {
    title: 'The Time Machine',
    read: false
  }
];

const adminRouter = express.Router();

function router() {
  adminRouter.route("/").get((req, res) => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'pluralLibraryApp';

    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('connected to Mongo');

        const db = client.db(dbName);

        const r = await db.collection('books').insertMany(booksData);
        
        // send back a JSON object
        res.json(r);

      } catch (err) {
        debug(err.stack);
      }

      client.close();

    })();

    //res.send("Inserting books");
  });

  // don't forget this - must RETURN a MIDDLEWARE!
  return adminRouter;
}

module.exports = router;
