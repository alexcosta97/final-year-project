const router = require('express').Router();
const suppliers = require('../controllers/supplier.controller');

router.get('/', suppliers.readAll);
router.get('/:id', suppliers.read);
router.post('/', suppliers.create);
router.put('/:id', suppliers.update);
router.delete('/:id', suppliers.del);

module.exports = router;