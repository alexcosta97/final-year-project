const router = require('express').Router();
const templates = '';

router.get('/', templates.getAll);
router.get('/:id', templates.getOne);
router.post('/', templates.create);
router.put('/:id', templates.update);
router.delete('/:id', templates.delete);