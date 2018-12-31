const router = require('express').Router();
const companies = require('../controllers/company.controller');

//Setting up company routes
router.get('/:id', companies.get);
router.post('/', companies.create);

//Exporting router
module.exports = router;