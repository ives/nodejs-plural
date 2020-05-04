const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('server:authRoutes');
const passport = require('passport');

const authRouter = express.Router();

function router() {
  // we set up body-parser in the root file server.js
  authRouter.route('/signUp').post((req, res) => {
    debug(req.body);
    const { username, password } = req.body;
    const url = 'mongodb://localhost:27017';
    const dbName = 'pluralLibraryApp';

    (async function addUser() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('Connedted to Mongo');

        const db = client.db(dbName);

        const col = db.collection('users');
        const user = { username, password };

        // do INSERT
        const result = await col.insertOne(user);
        // result.ops[0] - back from Mongo - what we inserted
        debug('INSERTING', result);

        // todo create user and do something with it
        // create user, then
        // log user in
        // passport.initialize() created this: req.login
        req.login(result.ops[0], () => {
          // what to do after logging in
          res.redirect('/auth/profile'); // will show the user created
        });
      } catch (err) {
        debug('Mongo error', err);
      }
    }());

    // res.json(req.body);
  });

  authRouter.route('/signin')
    .get((req, res) => {
      res.render('signin', {
        title: 'signIn',
      });
    })
    // want passport to deal with it all
    // use 'local' strategy
    // if works - onSuccess
    .post(passport.authenticate('local', {
      successRedirect: '/auth/profile',
      failureRerdirect: '/',
    }));

  authRouter.route('/profile')
  // Protecting routes:
  // all = middleware, executes every time for this route then onto next()
    .all((req, res, next) => {
      // if user is signed in:
      if (req.user) {
        next(); // do nothing
      } else {
        res.redirect('/');
      }
    })
    .get((req, res) => {
    // I'm logged in
    // passport will serialise user into a cookie
    // user will now be attached by magic to the request
      res.json(req.user);
    });

  authRouter.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });


  // don't forget this - must RETURN a MIDDLEWARE!
  return authRouter;
}

module.exports = router;
