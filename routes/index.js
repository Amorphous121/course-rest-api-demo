const router = require('express').Router();
require('../middlwares/passport');


router.use('/api/students/', require('./student-routes'));
router.use('/api/teachers/', require('./teacher-routes'));
router.use('/api/courses/', require('./course-routes'));
router.use('/api/auth/', require('./auth-routes'));


module.exports = router;