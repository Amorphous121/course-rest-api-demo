const router = require('express').Router();
const { validate } = require('express-validation');

const StudentCtrl = require('../controllers/student-controller');
const { hasAuth } = require('../middlwares/authentication-mid');
const { create, update, remove, isStudentExists, findOne } = require('../validations/common-validations');


router.get('/', hasAuth(['student', 'teacher', 'admin' ]), StudentCtrl.findAll)

router.get('/:id', hasAuth(['student','teacher', 'admin']), validate(findOne), isStudentExists, StudentCtrl.findOne);

router.post('/', validate(create), StudentCtrl.create);

router.put('/:id', hasAuth(['student']), validate(update), isStudentExists,StudentCtrl.update);

router.delete('/:id', hasAuth(['student', 'teacher', 'admin']), validate(remove), isStudentExists, StudentCtrl.delete);


module.exports = router;