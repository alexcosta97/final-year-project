const router = require('express').Router();
const suppliers = '';

router.get('/', suppliers.getAll);
router.get('/:id', suppliers.getOne);
router.post('/', suppliers.create);
router.put('/:id', suppliers.update);
router.delete('/:id', suppliers.delete);