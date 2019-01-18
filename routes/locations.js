const router = require('express').Router();
const locations = require('../controllers/location.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(Roles.Admin), locations.readAll);
router.get('/:id', authorize(), locations.read);
router.post('/', authorize(Roles.Admin), locations.create);
router.put('/:id', authorize(Roles.Admin), locations.update);
router.delete('/:id', authorize(Roles.Admin), locations.del);

module.exports = router;