import mongoose from "mongoose";
import {
  CATEGORIES,
  CREW_ROLES,
  DATE_TYPES,
  EVENT_TYPES,
  EXPERIENCE_LEVELS,
  PERFORMER_TYPES,
  PLANNER_SERVICES,
  PLANNING_SCOPES,
  STATUSES,
} from "../constants.js";

const { Schema } = mongoose;

const budgetSchema = new Schema(
  {
    min: { type: Number, min: 0, required: true },
    max: { type: Number, min: 0, required: true },
    currency: { type: String, default: "INR" },
  },
  { _id: false }
);

// Common "Step 1" fields. `category` is the discriminator key, so every
// document is stored in one collection but tagged and shaped by its type.
const requirementSchema = new Schema(
  {
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    eventType: { type: String, required: true, enum: EVENT_TYPES },
    dateType: { type: String, required: true, enum: DATE_TYPES },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    venue: { type: String, trim: true, maxlength: 160 },
    status: { type: String, enum: STATUSES, default: "open" },
  },
  {
    timestamps: true,
    discriminatorKey: "category",
    collection: "requirements",
  }
);

requirementSchema.index({ category: 1, createdAt: -1 });

export const Requirement = mongoose.model("Requirement", requirementSchema);

const plannerDetails = new Schema(
  {
    services: { type: [{ type: String, enum: PLANNER_SERVICES }], required: true },
    guestCount: { type: Number, required: true, min: 1 },
    planningScope: { type: String, required: true, enum: PLANNING_SCOPES },
    budget: { type: budgetSchema, required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const performerDetails = new Schema(
  {
    performerType: { type: String, required: true, enum: PERFORMER_TYPES },
    genre: { type: String, trim: true, maxlength: 80 },
    durationHours: { type: Number, required: true, min: 0.5, max: 24 },
    numberOfSets: { type: Number, required: true, min: 1, max: 10 },
    equipmentProvided: { type: Boolean, default: false },
    budget: { type: budgetSchema, required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const crewDetails = new Schema(
  {
    roles: {
      type: [
        new Schema(
          {
            role: { type: String, required: true, enum: CREW_ROLES },
            count: { type: Number, required: true, min: 1, max: 500 },
          },
          { _id: false }
        ),
      ],
      required: true,
    },
    shiftHours: { type: Number, required: true, min: 1, max: 24 },
    experienceLevel: { type: String, required: true, enum: EXPERIENCE_LEVELS },
    budget: { type: budgetSchema, required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

export const PlannerRequirement = Requirement.discriminator(
  "PlannerRequirement",
  new Schema({ details: { type: plannerDetails, required: true } }),
  "planner"
);

export const PerformerRequirement = Requirement.discriminator(
  "PerformerRequirement",
  new Schema({ details: { type: performerDetails, required: true } }),
  "performer"
);

export const CrewRequirement = Requirement.discriminator(
  "CrewRequirement",
  new Schema({ details: { type: crewDetails, required: true } }),
  "crew"
);

export const modelsByCategory = {
  planner: PlannerRequirement,
  performer: PerformerRequirement,
  crew: CrewRequirement,
};

// Sanity check: every category must have a model.
for (const c of CATEGORIES) {
  if (!modelsByCategory[c]) throw new Error(`No model for category ${c}`);
}
