const mongoose = require("mongoose");

const { dbName, mongoUrl } = require("./env");

async function connectDatabase() {
  await mongoose.connect(mongoUrl, {
    dbName,
  });
}

module.exports = {
  connectDatabase,
};
