const router = require('express').Router();
const orders = '';

router.get('/', orders.getAll);
router.get('/:id', orders.getOne);
router.post('/', orders.create);
router.put('/:id', orders.update);
router.delete('/:id', orders.delete);