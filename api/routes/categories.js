const router = require('express').Router();
const categories = require('../controllers/category.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(), categories.readAll);
router.get('/:id', authorize(), categories.read);
router.post('/', authorize(Roles.Admin), categories.create);
router.put('/:id', authorize(Roles.Admin), categories.update);
router.delete('/:id', authorize(Roles.Admin), categories.del);

module.exports = router;