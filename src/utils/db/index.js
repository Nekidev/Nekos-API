const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  `postgres://${process.env.POSTRGES_USERNAME}:${process.env.POSTRGES_PASSWORD}@${process.env.POSTRGES_HOST}:${process.env.POSTRGES_PORT}/${process.env.POSTRGES_DB_NAME}`
);
sequelize.authenticate();

export default sequelize;
