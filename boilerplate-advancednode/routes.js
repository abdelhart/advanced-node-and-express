


module.exports = (app, db, bodyParser, passport, bcrypt  ) => {
  app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

    app.route("/").get((req, res) => {
      res.render("index", {
        title: "Home Page",
        message: "Please login",
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true
      });
    }); 

    

    app.post(
      "/login",
      bodyParser.urlencoded({ extended: false }),
      passport.authenticate("local", { failureRedirect: "/" }),
      (request, response) => {
        response.redirect("/profile");
      }
    );

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/");
    }

    app.route("/profile").get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + "/views/pug/profile", {
        username: req.user.username
      });
    });

    app.route("/logout").get((req, res) => {
      req.logout();
      res.redirect("/");
    });

    app.route("/register").post(
      bodyParser.urlencoded({ extended: false }),
      (req, res, next) => {
        /* Check if user exists */
        db.collection("users").findOne(
          { username: req.body.username },
          (error, user) => {
            if (!error && user) {
              res.redirect("/");
            }
          }
        );

        /* Create User Document */
        let hash = bcrypt.hashSync(req.body.password, 12)
        db.collection("users").insertOne(
          {
            username: req.body.username,
            password: hash
          },
          (error, createdUser) => {
            if (!error && createdUser) {
              next();
            }
          }
        );
      },
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      }
    );
      app.route("/auth/github").get(passport.authenticate("github"));

app.route("/auth/github/callback").get(passport.authenticate("github", { failureRedirect: "/" }),
	  (req, res) => {
      req.session.user_id = req.user.id;
	    res.redirect("/chat");
	  }
	);
    app.route("/chat").get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + "/views/pug/chat", {
        user: req.user
      });
    });

    app.use((req, res, next) => {
      res
        .status(404)
        .type("text")
        .send("Not Found");
    });
}