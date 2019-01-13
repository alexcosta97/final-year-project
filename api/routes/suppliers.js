const router = require('express').Router();
const suppliers = require('../controllers/supplier.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(), suppliers.readAll);
router.get('/:id', authorize(), suppliers.read);
router.post('/', authorize(Roles.Admin), suppliers.create);
router.put('/:id', authorize(Roles.Admin), suppliers.update);
// router.delete('/:id', suppliers.del); -> Turned off for now to make sure that a company doesn't delete someone else's supplier

module.exports = router;