const router = require('express').Router();
const users = '';

router.get('/', users.getAll);
router.get('/:id', users.getOne);
router.post('/', users.create);
router.put('/:id', users.update);
router.delete('/:id', users.delete);