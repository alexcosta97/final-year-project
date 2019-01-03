const router = require('express').Router();
const orders = require('../controllers/order.controller');

router.get('/', orders.readAll);
router.get('/:id', orders.read);
router.post('/', orders.create);
router.put('/:id', orders.update);
router.delete('/:id', orders.del);

module.exports = router;