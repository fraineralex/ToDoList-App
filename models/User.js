const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    indexes: [{unique: true}],
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userExpiration: Sequelize.DATE,
});

module.exports = User;