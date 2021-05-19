const router = require('express').Router();
const { validate } = require('express-validation');
const { create, update, remove, findOne, isExists } = require('../validations/course-validation');
const { hasAuth } = require('../middlwares/authentication-mid');
const CourseCtrl = require('../controllers/course-controller');

router.get('/' , hasAuth(['teacher', 'student', 'admin']), CourseCtrl.findAll);

router.get('/:id', hasAuth(['teacher', 'student', 'admin']), validate(findOne), isExists, CourseCtrl.findOne);

router.post('/', hasAuth(['teacher']), validate(create), CourseCtrl.create);

router.put('/:id', hasAuth(['teacher']), validate(update), isExists, CourseCtrl.update);

router.delete('/:id', hasAuth(['teacher', 'admin']), validate(remove), isExists, CourseCtrl.delete);

router.get('/buyCourse/:id', hasAuth(['student', 'teacher']), validate(findOne), isExists, CourseCtrl.buyCourse );

router.get('/revokeCourse/:id', hasAuth(['student', 'teacher', 'admin']), validate(findOne), isExists, CourseCtrl.revokeCourse);

router.post('/adminCourseRevoke/:id', hasAuth(['admin']), validate(findOne), isExists, CourseCtrl.adminCourseRevoke);




module.exports = router;
