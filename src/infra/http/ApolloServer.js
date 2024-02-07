const { ApolloServer: Server } = require("apollo-server");
const schema = require("@infra/graphql/schema");
const FruitServices = require("@app/services");

class ApolloServer extends Server {
  constructor() {
    super({
      schema,
      dataSources: () => ({
        FruitServices: new FruitServices(),
      }),
    });
  }
}

module.exports = ApolloServer;
