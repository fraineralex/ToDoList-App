const Users = require("../models/User");
const Tasks = require("../models/Tasks");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

//Home controllers
/* Finding all the tasks that belong to the user and then mapping them to the tasks
 variable and Rendering the home page. */
exports.GetHome = async (req, res, next) => {
  let tasks;
  let user = { dataValues: "" };

  if (req.user) {
    const arrayTasks = await Tasks.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    tasks = arrayTasks.map((result) => result.dataValues);

    user = await Users.findOne({ where: { id: req.user.id } });
  }

  res.render("client/home", {
    pageTitle: "Home",
    homeActive: true,
    place: "home",
    tasks,
    user: user.dataValues,
  });
};

/* This is a function that create a new task in the database and rending to home page*/
exports.PostCreateTask = (req, res, next) => {
  const content = req.body.Task;

  /* This is a validation that is being done to make sure that the user is not submitting an empty task. */
  if (!content) {
    req.flash("errors", "Task content cannot be empty, please try again");
    return res.redirect("/home");
  }

  Tasks.create({
    content: content,
    userId: req.user.id,
  })
    .then(() => {
      res.redirect("/home");
    })
    .catch((err) => {
      console.log(err);
    });
};

/* This is a function that is being used to update to true or false the isCompleted field in the Tasks database */
exports.PostCompletedTask = async (req, res, next) => {
  let taskId = req.query.taskId;
  let place = req.params.Place;

  const task = await Tasks.findOne({
    where: { id: taskId, userId: req.user.id },
  });

  const isCompleted = task.dataValues.isCompleted;

  if (!isCompleted) {
    Tasks.update({ isCompleted: true }, { where: { id: taskId } })
      .then(() => {
        res.redirect(`/${place}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Tasks.update({ isCompleted: false }, { where: { id: taskId } })
      .then(() => {
        res.redirect(`/${place}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

/* This is a function that is being used to delete a task from the database. */
exports.PostDeleteTask = async (req, res, next) => {
  const taskId = req.body.TaskId;
  let place = req.params.Place;

  Tasks.destroy({ where: { id: taskId, userId: req.user.id } })
    .then(() => {
      res.redirect(`/${place}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

/* This is a function that is being used to update the content of a task in the database. */
exports.PostEditTask = (req, res, next) => {
  const content = req.body.Task;
  const taskId = req.body.TaskId;
  let place = req.params.Place;

  /* This is a validation that is being done to make sure that the user is not submitting an empty task. */
  if (!content) {
    req.flash("errors", "Task content cannot be empty, please try again");
    return res.redirect(`/${place}`);
  }

  Tasks.update(
    { content: content },
    { where: { id: taskId, userId: req.user.id } }
  )
    .then(() => {
      res.redirect(`/${place}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

//Completed controllers
/*--------------------------*/

/* This is a function that is being used to find all the tasks that are completed and then mapping them
to the tasks variable and then rendering the completed tasks page. */
exports.GetCompletedTasks = async (req, res, next) => {
  const arrayTasks = await Tasks.findAll({
    where: { userId: req.user.id, [Op.and]: [{ isCompleted: true }] },
    order: [["createdAt", "DESC"]],
  });
  const tasks = arrayTasks.map((result) => result.dataValues);

  const user = await Users.findOne({
    where: { id: req.user.id },
  });

  res.render("client/completed&pending", {
    pageTitle: "Completed tasks",
    completedActive: true,
    tasks,
    completedTask: true,
    place: "completed-tasks",
    user: user.dataValues,
  });
};

//Pending controllers
/*-----------------------*/
/* This is a function that is being used to find all the tasks that are not completed and then mapping
them to the tasks variable and then rendering the pending tasks page. */
exports.GetPendingTasks = async (req, res, next) => {
  const arrayTasks = await Tasks.findAll({
    where: {
      userId: req.user.id,
      [Op.and]: [{ isCompleted: { [Op.not]: true } }],
    },
    order: [["createdAt", "DESC"]],
  });
  const tasks = arrayTasks.map((result) => result.dataValues);

  const user = await Users.findOne({
    where: { id: req.user.id },
  });

  res.render("client/completed&pending", {
    pageTitle: "Pending tasks",
    pendingActive: true,
    tasks,
    place: "pending-tasks",
    user: user.dataValues,
  });
};

//User information
/*-------------------------*/
/* This is a function that is being used to find the user information and then rendering the user
information page. */
exports.GetUserInformation = async (req, res, next) => {
  const user = await Users.findOne({
    where: { id: req.user.id },
  });

  let defaultPassword;
/* Comparing the password that the user has with the default password. */
  defaultPassword = await bcrypt.compare(
    "default123",
    user.dataValues.password
  );

  res.render("client/user-information", {
    pageTitle: "User information",
    userActive: true,
    user: user.dataValues,
    defaultPassword,
  });
};
