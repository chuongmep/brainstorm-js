const express = require('express');
const { PORT } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});
// show full localhost URL
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
