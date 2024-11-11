// models/IpfsHash.js
const mongoose = require("mongoose");

const ipfsHashSchema = new mongoose.Schema({
  ipfsHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("IpfsHash", ipfsHashSchema);
