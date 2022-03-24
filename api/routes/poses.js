/* For mongoose see
https://www.youtube.com/watch?v=WDrU305J1yw&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=6
index 6 to 9
*/
const { Router, response } = require('express');
const express = require('express');
const router = express.Router();
const authInstructor = require("../middleware/auth-instructor");
const authSubject = require("../middleware/auth-subject");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const exercise = require('../models/exercises');
const User = require('../models/users');
const Pose = require("../models/poses");
const Task = require("../models/tasks");

router.get('/codenameExists/:codename', authInstructor.general, (req, res, next) =>{

	Pose.findOne({"username": req.params.codename}, (err, pose) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			if (pose){
				res.status(200).json({
					exists: true
				});
			} else {
				res.status(200).json({
					exists: false
				});
			}
			
		}
	});
})

router.get('/', authInstructor.general, (req, res, next) => {
    User.findOne({"_id": req.userData.userId}, (err, user) => {
		if (!err){
			Pose.find({$or: [{"_id": {$in: user.poses}}, {"isPublic": true}]},
			req.headers.selectstring,
			(err, poses) => {
				if (err) {
					console.log(err);
					res.status(500).json({
						error: err
					});
				} else {
					const response = {
						count: poses.length,
						poses: poses.map(pose => {
							return {
								_id: pose._id,
								codename: pose.codename ?? null,
								isPublic: pose.isPublic ?? null,
								angles: pose.angles ?? null
							}
						})
					};
					res.status(200).json(response);
				}
			});
		} else {
			console.log(err);

			res.status(500).json({
				error: err
			});
		}
	});
});

router.post('/fetchPoses', authInstructor.general, (req, res, next) => {
	Pose.find({"_id": {$in: req.body}}, req.headers.selectstring, (err, poses)=>{
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			var posesArr = [];
			for(i=0; i < req.body.length; i++){
				posesArr[i] = poses.find(x => x._id == req.body[i]);
			}
			const response = {
				count: req.body.length,
				poses: posesArr
			};
			res.status(200).json(response);
		}
	});
})

router.post('/', authInstructor.general, (req, res, next) => {
	Pose.find({"codename": req.body.codename}, (err, poses) =>{
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			if (poses.length >= 1){
				return res.status(409).json({
					message: "Pose codename already exists!"
				});
			} else {
				const pose = new Pose({
					_id: mongoose.Types.ObjectId(),
					codename: req.body.codename,
					isPublic: req.body.isPublic,
					angles: req.body.angles
				});
				pose
				.save()
				.then(result => {
					User.findOne({"_id": req.userData.userId}, (err, user) => {
						if (err){
							res.status(500).json({
								error: err
							});
						} else {
							if (!user){
								res.status(404).json({
									message: "User not found"
								});
							} else {
								var updateVar = {};
								if (user.poses === null){
									updateVar = {$set: {"poses": [pose._id]}};
								} else {
									updateVar = {$push: {"poses": pose._id}};
								}
								User.updateOne({"_id": req.userData.userId}, updateVar, (err, result) => {
									if (err) {
										res.status(500).json({
											error: err
										});
									} else {
										res.status(201).json({
											_id: pose._id
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
});

router.get('/:poseId', authInstructor.general, (req, res, next) => {
	Pose.findOne({"_id": req.params.poseId}, req.headers.selectstring, (err, pose) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			if (pose){
				res.status(200).json({
					pose: pose
				});
			} else {
				res.status(404).json({
					message: "Pose not found"
				});
			}	
		}
	});
});

router.patch('/:codename', authInstructor.poseOwned, (req, res, next) => {
	Pose.updateOne({"codename": req.params.codename}, {$set: {"angles": req.body.angles, "isPublic": req.body.isPublic}}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Pose updated successfully"
			});
		}
	});
});

router.patch('/copyPose/:poseId', authInstructor.general, (req, res, next) =>{
	User.findOne({"_id": req.userData.userId}, (err, user) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (user.poses.includes(req.params.poseId)) {
				res.status(409).json({
					message: "Pose already owned"
				});
			} else {
				Pose.findOne({"_id": req.params.poseId}, (err, pose) => {
					if (err){
						res.status(500).json({
							error: err
						});
					} else {
						if (!pose) {
							res.status(404).json({
								message: "Pose not found"
							});
						} else {
							if (!pose.isPublic) {
								res.status(403).json({
									message: "Pose is not owned, thus cannot be copied"
								});
							} else {
								const copiedPose = new Pose({
									_id: mongoose.Types.ObjectId(),
									codename: pose.codename + "_" + req.userData.userId,
									isPublic: false,
									angles: pose.angles
								});
								copiedPose
								.save()
								.then(result => {
									var updateVar = {};
									if (user.poses === null){
										updateVar = {$set: {"poses": [copiedPose._id]}};
									} else {
										updateVar = {$push: {"poses": copiedPose._id}};
									}
									User.updateOne({"_id": req.userData.userId}, updateVar, (err) => {
										if (err) {
											res.status(500).json({
												error: err
											});
										} else {
											res.status(201).json({
												_id: copiedPose._id
											});
										}
									});
								})
								.catch(err => {
									console.log(err);
									res.status(500).json({
										error: err
									});
								});;
								
							}
						}
					}
				})	
			}		
		}
	})
})

router.delete('/:poseId', authInstructor.poseDelete, (req, res, next) => {
	Task.find({"poses": req.params.poseId}, "codename", (err, tasks) => {
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			if (tasks.length > 0) {
				res.status(409).json({
					message: "Deleting this pose will affect some tasks",
					tasks: tasks.map(task => {
						return {
							codename: task.codename
						}
					})
				});
			} else {
				Pose.deleteOne({"_id": req.params.poseId}, (err) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						User.updateOne({"_id": req.userData.userId}, {$pull :{"poses": req.params.poseId}}, (err) =>{
							if (err){
								res.status(500).json({
									error: err
								});
							} else {
								res.status(200).json({
									message: "Pose successfully deleted!"
								});
							}
						})
						
					}
				});	
			}
		}
	})
});

module.exports = router;