'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const pgcrSchema = new mongoose.Schema({
  masterArr: Array
});

const PGCR = mongoose.model("PGCR", pgcrSchema);
// module.exports = mongoose.model("PGCR", pgcrSchema);
module.exports = { PGCR };