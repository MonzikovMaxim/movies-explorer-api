const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const UnauthorizedError = require('../errors/unauthorized');
const ForbiddenError = require('../errors/forbidden');

const getMovies = (req, res, next) => Movie.find({ owner: req.user._id })
  .then((movie) => res.status(200).send(movie))
  .catch((error) => {
    if (error.name === 'ValidationError') {
      next(new BadRequest('Неверные данные'));
    } else {
      next(error);
    }
  });

const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    owner,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new UnauthorizedError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(error);
      }
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFoundError('Фильм с указанным _id не найден'))
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        return Movie.deleteOne({ _id: movie._id })
          .then(() => res.status(200).send({ message: 'Фильм удален из избранного' }));
      }
      throw new ForbiddenError('Чужие фильмы удалять запрещено');
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new UnauthorizedError('Невалидный id'));
      }
      next(error);
    });
};

module.exports = { getMovies, createMovie, deleteMovie };
