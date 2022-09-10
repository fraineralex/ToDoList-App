/* This is importing the Sequelize library and the database connection. */
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* Creating Records table in the database. */
const Records = sequelize.define("records", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  action: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  actionDate: {
    type: Sequelize.STRING,
    allowNull: false,
  },  
});

module.exports = Records;