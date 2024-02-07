const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema(
  {
    event: {
      create_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        default: null,
      },
      update_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        default: null,
      },
      storage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        default: null,
      },
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    limitOfFruitToBeStored: { type: Number, required: true },
    amount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const FruitModel = mongoose.model("Fruit", fruitSchema);

module.exports = FruitModel;
