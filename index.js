const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT

const userRoutes = require('./src/routes/user.routes');

app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;