import mongoose from "mongoose";

/**
 * Re-register models in dev so schema changes (e.g. addedBy, teamMembers) apply.
 */
export function registerModel(name, schema) {
  if (mongoose.models[name]) {
    mongoose.deleteModel(name);
  }
  return mongoose.model(name, schema);
}
