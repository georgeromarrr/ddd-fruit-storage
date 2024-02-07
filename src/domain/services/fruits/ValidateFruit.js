const { Result } = require("@infra/utils");

class ValidateFruit {
  constructor(props, data) {
    this.fruit = data || {};

    this.name = props.name || "";
    this.description = props.description || "";
    this.limitOfFruitToBeStored = props.limitOfFruitToBeStored || 0;
    this.amount = props.amount || 0;
    this.forceDelete = props.forceDelete || false;
  }

  onCreateFruit() {
    if (this.name.length < 3) {
      throw Result.fail(`Unable to create ${this.name}. Fruit name must be at least 3 characters`);
    }

    if (this.description.length >= 30) {
      throw Result.fail(`Unable to create ${this.name}. Fruit description has ${this.description.length} characters, less than 30 characters is required`);
    }

    if (this.description.length < 5) {
      throw Result.fail(`Unable to create ${this.name}. Fruit description must be at least 5 characters`);
    }

    if (this.limitOfFruitToBeStored < 0) {
      throw Result.fail(`${this.name} limits must not be equal to a negative value`);
    }
  }

  onStoreFruit() {
    const newFruitAmount = this.fruit.amount + this.amount;
    const remainingStorage = this.fruit.limitOfFruitToBeStored - this.fruit.amount;

    if (newFruitAmount > this.fruit.limitOfFruitToBeStored) {
      throw Result.fail(
        `Unable to store ${this.amount} ${this.name}, ${remainingStorage || "no"} storage left. The storage capacity for ${this.name} is limited to ${
          this.fruit.limitOfFruitToBeStored
        }.`
      );
    }

    if (this.amount <= 0) {
      throw Result.fail(`${this.name} amount must not be equal to zero or negative value`);
    }
  }

  onRemoveFruit() {
    if (this.amount <= 0) {
      throw Result.fail(`${this.name} amount must not be equal to zero or negative value`);
    }

    if (this.fruit.amount === 0) {
      throw Result.fail(`Unable to remove ${this.amount} ${this.name}, there are currently no ${this.name} left in the storage`);
    }

    if (this.amount > this.fruit.amount) {
      throw Result.fail(`Unable to remove ${this.amount} ${this.name}, only ${this.fruit.amount} ${this.name} left in the storage`);
    }
  }

  onUpdateFruit() {
    if (this.description && this.description?.length >= 30) {
      throw Result.fail(`Unable to update ${this.name}. Fruit description has ${this.description.length} characters, less than 30 characters is required`);
    }

    if (this.description && this.description?.length < 5) {
      throw Result.fail(`Unable to update ${this.name}. Fruit description must be at least 5 characters`);
    }

    if (this.limitOfFruitToBeStored < 0) {
      throw Result.fail(`${this.name} amount must not be equal to negative value`);
    }

    // if (this.limitOfFruitToBeStored && this.fruit.amount > 0 && this.limitOfFruitToBeStored < this.fruit.amount) {
    //   throw Result.fail(`Unable to update ${this.name} limits to ${this.limitOfFruitToBeStored}. New Limits must be greater than ${this.fruit.amount} ${this.name}`);
    // }

    if (this.limitOfFruitToBeStored >= 0 && this.limitOfFruitToBeStored < this.fruit.amount) {
      throw Result.fail(`Unable to update ${this.name} limits to ${this.limitOfFruitToBeStored}. New Limits must be greater than ${this.fruit.amount} ${this.name}`);
    }
  }

  onDeleteFruit() {
    if (this.fruit.amount > 0 && !this.forceDelete) {
      throw Result.fail(`Unable to remove ${this.name}. There are still ${this.fruit.amount} ${this.name} left in the storage`);
    }
  }

  async execute(method) {
    switch (method) {
      case "createFruit":
        this.onCreateFruit();
        break;
      case "storeFruit":
        this.onStoreFruit();
        break;
      case "removeFruit":
        this.onRemoveFruit();
        break;
      case "updateFruit":
        this.onUpdateFruit();
        break;
      case "deleteFruit":
        this.onDeleteFruit();
        break;
      default:
        throw new Error("Invalid method specified for execution.");
    }
  }
}

module.exports = ValidateFruit;
