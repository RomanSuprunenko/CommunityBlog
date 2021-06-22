const express = require('express');
const config = require('config');
const expressSession = require('express-session')
const bodyParser = require('body-parser');
const cors = require('cors');
const parameterize = require('parameterize');
const flash = require('connect-flash-plus');
const port = config.get('server.port') || 3000;
const passport = require('passport');
const routes = require('./routes');
require('./services/passport')(passport);

const app = express();

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.set('view engine', 'ejs');
app.use(cors());
app.use(expressSession({ cookie: { maxAge: 60000 }, 
    key: 'session_cookie_name',
    secret: 'storyboarderisthebestever',
    resave: false, 
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.use(routes);

app.use(function(req, res, next) {
    res.locals.parameterize = parameterize;
    return next();
  });

// Custom server error handler
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        return res.status(err.statusCode).send({
            statusCode: err.statusCode,
            message: err.message
        });
    }
    return next();
});

// Custom 404 route not found handler
app.use((req, res) => {
    res.status(404).send('404 not found');
})

app.listen(port);
console.log('Server run on port ' + (port));
