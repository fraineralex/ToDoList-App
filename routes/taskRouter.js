const express = require("express");

const taskController = require("../controllers/TaskController");

const router = express.Router();

//Home routes
router.get("/home", taskController.GetHome);
router.post("/create-task", taskController.PostCreateTask);
router.post("/completed-task/:Place", taskController.PostCompletedTask);
router.post("/delete-task/:Place", taskController.PostDeleteTask);
router.post("/edit-task/:Place", taskController.PostEditTask);

//Completed routes
router.get("/completed-tasks", taskController.GetCompletedTasks);

//Pending routes
router.get("/pending-tasks", taskController.GetPendingTasks);


module.exports = router;