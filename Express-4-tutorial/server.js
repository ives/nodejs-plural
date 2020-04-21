const express = require('express');
const chalk = require('chalk'); // pretty colours for console log / debug
const morgan = require('morgan'); // log out http req details
const path = require('path'); // deal with cross platform slashes, missing slashes etc - already available

// so only visible in debug mode:
const debug = require('debug')('server'); // detailed logout

const app = express();

app.use(morgan('tiny')); // combined - lots, tiny - min

// set up public folder
// URL is then http://localhost:3000/style.css - does not include 'public'
app.use(express.static(path.join(__dirname, '/public/')));

// link to node module css - can have multiple places to look in
app.use(
  './css',
  express.static(path.join(__dirname, './node_modules/bootstrap')),
);
app.use(
  './css',
  express.static(path.join(__dirname, './node_modules/material-ui/css')),
);

// server gets a GET request to '/'
app.get('/', (req, res) => {
  // res.send('Hellooo');
  // __dirname locayion of executable
  res.sendFile(path.join(__dirname, 'views', '/index.html'));
});

app.listen(3000, () => {
  debug(`Listening on port ${chalk.green(3000)}`);
});
