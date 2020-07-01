const mongoose = require("mongoose");
const shortid = require("shortid");

const urlSchema = new mongoose.Schema({
  _id: { type: String },
  original_url: String,
  created_at: String,
});

urlSchema.pre("save", function urlPreSave(next) {
  console.log("running pre-save");

  const doc = this;

  doc._id = shortid.generate();
  doc.created_at = new Date();

  next();
});

module.exports = mongoose.model("URL", urlSchema);
