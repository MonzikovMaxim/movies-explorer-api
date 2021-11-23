const router = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validateMovieCreate, validateMovieId } = require('../middlewares/validate');

router.get('/', getMovies);
router.post('/', validateMovieCreate, createMovie);
router.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = router;
