const router = require('express').Router();
const companies = '';

//Setting up company routes
router.get('/:id', companies.getHandler);
router.post('/', companies.create);

//Exporting router
module.exports = router;