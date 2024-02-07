const EventEntity = require("@domain/entity/Event");

class Event {
  constructor(props) {
    this.Event = new EventEntity(props);
  }

  create() {
    return this.Event._clean();
  }

  update(data) {
    return this.Event._update(data);
  }
}

module.exports = Event;
