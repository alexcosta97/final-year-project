const router = require('express').Router();
const locations = '';

router.get('/', locations.getAll);
router.get('/:id', locations.getOne);
router.post('/', locations.create);
router.put('/:id', locations.update);
router.delete('/:id', locations.delete);