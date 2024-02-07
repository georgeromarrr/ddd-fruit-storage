const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class UpdateFruit {
  validateAndUpdateField(updateFields, fieldName, value) {
    if (value !== undefined && value !== null) {
      updateFields[fieldName] = value;
    }
  }

  validateAndUpdateAmountField(updateFields, fieldName, value) {
    if (typeof value === "number") {
      updateFields.$inc = { [fieldName]: value };
    }
  }

  async update({ id, amount, description, limitOfFruitToBeStored, event }) {
    try {
      const updateFields = {};

      this.validateAndUpdateField(updateFields, "description", description);
      this.validateAndUpdateField(updateFields, "limitOfFruitToBeStored", limitOfFruitToBeStored);
      this.validateAndUpdateAmountField(updateFields, "amount", amount);
      this.validateAndUpdateField(updateFields, "event.create_id", event?.create_id);
      this.validateAndUpdateField(updateFields, "event.update_id", event?.update_id);
      this.validateAndUpdateField(updateFields, "event.storage_id", event?.storage_id);

      const updatedFruit = await Model.Fruit.findByIdAndUpdate(id, updateFields, { new: true });

      return Map.Fruit.toDomain(updatedFruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = UpdateFruit;
