const { objectType, stringArg, nonNull, intArg, booleanArg, nullable } = require("nexus");

const Validation = require("@app/validations");

const ResponseType = objectType({
  name: "Response",
  definition(t) {
    t.string("status");
    t.string("message");
    t.list.field("data", { type: "Fruits" });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("createFruitForFruitStorage", {
      type: "Response",
      args: {
        name: nonNull(stringArg()),
        description: nullable(stringArg()),
        limitOfFruitToBeStored: nullable(intArg()),
      },
      resolve: async (_, args, { dataSources }) => {
        try {
          await new Validation().mutation(args, { isCreate: true });
          return dataSources.FruitServices.createFruitForFruitStorage(args);
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });

    t.field("storeFruitToFruitStorage", {
      type: "Response",
      args: { name: nonNull(stringArg()), amount: nullable(intArg()) },
      resolve: async (_, args, { dataSources }) => {
        try {
          await new Validation().mutation(args, { hasAmount: true });
          return dataSources.FruitServices.storeFruitToFruitStorage(args);
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });

    t.field("removeFruitFromFruitStorage", {
      type: "Response",
      args: { name: nonNull(stringArg()), amount: nullable(intArg()) },
      resolve: async (_, args, { dataSources }) => {
        try {
          await new Validation().mutation(args, { hasAmount: true });
          return dataSources.FruitServices.removeFruitFromFruitStorage(args);
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });

    t.field("updateFruitForFruitStorage", {
      type: "Response",
      args: {
        name: nonNull(stringArg()),
        description: nullable(stringArg()),
        limitOfFruitToBeStored: nullable(intArg()),
      },
      resolve: async (_, args, { dataSources }) => {
        try {
          await new Validation().mutation(args, { isUpdate: true });
          return dataSources.FruitServices.updateFruitForFruitStorage(args);
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });

    t.field("deleteFruitFromFruitStorage", {
      type: "Response",
      args: { name: nonNull(stringArg()), forceDelete: nullable(booleanArg()) },
      resolve: async (_, { name, forceDelete = false }, { dataSources }) => {
        try {
          await new Validation().mutation({
            name,
            forceDelete,
          });
          return dataSources.FruitServices.deleteFruitFromFruitStorage({
            name,
            forceDelete,
          });
        } catch (error) {
          console.error(error);
          return {
            status: "error",
            message: error.errors[0],
          };
        }
      },
    });
  },
});

module.exports = {
  ResponseType,
  Mutation,
};
