const mongoose = require("mongoose");
require("dotenv").config();

const { Schema } = mongoose;
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongod = new MongoMemoryServer();

const getURL = () => {
  return process.env.MONGO_SRV || mongod.getConnectionString();
};
const openConnection = async () => {
  const uri = await getURL();
  return mongoose.connect(uri);
};

const closeConnection = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const createSchema =
  (name, schemaStructure, options = {}) =>
  (plugin, fields, middlewares) => {
    const testName = name.replace(/ /g, "_").toLowerCase();

    const schema = new Schema(schemaStructure, {
      collection: `fuzzy_searching_test_${testName}`,
      ...options,
    });
    schema.plugin(plugin, {
      fields,
      middlewares,
    });

    return mongoose.model(`Model${testName}`, schema);
  };

const seed = (Model, obj) => {
  const doc = new Model(obj);
  return doc.save();
};

module.exports = {
  openConnection,
  closeConnection,
  createSchema,
  seed,
};
