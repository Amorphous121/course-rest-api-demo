const router = require('express').Router();
const { validate } = require('express-validation');
const TeacherCtrl = require('../controllers/teacher-controller');
const  { hasAuth } = require('../middlwares/authentication-mid');

const { create, update, remove, findOne, isTeacherExists } = require('../validations/common-validations');

router.get('/', hasAuth(['teacher', 'admin']), TeacherCtrl.findAll);

router.get('/:id', hasAuth(['teacher', 'admin']), validate(findOne), isTeacherExists, TeacherCtrl.findOne);

router.post('/', validate(create), TeacherCtrl.create);

router.put('/:id', hasAuth(['teacher']), isTeacherExists, validate(update), TeacherCtrl.update);

router.delete('/:id', hasAuth(['teacher', 'admin']), isTeacherExists, validate(remove), TeacherCtrl.delete);

module.exports = router;