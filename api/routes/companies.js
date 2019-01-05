const router = require('express').Router();
const companies = require('../controllers/company.controller');
const {authMiddleware} = require('../services/tokenAuth');

//Setting up company routes
router.get('/:id', authMiddleware,  companies.get);
router.post('/', companies.create);
router.put('/:id', authMiddleware, companies.update);
router.delete('/:id', authMiddleware, companies.del);

//Exporting router
module.exports = router;