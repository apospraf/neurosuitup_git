const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");

exports.insturctor_admin = (req, res, next) => {
try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);

		req.userData = decoded;

		if (req.userData.role !== "instructor" && req.userData.role !== "admin") {
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
            
        }
		
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
};