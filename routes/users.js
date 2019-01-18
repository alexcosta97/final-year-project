const router = require('express').Router();
const authorize = require('../services/authorize');
const users = require('../controllers/user.controller');
const Roles = require('../services/roles');

router.get('/', authorize(Roles.Admin), users.readAll);
router.get('/:id', authorize(), users.read);
router.post('/', users.create);
router.put('/:id', authorize(), users.update);
router.delete('/:id', authorize(), users.del);

module.exports = router;