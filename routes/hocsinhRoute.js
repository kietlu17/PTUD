const express = require('express');
const router = express.Router();
const dangkynhaphocCTRL = require('../controllers/hocsinh/dangkynhaphocCTRL')
const scheduleController = require('../controllers/scheduleController');

router.get('/nhaphoc/tohop', dangkynhaphocCTRL.viewForm);
router.post('/nhaphoc/tohop', dangkynhaphocCTRL.submit);

// Thêm vào routes hiện có
router.get('/thoikhoabieu', scheduleController.viewScheduleStudent);
router.get('/thoikhoabieu/:hocSinhId', scheduleController.viewScheduleStudent);

module.exports = router;