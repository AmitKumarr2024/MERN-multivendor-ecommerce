import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { connectTestDB, closeTestDB, clearTestDB } from "../setup/db.js";
import authRoutes from "../../modules/auth/auth.routes.js";
import errorHandler from "../../middleware/errorHandler.js";

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
  return app;
};

const app = buildTestApp();

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("POST /api/auth/register", () => {
  test("registers a new user and sets an auth cookie", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.role).toBe("buyer");
    expect(res.body.password).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("rejects registering the same email twice", async () => {
    const payload = {
      name: "Test User",
      email: "dup@example.com",
      password: "password123",
    };

    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("rejects a password shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "short@example.com",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  const credentials = {
    name: "Login User",
    email: "login@example.com",
    password: "password123",
  };

  test("logs in successfully with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(credentials.email);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("rejects an incorrect password", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("rejects a non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  test("rejects a request with no auth cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("returns the user's profile when authenticated", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      name: "Profile User",
      email: "profile@example.com",
      password: "password123",
    });

    const res = await agent.get("/api/auth/me");

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("profile@example.com");
  });
});
