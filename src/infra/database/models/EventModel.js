const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    event_type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    is_sent: { type: Boolean, default: false },
    is_processed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const EventModel = mongoose.model("Event", eventSchema);

module.exports = EventModel;
