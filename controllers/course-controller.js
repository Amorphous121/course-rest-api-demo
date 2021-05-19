const COURSE = require('../models/course-model');
const STUDENT = require('../models/student-model');
const TEACHER = require('../models/teacher-model');

const APIError = require('../utilities/APIError');
const { toObject, removeFields, dayDiff } = require('../utilities/helper');


exports.create = async (req, res, next) => {
    const creator = await TEACHER.findOne({ user: req.user._id, isDeleted: false });
    const payload = req.body;
    const course = await COURSE.create({
        name: payload.name,
        price: payload.price,
        createdBy: creator._id,
    });

    await TEACHER.findOneAndUpdate({ _id: creator._id, isDeleted: false }, { $addToSet: { coursesCreated: course._id } });
    return res.sendJson(200, removeFields(toObject(course), ['enrolledStudents']));
}

exports.findOne = async (req, res, next) => {

    const course = await COURSE.findOne({ _id: req.params.id, isDeleted: false })
        .populate({ path: 'createdBy', select: 'firstName lastName' })
        .populate({ path: 'enrolledStudents', select: 'firstName lastName' })
        .populate({ path: 'enrolledTeachers', select: 'firstName lastName' });

    res.sendJson(200, removeFields(toObject(course)));
}

exports.findAll = async (req, res, next) => {

    const course = await COURSE.find({ isDeleted: false }, 'name price createdby enrolledStudents')
        .populate({ path: 'createdBy', select: 'firstName lastName' })
        .populate({ path: 'enrolledStudents', select: 'firstName lastName' })
        .populate({ path: 'enrolledTeachers', select: 'firstName lastName' });

    if (course.length != 0) res.sendJson(200, course);
    else throw new APIError({ status : 404, message : "No courses are created yet."})
}

exports.update = async (req, res, next) => {

    let payload = req.body;
    let course = await COURSE.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { ...payload } }, { new: true });
    if (course) res.sendJson(200, "Course data updated successfully.")
}

exports.delete = async (req, res, next) => {

    let creator = await TEACHER.findOne({ user: req.user._id, isDeleted: false });
    let course = await COURSE.findOne({ _id: req.params.id, isDeleted: false });

    if (course.createdBy == creator._id || req.user.role == 'admin') {
        course = await COURSE.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { isDeleted: true, deletedBy: creator._id, deletedAt: Date.now() } }, { new: true });
        res.sendJson(200, "Course have been deleted successfully.")
    }
    else
        throw new APIError({ status: 403, message: "You can't delete someone else's code." })
}

exports.buyCourse = async (req, res, next) => {

    if (req.user.role === 'student') {
        let student = await STUDENT.findOne({ user: req.user._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
        if (!student) {
            student = await STUDENT.findOne({ user: req.user._id });
            let course = await COURSE.findOne({ _id: req.params.id, isDeleted: false });

            if (student.amount < course.price) {
                throw new APIError({ status: 400, message: "You don't have sufficient balance to purchase this course." })
            }
            let amount = student.amount - course.price;

            student = await STUDENT.findOneAndUpdate({ user: req.user._id }, { amount: amount, $addToSet: { coursesEnrolled: { purchasedAt: Date.now(), course: req.params.id } } });
            course = await COURSE.findOneAndUpdate({ _id: req.params.id }, { $addToSet: { enrolledStudents: student._id } });
            res.sendJson(200, "Course purchased successfully.");
        } else
            throw new APIError({ status: 404, message: "you have already enrolled in this course." });
    }

    if (req.user.role === 'teacher') {
        let teacher = await TEACHER.findOne({ user: req.user._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
        if (!teacher) {
            teacher = await TEACHER.findOne({ user: req.user._id });
            let course = await COURSE.findOne({ _id: req.params.id, isDeleted: false });

            if (teacher.amount < course.price) {
                throw new APIError({ status: 400, message: "You don't have sufficient balance to purchase this course." })
            }
            let amount = teacher.amount - course.price;

            teacher = await TEACHER.findOneAndUpdate({ user: req.user._id }, { amount: amount, $addToSet: { coursesEnrolled: { purchasedAt: Date.now(), course: req.params.id } } });
            course = await COURSE.findOneAndUpdate({ _id: req.params.id }, { $addToSet: { enrolledTeachers: teacher._id } });
            res.sendJson(200, "Course purchased successfully.");
        } else
            throw new APIError({ status: 404, message: "you have already enrolled in this course." });
    }
}

exports.revokeCourse = async (req, res, next) => {

    if (req.user.role === 'student') {
        let student = await STUDENT.findOne({ user: req.user._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
        if (student) {
            let course = await COURSE.findOne({ _id: req.params.id });
            let purchasedCourse = student.coursesEnrolled.filter(course => {
                if (course.course == req.params.id)
                    return course;
            })
            purchasedCourse = purchasedCourse[0];
            let dayDifference = dayDiff(new Date(purchasedCourse.purchasedAt), new Date());
            if (dayDifference <= 5) {
                let amount = student.amount + course.price;
                student = await STUDENT.findOneAndUpdate({ _id: student._id }, { amount: amount, $pull: { coursesEnrolled: purchasedCourse } })
                course = await COURSE.findOneAndUpdate({ _id : course._id }, { $pull : { enrolledStudents : student._id }})
                res.sendJson(200, "Course have been revoked Successfully.")
            } else
                throw new APIError({ status: 400, message: "Your revoke date is expired." });
        } else
            throw new APIError({ status: 404, message: "Can't revoke!! This course doesn't belongs to you." });
    }

    if (req.user.role === 'teacher') {

        let teacher = await TEACHER.findOne({ user: req.user._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
        if (teacher) {

            let course = await COURSE.findOne({ _id: req.params.id });
            let purchasedCourse = teacher.coursesEnrolled.filter(course => {
                if (course.course == req.params.id)
                    return course;
            })
            purchasedCourse = purchasedCourse[0];
            let dayDifference = dayDiff(new Date(purchasedCourse.purchasedAt), new Date());

            if (dayDifference <= 5) {
                let amount = teacher.amount + course.price;
                teacher = await TEACHER.findOneAndUpdate({ _id: teacher._id }, { amount: amount, $pull: { coursesEnrolled: purchasedCourse } })
                course = await COURSE.findOneAndUpdate({ _id : course._id }, { $pull : { enrolledTeachers : teacher._id }})
                res.sendJson(200, "Course have been revoked Successfully.")
            } else
                throw new APIError({ status: 400, message: "Your revoke date is expired." });
        } else
            throw new APIError({ status: 404, message: "Can't revoke!! This course doesn't belongs to you." });
    }
}


exports.adminCourseRevoke = async (req, res, next) => {

    let flag = false
    let course = await COURSE.findOne({ _id: req.params.id });

    let student = await STUDENT.findOne({ _id: req.body.id, isDeleted: false })
        .populate({
            path: 'user', select: 'email password role',
            populate: { path: 'role', select: 'name' }
        })

    let teacher = await TEACHER.findOne({ _id: req.body.id, isDeleted: false })
        .populate({
            path: 'user', select: 'email password role',
            populate: { path: 'role', select: 'name' }
        })

    if (student) {
        flag = true;
        let studentCourse = await STUDENT.findOne({ _id: student._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
       
        if (studentCourse) {
            let purchasedCourse = student.coursesEnrolled.filter(course => {
                if (course.course == req.params.id)
                    return course;
            })
            purchasedCourse = purchasedCourse[0];
            let dayDifference = dayDiff(new Date(purchasedCourse.purchasedAt), new Date());
            if (dayDifference <= 5) {
                let amount = student.amount + course.price;
                student = await STUDENT.findOneAndUpdate({ _id: student._id }, { amount: amount, $pull: { coursesEnrolled: purchasedCourse } })
                course = await COURSE.findOneAndUpdate({ _id : course._id }, { $pull : { enrolledStudents : student._id }})
                res.sendJson(200, "Course have been revoked Successfully.")
            } else
                throw new APIError({ status: 400, message: "Course revoke date is expired." });
        }
        else
            throw new APIError({ status: 400, message: "Student doesn't belong to the provided course." })
    }

    if (teacher) {
        flag = true;
        let teacherCourse = await TEACHER.findOne({ _id: teacher._id, coursesEnrolled: { $elemMatch: { course: req.params.id } } });
        if (teacherCourse) {

            let purchasedCourse = teacher.coursesEnrolled.filter(course => {
                if (course.course == req.params.id)
                    return course;
            })
            purchasedCourse = purchasedCourse[0];
            let dayDifference = dayDiff(new Date(purchasedCourse.purchasedAt), new Date());
            if (dayDifference <= 5) {
                let amount = teacher.amount + course.price;
                teacher = await TEACHER.findOneAndUpdate({ _id: teacher._id }, { amount: amount, $pull: { coursesEnrolled: purchasedCourse } })
                course = await COURSE.findOneAndUpdate({ _id : course._id }, { $pull : { enrolledTeachers : teacher._id }})
                res.sendJson(200, "Course have been revoked Successfully.")
            } else
                throw new APIError({ status: 400, message: "Course revoke date is expired." });
        }
        else
            throw new APIError({ status: 400, message: "Teacher doesn't belong to the provided course." })
    }

    if (!flag) throw new APIError({status : 400, message : "You have given wrong user id."});

}