require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');
const limiter = require('./middlewares/limiter');

const { PORT = 3000 } = process.env;
const { MONGO_URL = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();

// const CORS_WHITELIST = [
//   'http://localhost:3000',
//   'https://beatfilm-explorer.nomoredomains.rocks',
//   'http://beatfilm-explorer.nomoredomains.rocks',
// ];

// const corsOption = {
//   credentials: true,
//   optionsSuccessStatus: 204,
//   origin: function checkCorsList(origin, callback) {
//     if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

app.use(cors());

app.use(requestLogger);
// app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(error);

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

app.listen(PORT);
