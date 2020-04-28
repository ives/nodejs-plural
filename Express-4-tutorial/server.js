const express = require("express");
const chalk = require("chalk"); // pretty colours for console log / debug
const morgan = require("morgan"); // log out http req details
const path = require("path"); // deal with cross platform slashes, missing slashes etc - already available
// so only visible in debug mode:
const debug = require("debug")("server"); // detailed logout

const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;
const confDemo = [{ condig: "demo" }, { passTo: "router" }];

const app = express();
app.use(morgan("tiny")); // combined - lots, tiny - min

// body-parser : pull out POST and add it to our body:
// Parse incoming request bodies in a middleware before your handlers, 
// available under the req.body property.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// EJS templates:
app.set("views", "./views"); // set a val, can then app.get('views') - those are reserved
app.set("view engine", "ejs"); // SET not use - will look for an NPM package ejs

app.get("/", (req, res) => {
  res.render("index2", {
    moretitle: "this is Awesome shit",
    list: [{ item: 12 }, { item: 321 }],
  });
});

// passing OPTIONAL config: (confDemo)
const myRouter = require("./routes/myRoutes")(confDemo);
const adminRouter = require("./routes/adminRoutes")();
const authRouter = require("./routes/authRoutes")();

app.use("/books", myRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);

// Middleware structure
app.use((req, res, next) => {
  debug("> my middleware");
  next();
});
// set up public folder
// URL is then http://localhost:3000/style.css - does not include 'public'
app.use(express.static(path.join(__dirname, "/public/")));

// link to node module css - can have multiple places to look in
app.use(
  "./css",
  express.static(path.join(__dirname, "./node_modules/bootstrap"))
);
app.use(
  "./css",
  express.static(path.join(__dirname, "./node_modules/material-ui/css"))
);

// server gets a GET request to '/'
app.get("/", (req, res) => {
  // res.send('Hellooo');
  // __dirname locayion of executable
  res.sendFile(path.join(__dirname, "views", "/index.html"));
});

app.listen(port, () => {
  debug(`Listening on port ${chalk.green(port)}`);
});
