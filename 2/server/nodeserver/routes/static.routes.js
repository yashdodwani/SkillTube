const express = require('express');
const router = express.Router();

const { handlelogin, handlelogout, handleregister } = require('../controller/static.controller');

router.post('/login', handlelogin);
router.post('/register', handleregister);
router.get('/logout', handlelogout);

module.exports = router;    