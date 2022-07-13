const path = require('path');

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');

const sessionConfig = require('./config/session');
const db = require('./data/database');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const authMiddleware = require('./middlewares/auth-middlewares');
const addCSRFTokenMiddleware = require('./middlewares/csrf-token-middleware');

const mongoDbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session(sessionConfig.createSessionConfig(mongoDbSessionStore)));
app.use(csrf());

// These middlewares don't get executed by us, instead by express once it receives http requests.
app.use(addCSRFTokenMiddleware);
app.use(authMiddleware); 

// Note: No middleware is excuted by us, instead they're executed by express.
//      Then why middlewares like static, urlencoded, session execute in app.use (why?).
//      Because these are functions with configuration object passed into it and result of calling those functions
//      gives the middleware whereas authMiddleware is itself a middleware (custom middleware). That's why 
//      static, urlencoded, session etc. are executed but authMiddleware not!

app.use(authRoutes);
app.use(blogRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});
