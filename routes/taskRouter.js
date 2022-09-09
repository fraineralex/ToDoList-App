const express = require("express");

const taskController = require("../controllers/TaskController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

//Home routes
router.get("/home", taskController.GetHome);
router.post("/create-task",isAuth, taskController.PostCreateTask);
router.post("/completed-task/:Place",isAuth, taskController.PostCompletedTask);
router.post("/delete-task/:Place",isAuth, taskController.PostDeleteTask);
router.post("/edit-task/:Place",isAuth, taskController.PostEditTask);

//Completed routes
router.get("/completed-tasks",isAuth, taskController.GetCompletedTasks);

//Pending routes
router.get("/pending-tasks",isAuth, taskController.GetPendingTasks);


module.exports = router;