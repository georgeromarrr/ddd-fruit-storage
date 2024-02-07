require("../utils/toBeEmpty");

const ApolloServer = require("@infra/http/ApolloServer");
const startTestServer = require("../helpers");
const { toPromise } = require("apollo-link");

const Model = require("@infra/database/models");

const { CREATE_FRUIT_MUTATION, FIND_FRUIT_QUERY } = require("../utils/query");

describe("Create Fruit Test suites", () => {
  let stop, graphql, detachDB, destroyDB;

  const fruitProps = {
    name: "Orange",
    description: "this is a fruit description",
    limitOfFruitToBeStored: 5,
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
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "",
          description: "this is a fruit description",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).toEqual("Fruit name is required");
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description equals to empty string ", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).toEqual("Fruit description is required");
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Missing Fruit description", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).toEqual("Fruit description is required");
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Missing Fruit limits", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this is a fruit description",
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).toEqual("Limit of fruit to be Stored is required");
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit name is less than 3 characters", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Or",
          description: "this is a fruit description",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description is less than 5 characters", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit description is more than 30 characters", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this is a fruit with a very long description",
          limitOfFruitToBeStored: 100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });

    test("Fruit limits is equals to a negative value", async () => {
      const fruit = graphql({
        query: CREATE_FRUIT_MUTATION,
        variables: {
          name: "Orange",
          description: "this is a fruit description",
          limitOfFruitToBeStored: -100,
        },
      });
      const res = await toPromise(fruit);

      expect(res.data.createFruitForFruitStorage.status).toBe("error");
      expect(res.data.createFruitForFruitStorage.message).not.toBeEmpty();
      expect(res.data.createFruitForFruitStorage.data).toBeEmpty();
    });
  });

  describe("2. Create Fruits for storage", () => {
    let findFruitData, findFruitStatus, findFruitMessage;

    beforeEach(async () => {
      const findFruit = graphql({ query: FIND_FRUIT_QUERY, variables: { name: fruitProps.name } });
      const fruitResult = await toPromise(findFruit);

      findFruitData = fruitResult.data.findFruit.data;
      findFruitStatus = fruitResult.data.findFruit.status;
      findFruitMessage = fruitResult.data.findFruit.message;
    });

    describe("- Assert Fruit to be created is not yet existed", () => {
      test("Find Orange fruit, it must NOT be found and returns an error", async () => {
        expect(findFruitStatus).toBe("error");
        expect(findFruitMessage).not.toBeEmpty();
        expect(findFruitData).toBeEmpty();
      });

      describe("- Assert Fruit Creation", () => {
        let createdFruitData, createdFruitStatus, createdFruitMessage;

        beforeAll(async () => {
          const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
          const fruitResult = await toPromise(createFruit);

          createdFruitData = fruitResult.data.createFruitForFruitStorage.data;
          createdFruitStatus = fruitResult.data.createFruitForFruitStorage.status;
          createdFruitMessage = fruitResult.data.createFruitForFruitStorage.message;
        });

        test("Create Orange fruit, it must be successful", async () => {
          expect(createdFruitStatus).toBe("success");
          expect(createdFruitMessage).not.toBeEmpty();
          expect(createdFruitData).not.toBeEmpty();
        });

        test("Verify the result of fruit name is the same as inputted", async () => {
          expect(createdFruitData).not.toBeEmpty();
          expect(createdFruitData[0]).toHaveProperty("name", fruitProps.name);
        });

        test("Verify the result of fruit description is the same as inputted", async () => {
          expect(createdFruitData).not.toBeEmpty();
          expect(createdFruitData[0]).toHaveProperty("description", fruitProps.description);
        });

        test("Verify the result of fruit limitOfFruitToBeStored is the same as inputted", async () => {
          expect(createdFruitData).not.toBeEmpty();
          expect(createdFruitData[0]).toHaveProperty("limitOfFruitToBeStored", fruitProps.limitOfFruitToBeStored);
        });

        describe("- Assert Fruit event is created", () => {
          let fruitData;

          beforeAll(async () => {
            const fruitModelData = await Model.Fruit.findById(createdFruitData[0].id).exec();
            fruitData = fruitModelData;
          });

          test("Verify Fruit event created_id is available", async () => {
            expect(fruitData.event.create_id).not.toBeNull();
          });

          test("Verify Event is saved on the database", async () => {
            const fruitEvent = await Model.Event.findById(fruitData.event.create_id).exec();
            expect(fruitEvent).not.toBeEmpty();
          });

          test("Verify Event type is equals to createFruit", async () => {
            const fruitEvent = await Model.Event.findById(fruitData.event.create_id).exec();
            expect(fruitEvent.event_type).toBe("createFruit");
          });

          describe("- Assert Fruit event payload", () => {
            let fruitEvent;

            beforeAll(async () => {
              const fruitModelData = await Model.Event.findById(fruitData.event.create_id).exec();
              console.log("eve", fruitModelData);
              fruitEvent = fruitModelData;
            });

            test("Verify the result of payload name is the same as inputted", async () => {
              expect(fruitEvent.payload).not.toBeEmpty();
              expect(fruitEvent.payload).toHaveProperty("name", fruitProps.name);
            });

            test("Verify the result of payload name is the same as inputted", async () => {
              expect(fruitEvent.payload).not.toBeEmpty();
              expect(fruitEvent.payload).toHaveProperty("description", fruitProps.description);
            });

            test("Verify the result of payload limitOfFruitToBeStored is the same as inputted", async () => {
              expect(fruitEvent.payload).not.toBeEmpty();
              expect(fruitEvent.payload).toHaveProperty("limitOfFruitToBeStored", fruitProps.limitOfFruitToBeStored);
            });
          });
        });
      });

      test("Find Orange fruit, it must be found and returns fruit data", async () => {
        expect(findFruitStatus).toBe("success");
        expect(findFruitMessage).not.toBeEmpty();
        expect(findFruitData).not.toBeEmpty();

        expect(findFruitData[0].name).toEqual(fruitProps.name);
      });
    });

    describe("- Assert Fruit to be created is already existed", () => {
      test("Find Orange fruit, it must be found and returns fruit data", async () => {
        expect(findFruitStatus).toBe("success");
        expect(findFruitMessage).not.toBeEmpty();
        expect(findFruitData).not.toBeEmpty();

        expect(findFruitData[0].name).toEqual(fruitProps.name);
      });

      test.failing("Create Orange Fruit Again, creation must NOT be successful", async () => {
        const createFruit = graphql({ query: CREATE_FRUIT_MUTATION, variables: fruitProps });
        const fruitResult = await toPromise(createFruit);

        expect(fruitResult.data.createFruitForFruitStorage.status).toBe("success");
        expect(fruitResult.data.createFruitForFruitStorage.message).not.toBeEmpty();

        Object.entries(fruitProps).forEach(([key, value]) => {
          expect(fruitResult.data.createFruitForFruitStorage.data[0][key]).toEqual(value);
        });
      });
    });
  });
});
