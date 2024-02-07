const mongoose = require("mongoose");

class MongoDB {
  constructor() {
    this.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ddd";
  }

  async connect() {
    try {
      await mongoose.connect(this.MONGO_URI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
      throw error;
    }
  }

  async destroy() {
    try {
      await mongoose.disconnect();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MongoDB;
