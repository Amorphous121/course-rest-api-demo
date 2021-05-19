const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
	async up(db, client) {
		const role = await db.collection('roles').findOne({ name: 'admin' });
		const hash = await bcrypt.hash("admin121", parseInt(process.env.SALT));
		
		const user = await db.collection('users')
			.insertOne({
				email : "admin121@gmail.com",
				password : hash,
				role : role._id,
				isDeleted : false,
				createdAt: new Date(),
				updatedAt: new Date(),
			})

		await db.collection('teachers')
			.insertOne({
				firstName   : "admin",
				lastName    : "admin",
				user        : user.ops[0]._id,
				isDeleted 	: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
	},

	async down(db, client) {
		await db.collection('users').deleteOne({ email : "admin121@gmail.com"})
		await db.collection('teachers').deleteOne({ firstName: 'admin' });
	}
};
