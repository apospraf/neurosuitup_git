const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/users");
const Exercise = require("../models/exercises");
const Task = require("../models/tasks")
const Pose = require("../models/poses");
const Level = require("../models/levels");


exports.general = (req, res, next) => {
	try {
		
		const token = req.headers.authorization.split(" ")[1];
		
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		
		req.userData = decoded;

		if (req.userData.role !== "instructor") {
			
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		}
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
};

exports.poseDelete = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;

		// First check if the user is an instructor
		if (req.userData.role !== "instructor") {
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			// Get the instructor's document from the database
			User.findOne({"_id": req.userData.userId}, (err, user) => {
				if (err) {
					res.status(500).json({
						error: err
					});
				// Check if the user exists in the database
				} else if (user.length < 1) {
					res.status(401).json({
						error: err,
						message: "Auth failed"
					});
					
				} else {
					// Check if the pose is owned by the logged in instructor
					Pose.findOne({$and: [{"_id": {$in: user.poses}}, {"_id": req.params.poseId}]}, (err1, pose) =>{
						if (err1) {
							res.status(500).json({
								error: err1
							});
						} else {
							if (!pose) {
								res.status(403).json({
									message: "Pose not owned"
								});
							} else {
								next();
							}
						}
					});
				}
			});
		}
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
};

exports.poseOwned = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		User.findOne({"_id": req.userData.userId}, (err, user) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else {
				if (!user){
					res.status(401).json({
						message: "Auth failed"
					});
				} else {
					Pose.findOne({"codename": req.params.codename}, "_id", (err, pose) => {
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (pose){
								if (user.poses !== null && user.poses.includes(pose._id)){
									next();
								} else {
									res.status(403).json({
										message: "Pose not owned"
									});
								}
							} else {
								res.status(404).json({
									message: "Pose not found"
								});
							}
						}
					})
				}
			}
		});
	} catch (error){
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.taskOwned = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		User.findOne({"_id": req.userData.userId}, (err, user) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else {
				if (!user){
					res.status(401).json({
						message: "Auth failed"
					});
				} else {
					Pose.findOne({"codename": req.params.codename}, "_id", (err, task) => {
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (task){
								if (user.tasks !== null && user.tasks.includes(task._id)){
									next();
								} else {
									res.status(403).json({
										message: "Task not owned"
									});
								}
							} else {
								res.status(404).json({
									message: "Task not found"
								});
							}
						}
					})
				}
			}
		});
	} catch (error){
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.exerciseOwned = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		User.findOne({"_id": req.userData.userId}, (err, user) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else {
				if (!user){
					res.status(401).json({
						message: "Auth failed"
					});
				} else {
					Exercise.findOne({"codename": req.params.codename}, "_id", (err, exercise) => {
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (exercise){
								if (user.exercises !== null && user.exercises.includes(exercise._id)){
									next();
								} else {
									res.status(403).json({
										message: "Exercise not owned"
									});
								}
							} else {
								res.status(404).json({
									message: "Exercise not found"
								});
							}
						}
					})
				}
			}
		});
	} catch (error){
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.levelOwned = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		User.findOne({"_id": req.userData.userId}, (err, user) => {
			if (err) {
				res.status(500).json({
					error: err
				});
			} else {
				if (!user){
					res.status(401).json({
						message: "Auth failed"
					});
				} else {
					Level.findOne({"codename": req.params.codename}, "_id", (err, level) => {
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (level){
								if (user.levels !== null && user.levels.includes(level._id)){
									next();
								} else {
									res.status(403).json({
										message: "Level not owned"
									});
								}
							} else {
								res.status(404).json({
									message: "Level not found"
								});
							}
						}
					})
				}
			}
		});
	} catch (error){
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.isSelf = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;

		if (req.params.userId !== req.userData.userId){
			return res.status(401).json({
				message: "Auth failed"
			});
		}
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
}

exports.levelDelete = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		// First check if the user is an instructor
		if (req.userData.role !== "instructor") {
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			// Get the instructor's document from the database
			User.findOne({"_id": req.userData.userId}, (err, user) => {
				if (err) {
					res.status(500).json({
						error: err
					});
				// Check if the user exists in the database
				} else if (user.length < 1) {
					res.status(404).json({
						error: err,
						message: "User not found"
					});
					
				} else {
					// Check if the pose is owned by the logged in instructor
					Level.findOne({$and: [{"_id": {$in: user.levels}}, {"_id": req.params.levelId}]}, (err, level) =>{
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (!level) {
								res.status(403).json({
									message: "Level not owned"
								});
							} else {
								next();
							}
						}
					});
				}
			});
		}
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.exerciseDelete = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		// First check if the user is an instructor
		if (req.userData.role !== "instructor") {
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			// Get the instructor's document from the database
			User.findOne({"_id": req.userData.userId}, (err, user) => {
				if (err) {
					res.status(500).json({
						error: err
					});
				// Check if the user exists in the database
				} else if (user.length < 1) {
					res.status(404).json({
						error: err,
						message: "User not found"
					});
					
				} else {
					// Check if the pose is owned by the logged in instructor
					Exercise.findOne({$and: [{"_id": {$in: user.exercises}}, {"_id": req.params.exerciseId}]}, (err, exercise) =>{
						if (err) {
							res.status(500).json({
								error: err
							});
						} else {
							if (!exercise) {
								res.status(403).json({
									message: "Exercise not owned"
								});
							} else {
								next();
							}
						}
					});
				}
			});
		}
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.taskDelete = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		
		// First check if the user is an instructor
		if (req.userData.role !== "instructor") {
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			// Get the instructor's document from the database
			User.findOne({"_id": req.userData.userId}, (err, user) => {
				if (err) {
					res.status(500).json({
						error: err
					});
				// Check if the user exists in the database
				} else if (user.length < 1) {
					res.status(404).json({
						error: err,
						message: "User not found"
					});
					
				} else {
					// Check if the task is owned by the logged in instructor
					Task.findOne({$and: [{"_id": {$in: user.tasks}}, {"_id": req.params.taskId}]}, (err1, task) =>{
						if (err1) {
							res.status(500).json({
								error: err1
							});
						} else {
							if (!task) {
								res.status(403).json({
									message: "Task not owned"
								});
							} else {
								next();
							}
						}
					});
				}
			});
		}
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed"
		});
	}
}

exports.getPatient = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);

		req.userData = decoded;

		if (req.userData.role !== "instructor") {
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		}
		
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
}

exports.accessTask = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);

		req.userData = decoded;

		if (req.userData.role !== "instructor") {
			console.log("user prob");
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			User.findOne({"_id": req.userData.userId}, "tasks", (err, user) =>{
				if (err){
					console.log("err prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user){
					console.log("user not found prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user.tasks.includes(req.params.taskId)) {
					Task.findOne({"_id": req.params.taskId}, (err, task) =>{
						if (task.isPublic){
							next();
						} else {
							res.status(401).json({
								message: "Auth failed"
							});
						}
					});
				} else {
					next();
				}
			});
		}

		
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
}

exports.accessExercise = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);

		req.userData = decoded;

		if (req.userData.role !== "instructor") {
			console.log("user prob");
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			User.findOne({"_id": req.userData.userId}, "exercises", (err, user) =>{
				if (err){
					console.log("err prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user){
					console.log("user not found prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user.exercises.includes(req.params.exerciseId)) {
					Exercise.findOne({"_id": req.params.exerciseId}, (err, exercise) =>{
						if (exercise.isPublic){
							next();
						} else {
							res.status(401).json({
								message: "Auth failed"
							});
						}
					});
				} else {
					next();
				}
			});
		}

		
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
}

exports.accessLevel = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);

		req.userData = decoded;

		if (req.userData.role !== "instructor") {
			console.log("user prob");
			// Also here we can check on object-level permissions; eg. is this exercise created by you? If not you can not delete it
			return res.status(401).json({
				message: "Auth failed!"
			});
		} else {
			User.findOne({"_id": req.userData.userId}, "levels", (err, user) =>{
				if (err){
					console.log("err prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user){
					console.log("user not found prob");
					res.status(401).json({
						message: "Auth failed"
					});
				} else if (!user.levels.includes(req.params.levelId)) {
					Level.findOne({"_id": req.params.levelId}, (err, level) =>{
						if (err){
							res.status(500).json({
								error: err
							});
						} else {
							if (level.isPublic){
								next();
							} else {
								res.status(401).json({
									message: "Auth failed"
								});
							}
						}	
					});
				} else {
					next();
				}
			});
		}

		
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed!"
		});
	}
}