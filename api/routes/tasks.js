/* For mongoose see
https://www.youtube.com/watch?v=WDrU305J1yw&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=6
index 6 to 9
*/
const { Router, response } = require('express');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Exercise = require("../models/exercises");
const Task = require('../models/tasks');
const User = require('../models/users');

const authSubject = require("../middleware/auth-subject");
const authInstructor = require("../middleware/auth-instructor");
const authAdmin = require('../middleware/auth-admin');
const users = require('../models/users');

router.get('/', authInstructor.general, (req, res, next) => {
    User.findOne({"_id": req.userData.userId}, (err, user) => {
		if (!err){
			if (user){			
				Task.find({$or: [{"_id": {$in: user.tasks}}, {"isPublic": true}]},
				req.headers.selectstring,
				(err, tasks) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						const response = {
							count: tasks.length,
							tasks: tasks.map(task => {
								return {
									_id: task._id ?? null,
									codename: task.codename ?? null,
									isPublic: task.isPublic ?? null,
									difficulty: task.difficulty ?? null,
									poses: task.poses ?? null
								};
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
			res.status(500).json({
				error: err
			});
		}
	});
});

router.get('/:taskId', authInstructor.accessTask, (req, res, next) => {
	// req.userdata = jwt.decode(req.headers.authorization.split(" ")[1]);
	Task.findOne({"_id": req.params.taskId},
	req.headers.selectstring,
	(err, task) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (task){
				res.status(200).json({
					task: task
				});
			} else {
				res.status(404).json({
					message: "Task not found"
				});
			}	
		}
	});	
});


router.post('/fetchTasks', authInstructor.general, (req, res, next) => {
	Task.find({"_id": {$in: req.body}}, req.headers.selectstring, (err, tasks) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			var tasksArr = [];
			for(i=0; i < req.body.length; i++){
				tasksArr[i] = tasks.find(x => x._id == req.body[i]);
			}
			const response = {
				count: req.body.length,
				tasks: tasksArr
			};
			res.status(200).json(response);
		}
	});
})

router.post('/', authInstructor.general, (req, res, next) => {
	Task.find({"codename": req.body.codename}, (err, tasks) =>{
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			if (tasks.length >= 1){
				return res.status(409).json({
					message: "Task codename already exists!"
				});
			} else {
				const task = new Task({
					_id: mongoose.Types.ObjectId(),
					codename: req.body.codename,
					isPublic: req.body.isPublic,
					difficulty: req.body.difficulty,
					poses: req.body.poses
				});
				task
				.save()
				.then(result => {
					User.findOne({"_id": req.userData.userId}, (err, user) => {
						if (err){
							res.status(500).json({
								error: err
							});
						} else {
							if (!user){
								res.status(401).json({
									message: "Auth failed"
								});
							} else {
								var updateVar = {};
								if (user.tasks === null){
									updateVar = {$set: {"tasks": [task._id]}};
								} else {
									updateVar = {$push: {"tasks": task._id}};
								}
								User.updateOne({"_id": req.userData.userId}, updateVar, (err, result) => {
									if (err) {
										res.status(500).json({
											error: err
										});
									} else {
										res.status(201).json({
											_id: task._id
										});
									}
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

router.patch('/:codename', authInstructor.taskOwned, (req, res, next) => {
	Task.updateOne({"codename": req.params.codename}, {$set: {"poses": req.body.poses, "isPublic": req.body.isPublic, "difficulty": req.body.difficulty}}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Task updated successfully"
			});
		}
	});
});

router.delete('/:taskId', authInstructor.taskDelete, (req, res, next) => {
	Exercise.find({"tasks": req.params.taskId}, "codename", (err, exercises) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			if (exercises.length > 0){
				res.status(409).json({
					message: "Deleting this task will affect some exercises",
					exercises: exercises.map(exercise =>{
						return {
							codename: exercise.codename
						}
					})
				});
			} else {
				Task.deleteOne({"_id": req.params.taskId}, (err) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						res.status(200).json({
							message: 'Task deleted',
						});
					}
				});
			}
		}
	});
});

router.delete('/admin/:taskId', authAdmin, (req, res, next) => {
	Exercise.deleteOne({"_id": req.params.taskId}, (err) => {
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