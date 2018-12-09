const router = require('express').Router();
const subcategories = '';

router.get('/', subcategories.getAll);
router.get('/:id', subcategories.getOne);
router.post('/', subcategories.create);
router.put('/:id', subcategories.update);
router.delete('/:id', subcategories.delete);