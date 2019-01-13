const router = require('express').Router();
const subcategories = require('../controllers/subcategory.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(), subcategories.readAll);
router.get('/:id', authorize(), subcategories.read);
router.post('/', authorize(Roles.Admin), subcategories.create);
router.put('/:id', authorize(Roles.Admin), subcategories.update);
router.delete('/:id', authorize(Roles.Admin), subcategories.del);

module.exports = router;