const express = require('express');
const session = require('express-session');
const { PORT, SERVER_SESSION_SECRET } = require('./config.js');

let app = express();

app.use(express.static('wwwroot'));

// try use replace with 
app.use(session({
    secret: SERVER_SESSION_SECRET,           // Secret key to sign the session cookie
    resave: false,                           // Don't save session if it wasn't modified
    saveUninitialized: true,                 // Create session even if it's empty
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,         // Session expiration time (1 day)
        httpOnly: true,                      // Prevent client-side JS access to the cookie
        secure: false,                       // Set to true if using HTTPS
    }
}));

app.use(require('./routes/auth.js'));
app.use(require('./routes/hubs.js'));

app.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));
