const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/health', healthController.getHealth);

router.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working' });
});

module.exports = router;
