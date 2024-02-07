const { Check } = require("@infra/utils");
const CreateEvent = require("./CreateEvent");

class EventServices {
  constructor(event) {
    this.CreateEvent = new CreateEvent(event);

    if (Check._isEmpty(event)) {
      throw new Error(`Missing event data`);
    }
  }

  createEvent(props) {
    return this.CreateEvent.execute(props);
  }
}

module.exports = EventServices;
