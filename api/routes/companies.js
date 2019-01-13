const router = require('express').Router();
const companies = require('../controllers/company.controller');
const authorize = require('../services/authorize');
const Roles = require('../services/roles');

//Setting up company routes
router.get('/:id', authorize(),  companies.get);
router.post('/', companies.create);
router.put('/:id', authorize(Roles.Admin), companies.update);
router.delete('/:id', authorize(Roles.Admin), companies.del);

//Exporting router
module.exports = router;