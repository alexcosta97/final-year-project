const router = require('express').Router();
const products = require('../controllers/product.controller');

router.get('/', products.readAll);
router.get('/:id', products.read);
router.post('/', products.create);
router.put('/:id', products.update);
router.delete('/:id', products.del);

module.exports = router;