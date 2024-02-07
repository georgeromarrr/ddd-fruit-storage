require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const Model = require("@infra/database/models");

const { CREATE_FRUIT_MUTATION, FIND_FRUIT_QUERY, STORE_FRUIT_MUTATION, REMOVE_FRUIT_MUTATION, DELETE_FRUIT_MUTATION } = require("../utils/query");

describe("Delete Fruits Test suites", () => {
  let stop, graphql, detachDB, destroyDB;

  const fruitProps = {
    name: "Orange",
    description: "this is a fruit description",
    limitOfFruitToBeStored: 5,
    amount: 1,
  };

  beforeAll(async () => {
    const server = new ApolloServer();
    const testServer = await startTestServer(server);

    stop = testServer.stop;
    graphql = testServer.graphql;
    detachDB = testServer.detachDB;
    destroyDB = testServer.destroyDB;
  });

  afterAll(async () => {
    await destroyDB();
    await detachDB();
    await stop();
  });

  describe("1. Validate Errors of Input Fields", () => {
    test("Fruit name equals to empty string", async () => {
      const fruit = graphql({
        query: DELETE_FRUIT_MUTATION,
        variables: {
          name: "",
          amount: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.deleteFruitFromFruitStorage.status).toBe("error");
      expect(res.data.deleteFruitFromFruitStorage.message).not.toBeEmpty();
      expect(res.data.deleteFruitFromFruitStorage.data).toBeEmpty();
    });

    test("Delete non-existent fruit", async () => {
      const fruit = graphql({
        query: DELETE_FRUIT_MUTATION,
        variables: {
          name: "Not-so-a-fruit",
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.deleteFruitFromFruitStorage.status).toBe("error");
      expect(res.data.deleteFruitFromFruitStorage.message).toEqual("Not-so-a-fruit does not exist or has been removed");
      expect(res.data.deleteFruitFromFruitStorage.data).toBeEmpty();
    });

    describe("- Assert Errors when deleting fruits ", () => {
      let createdFruitData, createdFruitStatus, createdFruitMessage;

      beforeAll(async () => {
        const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
        const fruitResult = await toPromise(createFruit);

        createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
        createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
        createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
      });

      afterAll(async () => {
        await destroyDB();
      });

      describe("- Assert pre-requisites of creation and storage of fruits", () => {
        test("Create Orange fruit, it must be successful", async () => {
          expect(createdFruitStatus).toBe("success");
          expect(createdFruitMessage).not.toBeEmpty();
          expect(createdFruitData).not.toBeEmpty();
        });

        test("Store fruit amount equals to the limit storage", async () => {
          const fruit = graphql({
            query: STORE_FRUIT_MUTATION,
            variables: {
              name: createdFruitData[0].name,
              amount: createdFruitData[0].limitOfFruitToBeStored,
            },
          });
          const res = await toPromise(fruit);

          expect(res.data.storeFruitToFruitStorage.status).toBe("success");
          expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
          expect(res.data.storeFruitToFruitStorage.data).not.toBeEmpty();
        });
      });

      test("Delete fruit when there is an existing stored fruit", async () => {
        const fruit = graphql({
          query: DELETE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.deleteFruitFromFruitStorage.status).toBe("error");
        expect(res.data.deleteFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.deleteFruitFromFruitStorage.data).toBeEmpty();
      });
    });
  });

  describe("2. Delete Fruits on Storage when there is no existing stored fruit", () => {
    let createdFruitData, createdFruitStatus, createdFruitMessage, fruitData;

    beforeAll(async () => {
      const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
      const fruitResult = await toPromise(createFruit);

      createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
      createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
      createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
    });

    describe("- Assert pre-requisites of creation of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Delete fruit in a storage, it must successfuly be deleted", async () => {
        const fruit = graphql({
          query: DELETE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.deleteFruitFromFruitStorage.status).toBe("success");
        expect(res.data.deleteFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.deleteFruitFromFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the fruit is removed in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData).toBeEmpty();
      });
    });

    describe("- Assert Fruit event is created when a fruit is deleted", () => {
      let fruitEvent;

      beforeAll(async () => {
        const fruitModelData = await Model.Event.findOne({ "payload.id": createdFruitData[0].id }).exec();
        fruitEvent = fruitModelData;
      });

      test("Verify Event is saved on the database", async () => {
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to deleteFruit", async () => {
        expect(fruitEvent.event_type).toBe("deleteFruit");
      });

      describe("- Assert Fruit event payload", () => {
        test("Verify the result of payload id is the same as deleted fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });

        test("Verify the result of payload name is the same as inputted", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("name", fruitProps.name);
        });
      });
    });
  });

  describe("3. Delete Fruits on Storage with no existing stored fruit when forceDelete is true", () => {
    let createdFruitData, createdFruitStatus, createdFruitMessage, fruitData;

    beforeAll(async () => {
      const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
      const fruitResult = await toPromise(createFruit);

      createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
      createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
      createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
    });

    describe("- Assert pre-requisites of creation of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Delete fruit in a storage, it must successfuly be deleted", async () => {
        const fruit = graphql({
          query: DELETE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            forceDelete: true,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.deleteFruitFromFruitStorage.status).toBe("success");
        expect(res.data.deleteFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.deleteFruitFromFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the fruit is removed in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData).toBeEmpty();
      });
    });

    describe("- Assert Fruit event is created when a fruit is deleted", () => {
      let fruitEvent;

      beforeAll(async () => {
        const fruitModelData = await Model.Event.findOne({ "payload.id": createdFruitData[0].id }).exec();
        fruitEvent = fruitModelData;
      });

      test("Verify Event is saved on the database", async () => {
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to deleteFruit", async () => {
        expect(fruitEvent.event_type).toBe("deleteFruit");
      });

      describe("- Assert Fruit event payload", () => {
        test("Verify the result of payload id is the same as deleted fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });

        test("Verify the result of payload name is the same as inputted", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("name", fruitProps.name);
        });
      });
    });
  });

  describe("4. Delete Fruits on Storage with an existing stored fruit when forceDelete is true", () => {
    let createdFruitData, createdFruitStatus, createdFruitMessage;

    beforeAll(async () => {
      const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
      const fruitResult = await toPromise(createFruit);

      createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
      createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
      createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
    });

    describe("- Assert pre-requisites of creation and storage of fruits", () => {
      test("Create Orange fruit, it must be successful", async () => {
        expect(createdFruitStatus).toBe("success");
        expect(createdFruitMessage).not.toBeEmpty();
        expect(createdFruitData).not.toBeEmpty();
      });

      test("Store fruit amount equals to the limit storage", async () => {
        const fruit = graphql({
          query: STORE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount: createdFruitData[0].limitOfFruitToBeStored,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.storeFruitToFruitStorage.status).toBe("success");
        expect(res.data.storeFruitToFruitStorage.message).not.toBeEmpty();
        expect(res.data.storeFruitToFruitStorage.data).not.toBeEmpty();
      });
    });

    describe("- Assert execution and verifications", () => {
      test("Delete fruit in a storage, it must successfuly be deleted", async () => {
        const fruit = graphql({
          query: DELETE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            forceDelete: true,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.deleteFruitFromFruitStorage.status).toBe("success");
        expect(res.data.deleteFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.deleteFruitFromFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the fruit is removed in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData).toBeEmpty();
      });
    });

    describe("- Assert Fruit event is created when a fruit is deleted", () => {
      let fruitEvent;

      beforeAll(async () => {
        const fruitModelData = await Model.Event.find({ "payload.id": createdFruitData[0].id }).exec();
        fruitEvent = fruitModelData.filter((data) => data.event_type === "deleteFruit")[0];
      });

      test("Verify Event is saved on the database", async () => {
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to deleteFruit", async () => {
        expect(fruitEvent.event_type).toBe("deleteFruit");
      });

      describe("- Assert Fruit event payload", () => {
        test("Verify the result of payload id is the same as deleted fruit", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("id", createdFruitData[0].id);
        });

        test("Verify the result of payload name is the same as inputted", async () => {
          expect(fruitEvent.payload).not.toBeEmpty();
          expect(fruitEvent.payload).toHaveProperty("name", fruitProps.name);
        });
      });
    });
  });
});
