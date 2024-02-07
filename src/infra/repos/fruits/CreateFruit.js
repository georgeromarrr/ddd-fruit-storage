const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class CreateFruit {
  async create(data) {
    try {
      const fruit = Map.Fruit.toDatabase(data);
      const saveFruit = await new Model.Fruit(fruit).save();
      return Map.Fruit.toDomain(saveFruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = CreateFruit;
