const router = require('express').Router();
const products = require('../controllers/product.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(), products.readAll);
router.get('/:id', authorize(), products.read);
router.post('/', authorize(Roles.Admin), products.create);
router.put('/:id', authorize(Roles.Admin), products.update);
router.delete('/:id', authorize(Roles.Admin), products.del);

module.exports = router;