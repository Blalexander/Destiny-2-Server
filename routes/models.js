'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// const pgcrSchema = mongoose.Schema({
//   saveThis: Array,
//   masterArr: Array
// });

const pgcrSchema = mongoose.Schema({
  pgcrId: String,
  // referenceIdsForGamesPlayed: Array,
  game: Object
});

pgcrSchema.pre('find', function(next) {
  this.populate('pgcr');
  next();
})

pgcrSchema.pre('findOne', function(next) {
  this.populate('pgcr');
  next();
})


const manifestSchema = mongoose.Schema({
  manifest: Object
});

// manifestSchema.pre('find', function(next) {
//   this.populate('manifest');
//   next();
// })

manifestSchema.pre('findOne', function(next) {
  this.populate('manifest');
  next();
})

const PGCR = mongoose.model("PGCR", pgcrSchema);
const Mani = mongoose.model("Mani", manifestSchema);

// module.exports = mongoose.model("PGCR", pgcrSchema);
module.exports = { PGCR, Mani };