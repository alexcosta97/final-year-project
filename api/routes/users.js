const router = require('express').Router();
const {authMiddleware} = require('../services/tokenAuth');
const users = require('../controllers/user.controller');

router.get('/', authMiddleware, users.readAll);
router.get('/:id', authMiddleware, users.read);
router.post('/', users.create);
router.put('/:id', authMiddleware, users.update);
router.delete('/:id', authMiddleware, users.del);

module.exports = router;