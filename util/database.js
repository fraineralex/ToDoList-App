const Sequelize = require("sequelize");
const path = require("path");

/* Creating a new instance of Sequelize and connecting to the sqlite database */
const sequelize = new Sequelize("sqlite::memory:", {
  dialect: "sqlite",
  storage: path.join(
    path.dirname(require.main.filename),
    "database",
    "toDoList.sqlite"
  ),
});

module.exports = sequelize;
