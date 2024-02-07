const Event = require("@domain/factories/event");
const { Check } = require("@infra/utils");

class EventMap {
  //prep and convert database data to domain data
  static toDomain(data) {
    if (Check._isEmpty(data)) {
      return {};
    }

    return new Event(data).update({ id: data._id?.toString() });
  }

  //prep and convert domain data to database data
  static toDatabase(data) {
    if (Check._isEmpty(data)) {
      throw new Error("Missing Data");
    }

    return new Event(data).create();
  }
}

module.exports = EventMap;
