require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const Model = require("@infra/database/models");

const { CREATE_FRUIT_MUTATION, FIND_FRUIT_QUERY, STORE_FRUIT_MUTATION, REMOVE_FRUIT_MUTATION } = require("../utils/query");

describe("Remove Fruits Test suites", () => {
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
    test("Remove Fruit amount to non-existent fruit", async () => {
      const fruit = graphql({
        query: REMOVE_FRUIT_MUTATION,
        variables: {
          name: "Not-so-a-fruit",
          amount: 10,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.removeFruitFromFruitStorage.status).toBe("error");
      expect(res.data.removeFruitFromFruitStorage.message).toEqual("Not-so-a-fruit does not exist or has been removed");
      expect(res.data.removeFruitFromFruitStorage.data).toBeEmpty();
    });

    test("Fruit name equals to empty string", async () => {
      const fruit = graphql({
        query: REMOVE_FRUIT_MUTATION,
        variables: {
          name: "",
          amount: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.removeFruitFromFruitStorage.status).toBe("error");
      expect(res.data.removeFruitFromFruitStorage.message).not.toBeEmpty();
      expect(res.data.removeFruitFromFruitStorage.data).toBeEmpty();
    });

    test("Missing Fruit amount", async () => {
      const fruit = graphql({
        query: REMOVE_FRUIT_MUTATION,
        variables: {
          name: "",
          amount: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.removeFruitFromFruitStorage.status).toBe("error");
      expect(res.data.removeFruitFromFruitStorage.message).not.toBeEmpty();
      expect(res.data.removeFruitFromFruitStorage.data).toBeEmpty();
    });

    describe("- Assert Errors when removing fruits ", () => {
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

      test("Remove fruit amount greater than the storage limit", async () => {
        const fruit = graphql({
          query: REMOVE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount: createdFruitData[0].limitOfFruitToBeStored + 1,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.removeFruitFromFruitStorage.status).toBe("error");
        expect(res.data.removeFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.removeFruitFromFruitStorage.data).toBeEmpty();
      });
    });

    describe("- Assert Errors when removing fruits with empty stored amount ", () => {
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

      describe("- Assert pre-requisites of creation", () => {
        test("Create Orange fruit, it must be successful", async () => {
          expect(createdFruitStatus).toBe("success");
          expect(createdFruitMessage).not.toBeEmpty();
          expect(createdFruitData).not.toBeEmpty();
        });
      });

      test("Remove fruit amount greater than the storage limit", async () => {
        const fruit = graphql({
          query: REMOVE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount: createdFruitData[0].limitOfFruitToBeStored + 1,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.removeFruitFromFruitStorage.status).toBe("error");
        expect(res.data.removeFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.removeFruitFromFruitStorage.data).toBeEmpty();
      });
    });
  });

  describe("2. Remove Fruits on Storage", () => {
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
      test.each([{ amount: 1 }, { amount: 2 }, { amount: 1 }])("Remove $amount fruit in a storage, it must successfuly be removed", async ({ amount }) => {
        const fruit = graphql({
          query: REMOVE_FRUIT_MUTATION,
          variables: {
            name: createdFruitData[0].name,
            amount,
          },
        });
        const res = await toPromise(fruit);

        expect(res.data.removeFruitFromFruitStorage.status).toBe("success");
        expect(res.data.removeFruitFromFruitStorage.message).not.toBeEmpty();
        expect(res.data.removeFruitFromFruitStorage.data).not.toBeEmpty();
      });

      test("Verify the total remained amount in the database", async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        expect(fruitModelData.amount).toEqual(1);
      });
    });

    describe("- Assert Fruit event is created when a fruit is removed", () => {
      let fruitData;

      beforeAll(async () => {
        const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
        fruitData = fruitModelData;
      });

      test("Fruit event storage_id is available", async () => {
        expect(fruitData.event.storage_id).not.toBeNull();
      });

      test("Verify Event is saved on the database", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.storage_id).exec();
        expect(fruitEvent).not.toBeEmpty();
      });

      test("Verify Event type is equals to removeFruit", async () => {
        const fruitEvent = await Model.Event.findById(fruitData.event.storage_id).exec();
        expect(fruitEvent.event_type).toBe("removeFruit");
      });

      describe("- Assert Fruit event payload", () => {
        let fruitEvent;

        beforeAll(async () => {
          const fruitModelData = await Model.Event.findById(fruitData.event.storage_id).exec();
          fruitEvent = fruitModelData;
        });

        test("Verify the result of payload id is the same as removed fruit", async () => {
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
