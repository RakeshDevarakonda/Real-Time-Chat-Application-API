import mongoose from "mongoose";
import request from "supertest";
import { app } from "../index.js";
import { usercollections } from "../schemas/UsersSchema.js";
import "dotenv/config";
import { redisClient } from "../redis-config.js";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await usercollections.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await redisClient.quit();
});

describe("Auth Routes", () => {
  const testUser = {
    username: "rakesh",
    email: `rakesh${Date.now()}@example.com`,
    password: "secret123",
    confirmpassword: "secret123",
  };

  it("should sign up a new user", async () => {
    const res = await request(app).post("/api/register").send(testUser);
    expect(res.statusCode).toBe(201);
    console.log(res.body);
    expect(res.body).toHaveProperty("userId");
  });

  it("should not sign up duplicate user", async () => {
    await request(app).post("/api/register").send(testUser);
    const res = await request(app).post("/api/register").send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("User already exists");
  });

  it("should sign in existing user", async () => {
    await request(app).post("/api/register").send(testUser);
    const res = await request(app).post("/api/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should not sign in with wrong credentials", async () => {
    await request(app).post("/api/register").send(testUser);
    const res = await request(app).post("/api/login").send({
      email: testUser.email,
      password: "wrongpass",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid password");
  });

  it("should not sign up if passwords do not match", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        ...testUser,
        confirmpassword: "differentpassword",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Passwords do not match");
  });
});
