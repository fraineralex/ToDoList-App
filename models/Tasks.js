/* Importing the Sequelize library and the database connection. */
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* Creating Tasks table in the database. */
const Tasks = sequelize.define("tasks", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isCompleted: {
    type: Sequelize.BOOLEAN,
  },
});

module.exports = Tasks;
