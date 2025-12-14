const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/', statisticsController.getStatisticsPage);
router.post('/get-data', statisticsController.getStatisticsData);

module.exports = router;