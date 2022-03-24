/* For mongoose see
https://www.youtube.com/watch?v=WDrU305J1yw&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=6
index 6 to 9
*/
const { Router, response } = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Exercise = require('../models/exercises');
const User = require('../models/users');
const Level = require("../models/levels")

const authSubject = require("../middleware/auth-subject");
const authInstructor = require("../middleware/auth-instructor");
const authAdmin = require('../middleware/auth-admin');

router.get('/:levelId', authInstructor.accessLevel, (req, res, next) => {
	// req.userdata = jwt.decode(req.headers.authorization.split(" ")[1]);
	Level.findOne({"_id": req.params.levelId},
	req.headers.selectstring,
	(err, level) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (level){
				res.status(200).json({
					level: level
				});
			} else {
				res.status(404).json({
					message: "Level not found"
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
				Level.find({$or: [{"_id": {$in: user.levels}}, {"isPublic": true}]},
				req.headers.selectstring,
				(err, levels) => {
					if (err){
						console.log(err);
						res.status(500).json({
							error: err
						});
					} else {
						const response = {
							count: levels.length,
							levels: levels.map(levels => {
								return {
									_id: levels._id ?? null,
									codename: levels.codename ?? null,
									isPublic: levels.isPublic ?? null,
									exercises: levels.exercises ?? null,
                                    delays: levels.delays ?? null,
                                    belt: levels.belt ?? null
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


router.post('/fetchLevels', authInstructor.general, (req, res, next) => {
	Level.find({"_id": {$in: req.body}}, req.headers.selectstring, (err, levels)=>{
		if (err){
			res.status(500).json({
				error: err
			});
		} else {
			var levelsArr = [];
			for(i=0; i < req.body.length; i++){
				levelsArr[i] = levels.find(x => x._id == req.body[i]);
			}
			const response = {
				count: req.body.length,
				levels: levelsArr
			};
			res.status(200).json(response);
		}
	});
})

router.post('/', authInstructor.general, (req, res, next) => {
	Level.find({"codename": req.body.codename}, (err, levels) =>{
		if (err){
			return res.status(500).json({
				error: err
			});
		} else {
			if (levels.length >= 1){
				return res.status(409).json({
					message: "Level codename already exists!"
				});
			} else {
				const level = new Level({
					_id: mongoose.Types.ObjectId(),
					codename: req.body.codename,
					isPublic: req.body.isPublic,
					exercises: req.body.exercises,
					delays: req.body.delays,
                    belt: req.body.belt
				});
				level
				.save()
				.then(result => {
					User.findOne({"_id": req.userData.userId}, "levels", (err, user) => {
						if (err){
							return res.status(500).json({
								error: err
							});
						} else {
							if (user) {
								var updateVar = {};
								if (user.levels.length > 0){
									updateVar = {$push: {"levels": level._id}};
								} else {
									updateVar = {$set: {"levels": [level._id]}};
								}
								User.updateOne({"_id": req.userData.userId}, updateVar, (err)=>{
									if (err){
										res.status(500).json({
											error: err
										});
									} else {
										res.status(201).json({
											_id: level._id
										});
									}
								});
							} else {
								res.status(401).json({
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

router.patch('/:codename', authInstructor.levelOwned, (req, res, next) => {
	Level.updateOne({"codename": req.params.codename}, {$set: {"exercises": req.body.exercises, "isPublic": req.body.isPublic, "delays": req.body.delays}}, (err) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			res.status(200).json({
				message: "Level updated successfully"
			});
		}
	});
});

router.delete('/:levelId', authInstructor.levelDelete, (req, res, next) => {
	User.find({"prescription": req.params.levelId}, "username", (err, users) => {
		if (err) {
			res.status(500).json({
				error: err
			});
		} else {
			if (users.length > 0) {
				res.status(409).json({
					message: "Deleting this level will affect the prescription of some users",
					users: users.map(user => {
						return {
							username: user.username
						}
					})
				});
			} else {
				Level.deleteOne({"_id": req.params.levelId}, (err) => {
					if (err) {
						res.status(500).json({
							error: err
						});
					} else {
						User.updateOne({"_id": req.userData.userId}, {$pull: {"levels": req.params.levelId}}, (err) => {
							if (err){
								res.status(500).json({
									error: err
								});
							} else {
								res.status(200).json({
									message: "Level successfully deleted"
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