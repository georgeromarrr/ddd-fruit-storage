const { HttpLink } = require("apollo-link-http");
const { execute } = require("apollo-link");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/ddd-test";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI_TEST);
  } catch (error) {
    throw error;
  }
};

const detachMongoDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw error;
  }
};

const destroyMongoDB = async () => {
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (error) {
    throw error;
  }
};

const startTestServer = async (server) => {
  await connectMongoDB();
  const httpServer = await server.listen({ port: 4000 });

  const link = new HttpLink({
    uri: `http://localhost:${httpServer.port}`,
    fetch,
  });

  const executeOperation = ({ query, variables = {} }) => execute(link, { query, variables });

  const disconnectMongoDB = async () => await detachMongoDB();
  const dropMongoDB = async () => await destroyMongoDB();

  return {
    link,
    stop: () => httpServer.server.close(),
    graphql: executeOperation,
    detachDB: disconnectMongoDB,
    destroyDB: dropMongoDB,
  };
};

module.exports = startTestServer;
