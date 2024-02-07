const EventIdEntity = require("@domain/entity/EventId");
const FruitEntity = require("@domain/entity/Fruit");

class Fruit {
  constructor(props) {
    this.Fruit = new FruitEntity(props);
  }

  create() {
    return this.Fruit._clean();
  }

  update(data) {
    return this.Fruit._update(data);
  }

  event(data) {
    const event = new EventIdEntity(data)._clean();
    return this.Fruit._update({ event });
  }
}

module.exports = Fruit;
