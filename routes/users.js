const router = require('express').Router();
const { getUser, updateProfile } = require('../controllers/users');
const { validateUpdateProfile } = require('../middlewares/validate');

router.get('/me', getUser);
router.patch('/me', validateUpdateProfile, updateProfile);

module.exports = router;
