const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class CreateEvent {
  async create(data) {
    try {
      const event = Map.Event.toDatabase(data);
      const newEvent = await new Model.Event(event).save();
      return Map.Event.toDomain(newEvent);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = CreateEvent;
