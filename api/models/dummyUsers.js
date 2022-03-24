const bcrypt = require("bcrypt");

let setPassword = async function(user, password) {
	return bcrypt.hash(password, 10, (err, hash) => {
		if (err) {
			return new Error("Could not set password!");
		} else {
			user.password = hash;
		}
		console.log("User password loaded!");
		// console.log(user);
	});
}

const users = {
	foo: {
		username: "foo",
		role: "patient",
		password: ""
	},
	bar: {
		username: "bar",
		role: "instructor",
		password: ""
	}
}

setPassword(users.foo, "foobar");
setPassword(users.bar, "foobar");

module.exports = users;
