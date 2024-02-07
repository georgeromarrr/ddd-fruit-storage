const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class GetAllEvent {
  async findAll(filter) {
    try {
      const events = await Model.Event.find(filter).lean().exec();
      return events.map((event) => Map.Event.toDomain(event));
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = GetAllEvent;
