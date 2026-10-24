const express = require('express');
const router = express.Router();
const mathController = require('../controllers/mathController');

router.get('/leaderboard', mathController.getLeaderboard);
router.post('/score', mathController.submitScore);
router.get('/stats', mathController.getStats);

module.exports = router;
