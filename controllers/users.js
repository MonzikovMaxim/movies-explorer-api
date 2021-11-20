const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const ConflictError = require('../errors/conflict');
const UnauthorizedError = require('../errors/unauthorized');

const getUser = (req, res, next) => {
  User.findById({ _id: req.user._id })
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        throw new NotFoundError('Пользователь с таким id на найден');
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequest('Невалидный id');
      } else {
        next(error);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Такой email уже существует');
      }
      return bcrypt.hash(password, 10);
    }).then((hash) => {
      User.create({ email, password: hash, name })
        .then((user) => res.status(201).send({ email: user.email, name: user.name }));
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные при создании пользователя');
      } else {
        next(error);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials({ email, password })
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      return res.send({ token });
    })
    .catch((error) => {
      throw new UnauthorizedError(error.message);
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const id = req.user._id;
  return User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        throw new NotFoundError('Пользователь с таким id на найден');
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRequest('Переданы некорректные данные');
      } else {
        next(error);
      }
    })
    .catch(next);
};

module.exports = {
  login,
  getUser,
  createUser,
  updateProfile,
};
