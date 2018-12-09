const router = require('express').Router();
const categories = '';

router.get('/', categories.getAll);
router.get('/:id', categories.getOne);
router.post('/', categories.create);
router.put('/:id', categories.update);
router.delete('/:id', categories.delete);