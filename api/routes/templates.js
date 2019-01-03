const router = require('express').Router();
const templates = require('../controllers/template.controller');

router.get('/', templates.readAll);
router.get('/:id', templates.read);
router.post('/', templates.create);
router.put('/:id', templates.update);
router.delete('/:id', templates.del);

module.exports = router;