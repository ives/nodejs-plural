const passport = require('passport');
// const Strategy = require("passport-local").Strategy; - Old syntax
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');

const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
  passport.use(
    new Strategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      (username, password, done) => {
        const url = 'mongodb://localhost:27017';
        const dbName = 'pluralLibraryApp';

        (async function addUser() {
          let client;
          try {
            client = await MongoClient.connect(url);
            debug('Connedted to Mongo');

            const db = client.db(dbName);
            const col = db.collection('users');
            // Find user with those credentials to sign in
            const user = await col.findOne({ username });

            if (user.password === password) {
              done(null, user);
            } else {
              done(null, false);
            }
          } catch (err) {
            debug('Mongo error', err.stack);
          }
        }());

        /*
        const user = {
          username,
          password,
        };
        done(null, user);
        */
      },
    ),
  );
};
