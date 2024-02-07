const { Check } = require("@infra/utils");

class FruitEntity {
  constructor(props) {
    this.name = props?.name;
    this.description = props?.description;
    this.limitOfFruitToBeStored = props?.limitOfFruitToBeStored;
    this.id = props?.id;
    this.amount = props?.amount;
    this.event = props?.event;
  }

  _update(props) {
    const fieldsToUpdate = {
      id: props?.id,
      name: props?.name,
      description: props?.description,
      limitOfFruitToBeStored: props?.limitOfFruitToBeStored,
      amount: props?.amount,
      event: props?.event,
    };

    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (!Check._isEmpty(value)) {
        this[key] = value;
      }
    }

    return this._clean();
  }

  _clean() {
    const fruit = {};

    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!Check._isEmpty(value)) {
          fruit[key] = value;
        }
      }
    }

    return fruit;
  }
}

module.exports = FruitEntity;
