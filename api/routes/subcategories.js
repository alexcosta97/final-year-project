const router = require('express').Router();
const subcategories = require('../controllers/subcategory.controller');

router.get('/', subcategories.readAll);
router.get('/:id', subcategories.read);
router.post('/', subcategories.create);
router.put('/:id', subcategories.update);
router.delete('/:id', subcategories.del);

module.exports = router;