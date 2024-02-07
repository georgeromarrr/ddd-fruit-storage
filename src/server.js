require("dotenv").config();

const MongoDB = require("@infra/database");
const ApolloServer = require("@infra/http/ApolloServer");

// server.listen({ port: 3005 }, async () => {
//   await connectToMongoDB();
//   console.log("GraphQL API ready at: http://localhost:3005");
// });
const SERVER_PORT = process.env.SERVER_PORT || "3000";

const SERVER = async () => {
  try {
    await new MongoDB().connect();

    const server = new ApolloServer();

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
