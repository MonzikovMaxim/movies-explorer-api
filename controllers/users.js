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
        next(new NotFoundError('Пользователь с таким id на найден'));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Невалидный id'));
      } else {
        next(error);
      }
    });
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10).then((hash) => User.create({
    email, password: hash, name,
  })
    .then((user) => {
      const newUser = user.toObject();
      delete newUser.password;
      res.send(newUser);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      }
      if (error.code === 11000) {
        next(new ConflictError('При регистрации указан email, который уже используется'));
      }
      return next(error);
    }));
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
    .catch((error) => next(new UnauthorizedError(error.message)));
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные'));
      }
      if (error.code === 11000) {
        return next(new ConflictError('Переданный email уже используется'));
      }
      return next(error);
    });
};

module.exports = {
  login,
  getUser,
  createUser,
  updateProfile,
};
