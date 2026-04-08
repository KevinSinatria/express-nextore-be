import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";
import { mockSession } from "../setup.js";

describe("All-Modules Integrity Audit (CRUD & RBAC)", () => {
  beforeEach(async () => {
    // Reset mock session role to ADMIN for each test
    mockSession.session.activeRole = "ADMIN";

    // Create Test Admin
    await prisma.user.upsert({
      where: { id: "test-user-id" },
      update: {},
      create: {
        id: "test-user-id",
        name: "Test Administrator",
        username: "admin_test",
        roles: ["ADMIN"],
      },
    });
  });

  describe("Categories Module", () => {
    it("should create and list categories", async () => {
      const res = await request(app).post("/categories").send({
        name: "Electronics",
        description: "Electronic gadgets",
      });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Electronics");

      const listRes = await request(app).get("/categories");
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some((c: any) => c.name === "Electronics")).toBe(
        true,
      );
    });
  });

  describe("Products Module & RBAC", () => {
    it("should create products with category validation", async () => {
      const cat = await prisma.category.create({ data: { name: "Food" } });

      const res = await request(app).post("/products").send({
        sku: "PRD-001",
        name: "Roti Bakar",
        price: 15000,
        categoryId: cat.id,
        hpp: 10000,
        stock: 50,
        lowStockThreshold: 5,
      });

      expect(res.status).toBe(200);
    });

    it("should block CASHIER from creating products (RBAC)", async () => {
      // Temporarily change session to CASHIER
      mockSession.session.activeRole = "CASHIER";

      const res = await request(app).post("/products").send({
        sku: "PRD-BAD",
        name: "Illegal Product",
        price: 1000,
      });

      expect(res.status).toBe(403); // Forbidden

      // Reset to ADMIN
      mockSession.session.activeRole = "ADMIN";
    });
  });

  describe("Members Module", () => {
    it("should enforce unique phone numbers for members", async () => {
      await prisma.member.create({
        data: { name: "Member 1", phone: "0812345678" },
      });

      const res = await request(app).post("/members").send({
        name: "Member 2",
        phone: "0812345678", // Duplicate
      });

      expect(res.status).toBe(409); // Conflict (Unique constraint)
    });
  });

  describe("Discounts Module", () => {
    it("should validate discount active dates", async () => {
      const res = await request(app).post("/discounts").send({
        name: "Expired Promo",
        type: "PERCENTAGE",
        value: 10,
        startDate: "2020-01-01T00:00:00Z",
        endDate: "2020-12-31T23:59:59Z",
        isActive: true,
      });

      expect(res.status).toBe(201);
      // Further tests would verify this doesn't apply to new transactions
    });
  });

  describe("Users Module", () => {
    it("should allow SUPERUSER to list users", async () => {
      mockSession.session.activeRole = "SUPERUSER";
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
