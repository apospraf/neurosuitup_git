const express = require('express');
const router = express.Router();
const authInstructor = require("../middleware/auth-instructor");
const authSubject = require("../middleware/auth-subject");

router.get('/', authSubject, (req, res, next) => {
	res.status(200).json({
		message: 'Scores were fetched'
	});
});

router.post('/', authSubject, (req, res, next) => {
	const score = {
		value: req.body.value,
		exerciseId: req.body.exerciseId
		//sessionId: ...
	};
	res.status(201).json({
		message: 'Score was created',
		score: score
	});
});

router.get('/:scoreId', authSubject, (req, res, next) => {
	res.status(200).json({
		message: 'Score details',
		scoreId: req.params.scoreId
	});
});

router.delete('/:scoreId', (req, res, next) => {
	res.status(200).json({
		message: 'Score deleted. Instructor only',
		scoreId: req.params.scoreId
	});
});

module.exports = router;