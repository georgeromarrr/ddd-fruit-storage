const { Result } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");

class FindFruit {
  async execute(name) {
    try {
      const fruit = await new FruitRepo().findFruit({ name });

      if (fruit.name !== name) {
        return Result.fail(`${name} does not exist or has been removed`);
      }

      return Result.verify({
        data: fruit,
        success: `Successfully found ${name}`,
        error: "Fruit does not exist or removed!",
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = FindFruit;
