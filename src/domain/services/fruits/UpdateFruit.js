const FruitRepo = require("@infra/repos/fruits");
const EventServices = require("@domain/services/events");
const Fruit = require("@domain/factories/fruit");

class UpdateFruit {
  async execute(event_type, payload) {
    try {
      const event_id = {
        createFruit: "create_id",
        updateFruit: "update_id",
        storeFruit: "storage_id",
        removeFruit: "storage_id",
      };

      const fruit = new Fruit(payload);

      const newEvent = await new EventServices({
        event_type,
      }).createEvent(fruit.create());

      return await new FruitRepo().updateFruit(
        fruit.event({ [event_id[event_type]]: newEvent.id })
      );
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = UpdateFruit;
