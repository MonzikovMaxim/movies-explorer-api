const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const { validateUserData } = require('../middlewares/validate');
const auth = require('../middlewares/auth');

router.post('/signup', validateUserData, createUser);
router.post('/signin', validateUserData, login);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

module.exports = router;
