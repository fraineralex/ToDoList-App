const Users = require("../models/User");
const Tasks = require("../models/Tasks");
const { Op } = require("sequelize");

//Home controllers
exports.GetHome = async (req, res, next) => {
  let tasks;
  let user;

  if (req.user) {
    const arrayTasks = await Tasks.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    tasks = arrayTasks.map((result) => result.dataValues);

    user = await Users.findOne({where: {id: req.user.id }});
  }

  res.render("client/home", {
    pageTitle: "Home",
    homeActive: true,
    place: "home",
    tasks,
    user,
  });
};

exports.PostCreateTask = (req, res, next) => {
  const content = req.body.Task;

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

exports.PostCompletedTask = async (req, res, next) => {
  let taskId = req.query.taskId;
  let place = req.params.Place;

  const task = await Tasks.findOne({ where: { id: taskId, userId: req.user.id } });

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

exports.PostEditTask = (req, res, next) => {
  const content = req.body.Task;
  const taskId = req.body.TaskId;
  let place = req.params.Place;

  Tasks.update({ content: content }, { where: { id: taskId, userId: req.user.id } })
    .then(() => {
      res.redirect(`/${place}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

//Completed controllers
exports.GetCompletedTasks = async (req, res, next) => {
  const arrayTasks = await Tasks.findAll({
    where: { userId: req.user.id, [Op.and]: [{ isCompleted: true }] },
    order: [["createdAt", "DESC"]],
  });
  const tasks = arrayTasks.map((result) => result.dataValues);

  res.render("client/completed&pending", {
    pageTitle: "Completed tasks",
    completedActive: true,
    tasks,
    completedTask: true,
    place: "completed-tasks",
  });
};

//Pending controllers
exports.GetPendingTasks = async (req, res, next) => {
  const arrayTasks = await Tasks.findAll({
    where: { userId: req.user.id, [Op.and]: [{ isCompleted: { [Op.not]: true } }] },
    order: [["createdAt", "DESC"]],
  });
  const tasks = arrayTasks.map((result) => result.dataValues);

  res.render("client/completed&pending", {
    pageTitle: "Pending tasks",
    pendingActive: true,
    tasks,
    place: "pending-tasks",
  });
};
