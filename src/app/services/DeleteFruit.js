const { Result, Check } = require("@infra/utils");
const FruitRepo = require("@infra/repos/fruits");
const FruitServices = require("@domain/services/fruits");

class DeleteFruit {
  async execute({ name, forceDelete }) {
    try {
      const fruit = await new FruitRepo().findFruit({ name });

      if (Check._isEmpty(fruit)) {
        return Result.fail(`${name} does not exist or has been removed`);
      }

      await new FruitServices().validateFruit({
        method: "deleteFruit",
        props: { name, forceDelete },
        data: fruit,
      });

      const deletedFruit = await new FruitServices().deleteFruit({ id: fruit.id, name });

      return Result.verify({
        data: deletedFruit,
        error: `Something went wrong. Unable to remove ${name}`,
        success: `Successfully removed ${name}`,
      });
    } catch (error) {
      console.error(error);
      return Result.fail(error.message);
    }
  }
}

module.exports = DeleteFruit;
