const GitHubStrategy = require('passport-github').Strategy;
const dotenv = require("dotenv");

module.exports = (app, db, session, passport, ObjectID, LocalStrategy, bcrypt ) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: store,
      key: 'express.sid',

    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  /* Save User Id to a cookie */
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  /* Retrieve User details from cookie */
  passport.deserializeUser((userId, done) => {
    myDataBase.collection("socialusers").findOne(
      { _id: new ObjectId(userId) },
      (error, doc) => {
        done(null, doc);
      }
    );
  });
  passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://boilerplate-advancednode.abdelkaderharta.repl.co/auth/github/callback'},
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    myDataBase.findOneAndUpdate(
  { id: profile.id },
  {
    $setOnInsert: {
      id: profile.id,
      name: profile.displayName || 'John Doe',
      photo: profile.photos[0].value || '',
      email: Array.isArray(profile.emails)
        ? profile.emails[0].value
        : 'No public email',
      created_on: new Date(),
      provider: profile.provider || ''
    },
    $set: {
      last_login: new Date()
    },
    $inc: {
      login_count: 1
    }
  },
  { upsert: true, new: true },
  (err, doc) => {
    return cb(null, doc.value);
  }
);
  }));


  let findUserDocument = new LocalStrategy((username, password, done) => {
    myDataBase.collection("users").findOne({ username: username }, (err, user) => {
      console.log("User " + username + " attempted to log in.");
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  });

  passport.use(findUserDocument);
};