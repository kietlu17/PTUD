const express = require('express');
// ...existing code...
const router = express.Router();
const gradesCtrl = require('../controllers/phuhuynh/gradesController');

// Route để học sinh xem điểm
router.get('/:hocSinhId/diem', gradesCtrl.showGradesForStudent);

module.exports = router;