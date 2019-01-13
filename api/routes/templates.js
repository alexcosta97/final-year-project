const router = require('express').Router();
const templates = require('../controllers/template.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

router.get('/', authorize(), templates.readAll);
router.get('/:id', authorize(), templates.read);
router.post('/', authorize(Roles.Admin), templates.create);
router.put('/:id', authorize(Roles.Admin), templates.update);
router.delete('/:id', authorize(Roles.Admin), templates.del);

module.exports = router;