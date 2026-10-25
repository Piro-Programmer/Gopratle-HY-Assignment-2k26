import { Router } from "express";
import {
  createRequirement,
  getRequirement,
  listRequirements,
} from "../controllers/requirements.js";

const router = Router();

// Express 5 forwards rejected promises from async handlers to the error middleware.
router.post("/", createRequirement);
router.get("/", listRequirements);
router.get("/:id", getRequirement);

export default router;
