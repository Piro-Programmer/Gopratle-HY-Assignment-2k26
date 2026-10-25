import mongoose from "mongoose";
import { Requirement, modelsByCategory } from "../models/Requirement.js";
import { formatZodError, listQuerySchema, requirementSchema } from "../validation/requirement.js";

export async function createRequirement(req, res) {
  const parsed = requirementSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", fields: formatZodError(parsed.error) });
  }

  const Model = modelsByCategory[parsed.data.category];
  const doc = await Model.create(parsed.data);

  res.status(201).json({
    id: doc._id,
    category: doc.category,
    status: doc.status,
    createdAt: doc.createdAt,
    requirement: doc,
  });
}

export async function listRequirements(req, res) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query", fields: formatZodError(parsed.error) });
  }
  const { category, page, limit } = parsed.data;
  const filter = category ? { category } : {};

  const [items, total] = await Promise.all([
    Requirement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Requirement.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total });
}

export async function getRequirement(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: "Requirement not found" });
  }
  const doc = await Requirement.findById(id).lean();
  if (!doc) return res.status(404).json({ error: "Requirement not found" });
  res.json(doc);
}
