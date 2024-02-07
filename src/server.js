require("dotenv").config();

const CronJobScheduler = require("@domain/services/cron/CronJob");
const NewFruitEvent = require("@app/services/cron/CreatedFruits");
const MongoDB = require("@infra/database");
const ApolloServer = require("@infra/http/ApolloServer");
const CronServices = require("@app/services/cron");

const SERVER_PORT = process.env.SERVER_PORT || "3000";

const SERVER = async () => {
  try {
    await new MongoDB().connect();

    const server = new ApolloServer();

    new CronJobScheduler(async () => {
      try {
        await new CronServices().process();
      } catch (error) {
        console.error("Error occurred while retrieving events:", error);
      }
    });

    server.listen({ port: SERVER_PORT }, (err) => {
      if (err) {
        throw err;
      }
      console.log(`🚀 Query endpoint ready at port ${SERVER_PORT} 🚀`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

SERVER();
