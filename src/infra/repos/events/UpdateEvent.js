const Model = require("@infra/database/models");
const Map = require("@domain/mappers");

class UpdateEvent {
  validateAndUpdateField(updateFields, fieldName, value) {
    if (value !== undefined && value !== null) {
      updateFields[fieldName] = value;
    }
  }

  async update({ id, is_sent, is_processed }) {
    try {
      const updateFields = {};

      this.validateAndUpdateField(updateFields, "is_sent", is_sent);
      this.validateAndUpdateField(updateFields, "is_processed", is_processed);

      const updatedFruit = await Model.Event.findByIdAndUpdate(id, updateFields, { new: true });

      return Map.Event.toDomain(updatedFruit);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = UpdateEvent;
