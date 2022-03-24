// Import tools
const express = require("express");
const app = express();
const morgan = require("morgan");	// logging

// Import routes
const levelsRoutes = require("./api/routes/levels");
const exercisesRoutes = require("./api/routes/exercises");
const scoresRoutes = require("./api/routes/scores");
const usersRoutes = require("./api/routes/users");
const posesRoutes = require("./api/routes/poses");
const tasksRoutes = require("./api/routes/tasks");
const mongoose = require("mongoose");
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');



// Tools
app.use(morgan("dev"));
app.use(express.urlencoded({
	extended: true
}));
app.use(express.json());

// CORS errors security measure from browser (client). Unity may not require this (like POSTMAN).
// So it isn't really a protection mechanism
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});
// mongoose.connect(process.env.MONGO_URI);
mongoose.connect("mongodb+srv://neurosuitupUser:XgAwqKwAGMcGwh6mYU9BDUfwP@cluster0.trk73.mongodb.net/cluster0");

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/levels", levelsRoutes);
// Exercises
app.use("/exercises", exercisesRoutes);
// Scores
app.use("/scores", scoresRoutes);
// Dummy user
app.use("/users", usersRoutes);
// Poses
app.use("/poses", posesRoutes);
// Tasks
app.use("/tasks", tasksRoutes);

// Route not found
app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});

// Error handling
app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	})
});

module.exports = app;