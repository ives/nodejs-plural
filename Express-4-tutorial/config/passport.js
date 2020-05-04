const passport = require('passport');
require('./strategies/local.strategy')();

// another way to export
module.exports = function passportConfig(app) {
  // sets itself up on req
  app.use(passport.initialize());
  app.use(passport.session());

  // Stores user in session
  // uses req.login?
  passport.serializeUser((user, doneCB) => {
    // in callbacks: always error first, then the useful thing
    // null for err
    doneCB(null, user);
  });

  // Retreive the user from the session from cookie
  // on subsequent page visits - put into req.user
  passport.deserializeUser((user, doneCB) => {
    // Mongo - find user by user.id, then be done
    doneCB(null, user);
  });
};
