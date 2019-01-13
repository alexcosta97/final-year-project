const router = require('express').Router();
const orders = require('../controllers/order.controller');
const authorize = require('../services/authorize');
const roles = require('../services/roles');

router.get('/', authorize(), orders.readAll);
router.get('/:id', authorize(), orders.read);
router.post('/', authorize(), orders.create);
router.put('/:id', authorize(), orders.update);
router.delete('/:id', authorize(), orders.del);

module.exports = router;