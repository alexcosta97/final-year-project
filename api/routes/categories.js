const router = require('express').Router();
const categories = require('../controllers/category.controller');

router.get('/', categories.readAll);
router.get('/:id', categories.read);
router.post('/', categories.create);
router.put('/:id', categories.update);
router.delete('/:id', categories.del);

module.exports = router;