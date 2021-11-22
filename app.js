require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');

const { PORT = 3000 } = process.env;
const { MONGO_URL = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();
app.use(express.json());

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(error);

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

app.listen(PORT);
