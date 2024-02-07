const { objectType, stringArg, nonNull } = require("nexus");

const Validation = require("@app/validations");

const QueryType = objectType({
  name: "Fruits",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("description");
    t.int("amount");
    t.int("limitOfFruitToBeStored");
  },
});

const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.field("findFruit", {
      type: "Response",
      args: { name: nonNull(stringArg()) },
      resolve: async (_, { name }, { dataSources }) => {
        try {
          await new Validation().query({ name });
          return dataSources.FruitServices.findFruit(name);
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });

    t.field("getFruitStorage", {
      type: "Response",
      resolve: (_, args, { dataSources }) => {
        return dataSources.FruitServices.getFruitStorage();
      },
    });
  },
});

module.exports = {
  QueryType,
  Query,
};
