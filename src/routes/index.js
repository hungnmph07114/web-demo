const express = require('express');
const router = express.Router();

const statusRoutes = require('./statusRoutes');
const notesRoutes = require('./notesRoutes');
const mathRoutes = require('./mathRoutes');

router.use('/status', statusRoutes);
router.use('/notes', notesRoutes);
router.use('/math', mathRoutes);

module.exports = router;
