const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

router.get('/users/:id', UserController.getUserById);
router.get('/users', UserController.getUsers);
router.delete('/users/:id', UserController.deleteUserById);

module.exports = router;
