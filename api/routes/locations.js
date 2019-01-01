const router = require('express').Router();
const locations = require('../controllers/location.controller');

router.get('/', locations.readAll);
// router.get('/:id', locations.read);
// router.post('/', locations.create);
// router.put('/:id', locations.update);
// router.delete('/:id', locations.del);

module.exports = router;