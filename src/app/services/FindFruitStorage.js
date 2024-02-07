const { Result } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");

class FindFruitStorage {
  async execute() {
    try {
      const fruits = await new FruitRepo().findFruitStorage();
      return Result.verify({
        data: fruits,
        success: "Successfully found fruits storage",
        error: "Fruit does not exist or removed!",
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = FindFruitStorage;
