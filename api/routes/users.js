const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authInstructor = require("../middleware/auth-instructor");
const authGeneral = require("../middleware/authGeneral");
const authAdmin = require("../middleware/auth-admin");

const User = require('../models/users');
const Pose = require('../models/poses');
const mongoose = require("mongoose");
const { response, json } = require("express");
const e = require("express");
const users = require("../models/users");

// Find commanding instructor of specific patient
router.get('/commandingInstructor/:patientId', authInstructor.general, (req, res, next) => {
	User.findOne({"patients": req.params.patientId}, (err, user) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (!user) {
				res.status(404).json({
					message: "User not found"
				});
			} else {
				res.status(200).json({
					username: user.username
				});
			}
		}
	});
});

// Get patients, accessible by admins and instructors with a twist (see documentation)
router.get('/byRole/:role', authGeneral.insturctor_admin, (req, res, next) => {

	if (req.params.role == "instructor"){
		if (req.userData.role == "instructor"){
			req.headers.selectstring = "first_name last_name username patients email"
		}
	} else if (req.params.role == "admin") {
		if (req.userData.role == "instructor"){
			return res.status(401).json({
				message: "Auth failed"
			});
		}
	} else if (req.params.role == "patient") {
		// continue
	} else {
		return res.status(400).json({
			message: "The type of role that is requested does not exist"
		});
	}
	User.find({"role": req.params.role}, req.headers.selectstring, (err, users) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			const response = {
				count: users.length,
				users: users.map(user => {
					return {
						_id: user._id,
						first_name: user.first_name ?? null,
						last_name: user.last_name ?? null,
						username: user.username ?? null,
						email: user.email ?? null,
						viewed: user.viewed ?? null,
						age: user.age ?? null,
						gender: user.gender ?? null,
						history: user.history ?? null,
						role: user.role ?? null,
						prescription: user.prescription ?? null,
						analytics: user.analytics ?? null,
						patients: user.patients ?? null,
						poses: user.poses ?? null,
						tasks: user.tasks ?? null,
						exercises: user.exericses ?? null
					}
				})
			};
			res.status(200).json(response);
		}
	});
});

// Get some instructor info (Obsolete, now using general route)
// router.get('/instructors', authInstructor.general, (req, res, next) => {
// 	User.find({"role": "instructor"}, req.headers.selectstring, (err, users) => {
// 		if (err) {
// 			res.status(500).json({
// 				error: err
// 			});
// 		} else {
// 			const response = {
// 				count: users.length,
// 				users: users.map(user => {
// 					return {
// 						_id: user._id,
// 						username: user.username,
// 						patients: user.patients
// 					};
// 				})
// 			};
// 			res.status(200).json(response);
// 		}
// 	});
// });

// Get user information by user
router.get('/self/:userId', authInstructor.isSelf, (req, res, next) =>{
	User.findOne({"_id": req.params.userId}, (err, user) =>{
		if (err) {
			return res.status(500).json({
				error: err
			});
		} else if (!user){
			return res.status(404).json({
				message: "User not found"
			});
		}
		res.status(200).json({
			user: user
		});
	});
});

router.get('/byId/:userId', authInstructor.general, (req, res, next) => {
	User.findOne({"_id": req.params.userId}, req.headers.selectstring, (err, user) =>{
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (!user){
				res.status(404).json({
					message: "User not found"
				});
			} else {
				if (user.role !== "patient"){
					res.status(401).json({
						message: "Auth failed"
					});
				} else{
					res.status(200).json({
						user: user
					});
				}
			}
		}
		
	});
})

router.get('/multi', (req, res, next) => {
	const filter = {}
	for (const id of req.body.ids){
		filter
	}
})

//Get token info YOU HAVE TO CHANGE THE CODE BECAUSE POST -> GET
router.get('/tokenInfo/:token', (req, res, next) => {
	try{
		const decoded = jwt.decode(req.params.token);
		res.status(200).json({
			data: decoded
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
	}
	
});

// Get user information by admin
router.get('/admin/:userId', authAdmin, (req, res, next) =>{
	User.findOne({"_id": req.params.userId}, req.headers.selectstring, (err, user) =>{
		if (err) {
			res.status(500).json({
				error: err
			});
		} else if (!user){
			res.status(404).json({
				message: "User not found"
			});
		} else {
			res.status(200).json({
				user: user
			});
		}	
	});
});

router.get('/admin', authAdmin, (req, res, next) => {
	User.find({}, req.headers.selectstring, (err, users) =>{
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			const response = {
				count: users.length,
				users:  users.map(user => {
					return {
						_id: user._id,
						first_name: user.first_name ?? null,
						last_name: user.last_name ?? null,
						username: user.username ?? null,
						email: user.email ?? null,
						viewed: user.viewed ?? null,
						age: user.age ?? null,
						gender: user.gender ?? null,
						history: user.history ?? null,
						role: user.role ?? null,
						prescription: user.prescription ?? null,
						analytics: user.analytics ?? null,
						patients: user.patients ?? null,
						poses: user.poses ?? null,
						tasks: user.tasks ?? null,
						exercises: user.exericses ?? null
					}
				})
			};
			res.status(200).json(response);
		}
	});
});

// Sign up, accessible by admins
router.post('/signupAdmin', authAdmin, (req, res, next) => {
	const {first_name, last_name, username, email, password} = req.body;
	User.findOne({$or: [{"username": username}, {"email": email}]}, (err, user) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (user) { 
				res.status(409).json({
					message: "Username or mail exists"
				});
			} else {
				bcrypt.hash(password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err
						});
					} else {
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							first_name: first_name,
							last_name: last_name,
							username: username,
							role: "admin",
							email: email,
							hash: hash	
						});
						user
						.save()
						.then(result => {
							console.log(result)
							res.status(201).json({
								message: 'Admin created'
							})
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
					}
				
				});
			}
		}
	});
});
// Sign up accessible by everyone
router.post('/signup', (req, res, next) => {
	const {
		username,
		first_name,
		last_name,
		gender,
		age,
		role,
		history,
		email,
		password
	} = req.body;
	User.find({$or: [{'username': username}, {"email": email}]} , 
	function(err, docs){
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			if (docs.length > 0){
				res.status(409).json({
					message: "Username or mail exists"
				});
			} else {
				if (role === "admin"){
					res.status(401).json({
						message: "Unauthorized action"
					});
				} else {
					bcrypt.hash(password, 10, (err, hash) => {
						if (err) {
							return res.status(500).json({
								error: err
							});
						} else {
							const user = new User({
								_id: new mongoose.Types.ObjectId(),
								username: username,
								first_name: first_name,
								last_name: last_name,
								gender: gender,
								age: age,
								role: role,
								history: history,
								email: email,
								hash: hash	
							});
							user
							.save()
							.then(result => {
								console.log(result)
								res.status(201).json({
									message: 'User created'
								})
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: err
								});
							});
						}		
					});
				}
			}			
		}
	});	
});


// Login accessible by everyone
router.post("/login", (req, res, next) => {
	const {rUsername, rPassword} = req.body;
	User.findOne({"username": rUsername}, function(err, user){
		// bcrypt.hash(rPassword, 10, (err, hash) =>{
		// 	console.log(hash);
		// });
		if (!err){
			if (!user){
				res.status(401).json({
					message: "No such user"
				});
			} else {
				bcrypt.compare(rPassword, user.hash, (err, result) =>{
					if (err){
						res.status(401).json({
							message: "Auth failed"
						});
					} else {
						if (result){
							const payload = {
								userId: user._id,
								role: user.role,
								username: user.username
							};
							const token = jwt.sign(payload,
							process.env.JWT_KEY,
							{
								expiresIn: "24h"
							});
							user.hash = null;
							res.status(200).json({
								user: user,
								token: token,
								message: "Auth successful"
							});
						} else {
							res.status(401).json({
								message: "Auth failed"
							});
						}
					}
				});
			}
		} else {
			res.status(500).json({
				error: err
			});
		}
	});
});

// Delete user by instructor
router.delete("/delete/:userId", authInstructor.isSelf, (req, res, next) => {
	User.deleteOne({"_id": req.params.userId}, (err, result) => {
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "User deleted!"
			});
		}
	});
});

// Add a patient to the logged in instructor patient list
router.patch("/assign", authInstructor.general, (req, res, next) => {
	User.findById(req.userData.userId, (err, user) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			var updateVar = {};
			if (user.patients === null) {
				updateVar = {$set: {"patients" : [req.body.patientId]}};
			} else {
				if (user.patients.includes(req.body.patientId)){
					return res.status(409).json({
						message: "Patient already assigned"
					});
				} else {
					updateVar = {$push: {"patients": req.body.patientId}};
				}
			}
			User.updateOne({"_id": req.userData.userId}, updateVar, (err) => {
				if (err) {
					res.status(500).json({
						error: err
					});
				} else {
					res.status(201).json({
						patientId: req.body.patientId,
					});
				}
			});
		}
	});
});

// Remove a patient from the logged in instructor patient list
router.patch("/unassign", authInstructor.general, (req, res, next) => {
	User.findById(req.userData.userId, (err, user) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (user.patients.includes(req.body.patientId)){
				User.updateOne({"_id": user._id}, {$pull: {"patients": req.body.patientId}}, (err, result) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						res.status(200).json({
							message: "Succefully deleted patient"
						});
					}
				});
				
			} else {
				res.status(403).json({
					message: "Unauthorized action. Patient is not assigned to logged in instructor"
				});
			}
		}
	});
});

router.patch('/updatePrescription/:patientId', authInstructor.general, (req, res, next) => {
	User.updateOne({"_id": req.params.patientId}, {$set: {"prescription": req.body}}, (err) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Patient prescription updated"
			});
		} 
	})
});

router.patch('/changeRole', authAdmin, (req, res, next) => {
	
	User.updateOne({"_id": req.body.userId}, {$set: {"role": req.body.newRole}}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Role successfully changed"
			});
		}
	})
});

// Delete user by admin
router.delete("/admin/:userId", authAdmin, (req, res, next) =>{
	User.deleteOne({"_id": req.params.userId}, (err, result) => {
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "User deleted!",
				result: result
			});
		}
	});
});

module.exports = router;