const express = require('express');
const router = express.Router();
const dangkynhaphocCTRL = require('../controllers/hocsinh/dangkynhaphocCTRL')

router.get('/nhaphoc/tohop', dangkynhaphocCTRL.viewForm);
router.post('/nhaphoc/tohop', dangkynhaphocCTRL.submit);

module.exports = router;