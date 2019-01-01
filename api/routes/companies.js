const router = require('express').Router();
const companies = require('../controllers/company.controller');

//Setting up company routes
router.get('/:id', companies.get);
router.post('/', companies.create);
router.put('/:id', companies.update);
router.delete('/:id', companies.del);

//Exporting router
module.exports = router;