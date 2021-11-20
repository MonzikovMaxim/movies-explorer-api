require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000 } = process.env;
const app = express();
app.use(express.json());

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use('*', () => {
  throw new NotFoundError('Страница не найдена');
});
app.use(errors());
app.use(error);

// const CORS_WHITELIST = [
//   // 'http://localhost:3000',
//   // 'https://thisismesto.students.nomoredomains.monster',
//   // 'http://thisismesto.students.nomoredomains.monster',
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

// app.use(cors(corsOption));

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
