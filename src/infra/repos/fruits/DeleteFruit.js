const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class DeleteFruit {
  async delete(data) {
    try {
      const { id } = Map.Fruit.toDatabase(data);

      const deleteFruit = await Model.Fruit.findByIdAndDelete(id);
      return Map.Fruit.toDomain(deleteFruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = DeleteFruit;
