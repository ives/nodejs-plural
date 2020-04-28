const express = require("express");
const { MongoClient } = require("mongodb");
const debug = require("debug")("server:authRoutes");

const authRouter = express.Router();

function router() {
  // const url = 'mongodb://localhost:27017';
  // const dbName = 'pluralLibraryApp';

  // we set up body-parser in the root file server.js
  authRouter.route("/signUp").post((req, res) => {
    debug(req.body);
    res.json(req.body);
  });

  // (async function mongo() {
  //   let client;
  //   try {
  //     client = await MongoClient.connect(url);
  //     debug('connected to Mongo');

  //     const db = client.db(dbName);

  //     const r = await db.collection('books').insertMany(booksData);

  //     // send back a JSON object
  //     res.json(r);

  //   } catch (err) {
  //     debug(err.stack);
  //   }

  //   client.close();

  // })();

  // don't forget this - must RETURN a MIDDLEWARE!
  return authRouter;
}

module.exports = router;
