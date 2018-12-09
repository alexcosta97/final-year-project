const router = require('express').Router();
const products = '';

router.get('/', products.getAll);
router.get('/:id', products.getOne);
router.post('/', products.create);
router.put('/:id', products.update);
router.delete('/:id', products.delete);