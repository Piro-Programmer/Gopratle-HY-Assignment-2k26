import { after, before, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { connectDB, disconnectDB } from "../src/db.js";
import { Requirement } from "../src/models/Requirement.js";

const app = createApp();

const futureDate = (days) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const basics = () => ({
  eventName: "  Sharma Wedding  ",
  eventType: "wedding",
  dateType: "range",
  startDate: futureDate(10),
  endDate: futureDate(12),
  location: "Jaipur",
  venue: "Rambagh Palace",
});

const payloads = {
  planner: () => ({
    ...basics(),
    category: "planner",
    details: {
      services: ["decor", "catering"],
      guestCount: 300,
      planningScope: "full",
      budget: { min: 500000, max: 800000 },
    },
  }),
  performer: () => ({
    ...basics(),
    dateType: "single",
    endDate: undefined,
    category: "performer",
    details: {
      performerType: "dj",
      genre: "Bollywood",
      durationHours: 3,
      numberOfSets: 2,
      equipmentProvided: true,
      budget: { min: 40000, max: 60000 },
    },
  }),
  crew: () => ({
    ...basics(),
    category: "crew",
    details: {
      roles: [
        { role: "photographer", count: 2 },
        { role: "sound_engineer", count: 1 },
      ],
      shiftHours: 8,
      experienceLevel: "mid",
      budget: { min: 30000, max: 50000 },
    },
  }),
};

before(async () => {
  delete process.env.MONGODB_URI;
  await connectDB();
});
after(disconnectDB);
beforeEach(() => Requirement.deleteMany({}));

describe("POST /api/requirements", () => {
  for (const category of Object.keys(payloads)) {
    test(`saves a ${category} requirement tagged with its category`, async () => {
      const res = await request(app).post("/api/requirements").send(payloads[category]());
      assert.equal(res.status, 201, JSON.stringify(res.body));
      assert.equal(res.body.category, category);

      const stored = await Requirement.findById(res.body.id).lean();
      assert.equal(stored.category, category);
      assert.equal(stored.eventName, "Sharma Wedding", "strings are trimmed");
      assert.ok(stored.details, "category details are stored");
    });
  }

  test("single-day events store endDate equal to startDate", async () => {
    const res = await request(app).post("/api/requirements").send(payloads.performer());
    assert.equal(res.status, 201);
    const r = res.body.requirement;
    assert.equal(r.startDate, r.endDate);
  });

  test("rejects an unknown category", async () => {
    const res = await request(app)
      .post("/api/requirements")
      .send({ ...payloads.planner(), category: "caterer" });
    assert.equal(res.status, 400);
    assert.ok(res.body.fields.category);
  });

  test("rejects end date before start date", async () => {
    const body = { ...payloads.planner(), startDate: futureDate(10), endDate: futureDate(5) };
    const res = await request(app).post("/api/requirements").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.fields.endDate);
  });

  test("rejects dates in the past", async () => {
    const body = { ...payloads.performer(), startDate: futureDate(-10) };
    const res = await request(app).post("/api/requirements").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.fields.startDate);
  });

  test("rejects budget max lower than min", async () => {
    const body = payloads.crew();
    body.details.budget = { min: 5000, max: 1000 };
    const res = await request(app).post("/api/requirements").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.fields["details.budget.max"]);
  });

  test("rejects details belonging to a different category", async () => {
    const body = { ...payloads.planner(), details: payloads.crew().details };
    const res = await request(app).post("/api/requirements").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.fields["details.services"]);
  });

  test("rejects duplicate crew roles", async () => {
    const body = payloads.crew();
    body.details.roles = [
      { role: "runner", count: 1 },
      { role: "runner", count: 2 },
    ];
    const res = await request(app).post("/api/requirements").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.fields["details.roles"]);
  });

  test("rejects blank required text and malformed JSON", async () => {
    const res = await request(app)
      .post("/api/requirements")
      .send({ ...payloads.planner(), eventName: "   " });
    assert.equal(res.status, 400);
    assert.ok(res.body.fields.eventName);

    const bad = await request(app)
      .post("/api/requirements")
      .set("Content-Type", "application/json")
      .send("{not json");
    assert.equal(bad.status, 400);
  });
});

describe("GET /api/requirements", () => {
  test("lists and filters by category", async () => {
    for (const c of ["planner", "performer", "crew", "crew"]) {
      await request(app).post("/api/requirements").send(payloads[c]());
    }
    const all = await request(app).get("/api/requirements");
    assert.equal(all.body.total, 4);

    const crew = await request(app).get("/api/requirements?category=crew");
    assert.equal(crew.body.total, 2);
    assert.ok(crew.body.items.every((i) => i.category === "crew"));

    const invalid = await request(app).get("/api/requirements?category=nope");
    assert.equal(invalid.status, 400);
  });

  test("fetches one by id and 404s for unknown ids", async () => {
    const created = await request(app).post("/api/requirements").send(payloads.planner());
    const one = await request(app).get(`/api/requirements/${created.body.id}`);
    assert.equal(one.status, 200);
    assert.equal(one.body.category, "planner");

    assert.equal((await request(app).get("/api/requirements/not-an-id")).status, 404);
    assert.equal(
      (await request(app).get("/api/requirements/0123456789abcdef01234567")).status,
      404
    );
  });
});
