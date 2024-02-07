const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class FindFruit {
  async find(data) {
    try {
      const { name } = Map.Fruit.toDatabase(data);

      const fruit = await Model.Fruit.findOne({
        name: { $regex: new RegExp(name, "i") },
      })
        .lean()
        .exec();

      return Map.Fruit.toDomain(fruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = FindFruit;
