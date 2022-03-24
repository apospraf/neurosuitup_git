/* For mongoose see
https://www.youtube.com/watch?v=WDrU305J1yw&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=6
index 6 to 9
*/
const { Router, response } = require('express');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const Exercise = require('../models/exercises');
const User = require('../models/users');

const authSubject = require("../middleware/auth-subject");
const authInstructor = require("../middleware/auth-instructor");
const authAdmin = require('../middleware/auth-admin');
const users = require('../models/users');

router.get('/:exerciseId', authInstructor.accessExercise, (req, res, next) => {
	// req.userdata = jwt.decode(req.headers.authorization.split(" ")[1]);
	Exercise.findOne({"_id": req.params.exerciseId},
	req.headers.selectstring,
	(err, exercise) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (exercise){
				res.status(200).json({
					exercise: exercise
				});
			} else {
				res.status(404).json({
					message: "Exercise not found"
				});
			}	
		}
	});
			
});


router.get('/', authInstructor.general, (req, res, next) => {
	// req.userdata = jwt.decode(req.headers.authorization.split(" ")[1]);
    User.findOne({"_id": req.userData.userId}, (err, user) => {
		if (!err){
			if (user){
				Exercise.find({$or: [{"_id": {$in: user.exercises}}, {"isPublic": true}]},
				req.headers.selectstring,
				(err, exercises) => {
					if (err){
						console.log(err);
						res.status(500).json({
							error: err
						});
					} else {
						const response = {
							count: exercises.length,
							exercises: exercises.map(exercise => {
								return {
									_id: exercise._id ?? null,
									codename: exercise.codename ?? null,
									isPublic: exercise.isPublic ?? null,
									tasks: exercise.tasks ?? null
								}
							})
						};
						res.status(200).json(response);
					}	
				});
			} else {
				res.status(401).json({
					message: "Auth failed"
				});
			}
		} else {
			console.log(err);
			res.status(500).json({
				error: err
			});
		}
	});
});


router.post('/fetchExercises', authInstructor.general, (req, res, next) => {
	Exercise.find({"_id": {$in: req.body}}, req.headers.selectstring, (err, exercises)=>{
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			var exercisesArr = [];
			for(i=0; i < req.body.length; i++){
				exercisesArr[i] = exercises.find(x => x._id == req.body[i]);
			}
			const response = {
				count: req.body.length,
				exercises: exercisesArr
			};
			res.status(200).json(response);
		}
	});
})

router.post('/', authInstructor.general, (req, res, next) => {
	Exercise.find({"codename": req.body.codename}, (err, exercises) =>{
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			if (exercises.length >= 1){
				return res.status(409).json({
					message: "Exercise codename already exists!"
				});
			} else {
				const exercise = new Exercise({
					_id: mongoose.Types.ObjectId(),
					codename: req.body.codename,
					isPublic: req.body.isPublic,
					tasks: req.body.tasks,
					delays: req.body.delays
				});
				exercise
				.save()
				.then(result => {
					User.findOne({"_id": req.userData.userId}, "exercises", (err, user) => {
						if (err){
							return res.status(500).json({
								error: err
							});
						} else {
							if (user) {
								var updateVar = {};
								if (user.exercises.length > 0){
									updateVar = {$push: {"exercises": exercise._id}};
								} else {
									updateVar = {$set: {"exercises": [exercise._id]}};
								}
								User.updateOne({"_id": req.userData.userId}, updateVar, (err)=>{
									if (err){
										res.status(500).json({
											error: err
										});
									} else {
										res.status(201).json({
											_id: exercise._id
										});
									}
								});
							} else {
								res.stauts(401).json({
									message: "Auth failed"
								});
							}
							
						}
					});
					
				})
				.catch(err => {
					console.log(err);
					res.status(500).json({
						error: err
					});
				});
			}
		}
	});
})

router.patch('/:codename', authInstructor.exerciseOwned, (req, res, next) => {
	Exercise.updateOne({"codename": req.params.codename}, {$set: {"tasks": req.body.tasks, "isPublic": req.body.isPublic, "delays": req.body.delays}}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Exercise updated successfully"
			});
		}
	});
});

router.delete('/:exerciseId', authInstructor.exerciseDelete, (req, res, next) => {
	User.find({"prescription": req.params.exerciseId}, "username", (err, users) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (users.length > 0) {
				res.status(409).json({
					message: "Deleting this exercise will affect the prescription of some users",
					users: users.map(user => {
						return {
							username: user.username
						}
					})
				});
			} else {
				Exercise.deleteOne({"_id": req.params.exerciseId}, (err) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						User.updateOne({"_id": req.userData.userId}, {$pull: {"exercises": req.params.exerciseId}}, (err) => {
							if (err){
								res.status(500).json({
									error: err
								});
							} else {
								res.status(200).json({
									message: "Exercise successfully deleted"
								});
							}
						});
					}
				});
			}
		}
	})
	
});

router.delete('/admin/:exerciseId', authAdmin, (req, res, next) => {
	Exercise.deleteOne({"_id": req.params.exerciseId}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: 'Deleted product! This should be used only by an admin.',
			});
		}
	});
	
})

module.exports = router;