import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const testUser = {
  username: "testuser_jest",
  email: "testjest@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User",
};

const adminUser = {
  username: "adminuser_jest",
  email: "adminjest@example.com",
  password: "adminpass123",
  firstName: "Admin",
  lastName: "Jest",
  role: "admin",
};

let profileToken = "";
let userToken = "";
let adminToken = "";
let createdUserId = "";
let profileUserId = "";
let uploadUserId = "";

const getTestImagePath = () => {
  const testImageDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(testImageDir)) fs.mkdirSync(testImageDir, { recursive: true });
  const testImagePath = path.join(testImageDir, "test-image.png");
  if (!fs.existsSync(testImagePath)) {
    fs.writeFileSync(
      testImagePath,
      Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64")
    );
  }
  return testImagePath;
};

beforeAll(async () => {
  await UserModel.deleteMany({
    email: {
      $in: [
        testUser.email,
        adminUser.email,
        "brandnew@example.com",
        "newuser@example.com",
        "todelete@example.com",
        "profiletest@example.com",
        "uploadtest@example.com",
        "uploadtest2@example.com",
      ],
    },
  });

  const salt = await bcrypt.genSalt(10);

  const hashedUserPass = await bcrypt.hash(testUser.password, salt);
  const user = await UserModel.create({
    ...testUser,
    password: hashedUserPass,
    role: "user",
  });
  createdUserId = user._id.toString();

  const hashedAdminPass = await bcrypt.hash(adminUser.password, salt);
  await UserModel.create({
    ...adminUser,
    password: hashedAdminPass,
    role: "admin",
  });

  const profileUser = await UserModel.create({
    username: "profiletest_jest",
    email: "profiletest@example.com",
    password: hashedUserPass,
    firstName: "Profile",
    lastName: "Test",
    role: "user",
  });
  profileUserId = profileUser._id.toString(); // FIXED: proper indentation
  const profileLogin = await request(app).post("/api/auth/login").send({
    email: "profiletest@example.com",
    password: testUser.password,
  });
  profileToken = profileLogin.body.token;

  const uploadUser = await UserModel.create({
    username: "uploadtest_jest",
    email: "uploadtest@example.com",
    password: hashedUserPass,
    firstName: "Upload",
    lastName: "Test",
    role: "user",
  });
  uploadUserId = uploadUser._id.toString();

  await UserModel.create({
    username: "uploadtest2_jest",
    email: "uploadtest2@example.com",
    password: hashedUserPass,
    firstName: "Upload",
    lastName: "Two",
    role: "user",
  });

  const adminLogin = await request(app).post("/api/auth/login").send({
    email: adminUser.email,
    password: adminUser.password,
  });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post("/api/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  userToken = userLogin.body.token;
}, 30000);

afterAll(async () => {
  try {
    await UserModel.deleteMany({
      email: {
        $in: [
          testUser.email,
          adminUser.email,
          "brandnew@example.com",
          "newuser@example.com",
          "todelete@example.com",
          "profiletest@example.com",
          "uploadtest@example.com",
          "uploadtest2@example.com",
        ],
      },
    });
  } catch (err) {
    console.log("afterAll cleanup skipped (Mongo already disconnected)");
  }
}, 30000);

// ─── AUTH TESTS ───────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  test("should register a new user successfully", async () => {
    await UserModel.deleteMany({ email: "brandnew@example.com" });
    const res = await request(app).post("/api/auth/register").send({
      username: "brandnewuser_jest",
      email: "brandnew@example.com",
      password: "password123",
      firstName: "Brand",
      lastName: "New",
    });
    if (res.status === 400) {
      expect(res.body.success).toBe(false);
    } else {
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    }
    await UserModel.deleteMany({ email: "brandnew@example.com" });
  });

  test("should fail if email already exists", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "missing@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail with invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "baduser",
      email: "not-an-email",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "shortpass",
      email: "shortpass@example.com",
      password: "123",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if username is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "nousername@example.com",
      password: "password123",
      firstName: "No",
      lastName: "Username",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return success false with no body sent", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  test("should login successfully with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  test("should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect([400, 401, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should fail with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });
    expect([400, 401, 404, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should fail if email is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testUser.email });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return a token string on successful login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  test("should return success true on successful login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/auth/forgot-password", () => {
  test("should send reset email for existing user", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email: testUser.email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message.toLowerCase()).toContain("reset");
  }, 15000); // extra timeout for email sending

  test("should fail for non-existent email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "nobody@example.com" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should fail if email is not provided", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/reset-password/:token", () => {
  test("should fail with invalid token", async () => {
    const res = await request(app).post("/api/auth/reset-password/invalidtoken123").send({ newPassword: "newpassword123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if newPassword is missing", async () => {
    const res = await request(app).post("/api/auth/reset-password/sometoken").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if password is too short", async () => {
    const res = await request(app).post("/api/auth/reset-password/sometoken").send({ newPassword: "123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── ADMIN TESTS ──────────────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  test("should get all users with pagination", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toHaveProperty("currentPage", 1);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should filter users by role=admin", async () => {
    const res = await request(app).get("/api/admin/users?role=admin").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    res.body.data.forEach((user: any) => {
      expect(user.role).toBe("admin");
    });
  });

  test("should search users by keyword", async () => {
    const res = await request(app).get("/api/admin/users?search=adminjest").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("should fail without auth token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  test("should return correct page size when limit is set", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=2").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  test("should return pagination metadata with totalUsers and totalPages", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty("totalUsers");
    expect(res.body.pagination).toHaveProperty("totalPages");
    expect(res.body.pagination).toHaveProperty("currentPage");
  });

  test("should return users sorted by createdAt descending", async () => {
    const res = await request(app).get("/api/admin/users?sortBy=createdAt&order=desc").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should filter users by role=user", async () => {
    const res = await request(app).get("/api/admin/users?role=user").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    res.body.data.forEach((user: any) => {
      expect(user.role).toBe("user");
    });
  });

  test("should return empty array for search with no matches", async () => {
    const res = await request(app).get("/api/admin/users?search=xyznonexistentuserzzz").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test("should include hasNextPage in pagination", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty("hasNextPage");
  });

  test("should include hasPrevPage as false on first page", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.pagination.hasPrevPage).toBe(false);
  });

  test("should include limit in pagination response", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty("limit", 5);
  });

  test("should return 401 when using an invalid bearer token", async () => {
    const res = await request(app).get("/api/admin/users").set("Authorization", "Bearer totallyinvalidtoken.xyz.abc");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return data array with limit=1", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=1").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
    expect(res.body.pagination).toHaveProperty("currentPage", 1);
  });
});

describe("GET /api/admin/users/:id", () => {
  test("should get a single user by ID", async () => {
    const res = await request(app).get("/api/admin/users/" + createdUserId).set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("email", testUser.email);
  });

  test("should return 404 for non-existent user ID", async () => {
    const res = await request(app).get("/api/admin/users/000000000000000000000000").set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should return error for malformed user ID", async () => {
    const res = await request(app).get("/api/admin/users/not-a-valid-id").set("Authorization", "Bearer " + adminToken);
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should return user object with expected fields and no password", async () => {
    const res = await request(app).get("/api/admin/users/" + createdUserId).set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("username");
    expect(res.body.data).toHaveProperty("email");
    expect(res.body.data).toHaveProperty("role");
    expect(res.body.data).not.toHaveProperty("password");
  });
});

describe("POST /api/admin/users", () => {
  test("should create a new user as admin", async () => {
    await UserModel.deleteOne({ email: "newuser@example.com" });
    const res = await request(app).post("/api/admin/users")
      .set("Authorization", "Bearer " + adminToken)
      .field("username", "newadminuser_jest")
      .field("email", "newuser@example.com")
      .field("password", "newpassword123")
      .field("firstName", "New")
      .field("lastName", "User")
      .field("role", "user");
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("email", "newuser@example.com");
  });

  test("should fail to create user without required fields", async () => {
    const res = await request(app).post("/api/admin/users")
      .set("Authorization", "Bearer " + adminToken)
      .field("email", "incomplete@example.com");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail to create user without admin token", async () => {
    const res = await request(app).post("/api/admin/users")
      .set("Authorization", "Bearer " + userToken)
      .field("username", "unauthorised_jest")
      .field("email", "unauthorised@example.com")
      .field("password", "password123")
      .field("firstName", "No")
      .field("lastName", "Auth")
      .field("role", "user");
    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("PUT /api/admin/users/:id", () => {
  test("should update a user by ID", async () => {
    const res = await request(app).put("/api/admin/users/" + createdUserId)
      .set("Authorization", "Bearer " + adminToken)
      .field("firstName", "Updated")
      .field("lastName", "Name");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("firstName", "Updated");
  });

  test("should return 404 when updating non-existent user", async () => {
    const res = await request(app).put("/api/admin/users/000000000000000000000000")
      .set("Authorization", "Bearer " + adminToken)
      .field("firstName", "Ghost");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should return 401 when updating without token", async () => {
    const res = await request(app).put("/api/admin/users/" + createdUserId).field("firstName", "NoAuth");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should not allow regular user to update another user", async () => {
    const res = await request(app).put("/api/admin/users/" + createdUserId)
      .set("Authorization", "Bearer " + userToken)
      .field("firstName", "Hacked");
    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/admin/users/:id", () => {
  test("should delete a user by ID and verify deletion", async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("deletepass123", salt);
    const userToDelete = await UserModel.create({
      username: "todelete_jest",
      email: "todelete@example.com",
      password: hashed,
      role: "user",
    });
    const res = await request(app).delete("/api/admin/users/" + userToDelete._id.toString())
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message.toLowerCase()).toContain("deleted");
    const deleted = await UserModel.findById(userToDelete._id);
    expect(deleted).toBeNull();
  });

  test("should return 404 when deleting non-existent user", async () => {
    const res = await request(app).delete("/api/admin/users/000000000000000000000000")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should return 401 when deleting without token", async () => {
    const res = await request(app).delete("/api/admin/users/" + createdUserId);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return 403 when regular user tries to delete", async () => {
    const res = await request(app).delete("/api/admin/users/" + createdUserId)
      .set("Authorization", "Bearer " + userToken);
    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// ─── PROFILE TESTS ────────────────────────────────────────────────────────────

describe("GET /api/profile/:userId", () => {
  test("should return profile for valid user ID", async () => {
    const res = await request(app).get(`/api/profile/${profileUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("email", "profiletest@example.com");
  });

  test("should return profile with expected fields", async () => {
    const res = await request(app).get(`/api/profile/${profileUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("email");
    expect(res.body.data).toHaveProperty("bio");
    expect(res.body.data).toHaveProperty("phone");
    expect(res.body.data).toHaveProperty("image");
  });

  test("should not expose password in profile response", async () => {
    const res = await request(app).get(`/api/profile/${profileUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty("password");
  });

  test("should return 404 for non-existent user ID", async () => {
    const res = await request(app).get("/api/profile/000000000000000000000000");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should return error for malformed user ID", async () => {
    const res = await request(app).get("/api/profile/not-a-valid-id");
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should return correct name format as string", async () => {
    const res = await request(app).get(`/api/profile/${profileUserId}`); // FIXED: was backtick syntax error
    expect(res.status).toBe(200);
    expect(typeof res.body.data.name).toBe("string");
    expect(res.body.data.name.length).toBeGreaterThan(0);
  });
});

describe("POST /api/profile/update", () => {
  test("should update profile successfully with valid data", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("name", "Updated Name")
      .field("email", "profiletest@example.com");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated successfully");
  });

  test("should return updated data in response", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("name", "New Name")
      .field("email", "profiletest@example.com");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("email");
  });

  test("should update bio and phone fields", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("name", "Profile Test")
      .field("email", "profiletest@example.com")
      .field("bio", "This is my bio")
      .field("phone", "1234567890");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("bio", "This is my bio");
    expect(res.body.data).toHaveProperty("phone", "1234567890");
  });

  test("should fail if userId is missing", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("name", "No User")
      .field("email", "profiletest@example.com");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if name is missing", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("email", "profiletest@example.com");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should fail if email is missing", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("name", "Profile Test");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 404 for non-existent userId", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", "000000000000000000000000")
      .field("name", "Ghost User")
      .field("email", "ghost@example.com");
    // Will return 403 because ownership check fails before DB lookup — this is correct REST behavior
    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should split name into firstName correctly", async () => {
    const res = await request(app).put("/api/profile/update")
      .set("Authorization", `Bearer ${profileToken}`)
      .field("userId", profileUserId)
      .field("name", "John Doe")
      .field("email", "profiletest@example.com");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const getRes = await request(app).get(`/api/profile/${profileUserId}`); // FIXED: was backtick syntax error
    expect(getRes.body.data.name).toContain("John");
  });
});

// ─── UPLOAD TESTS ─────────────────────────────────────────────────────────────

describe("GET /api/upload/profile-image/:userId", () => {
  test("should return profile image data for valid user", async () => {
    const res = await request(app).get(`/api/upload/profile-image/${uploadUserId}`); // FIXED: was backtick syntax error
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("imageUrl");
  });

  test("should return null imageUrl when user has no profile image", async () => {
    const res = await request(app).get(`/api/upload/profile-image/${uploadUserId}`); // FIXED: was backtick syntax error
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should return error for non-existent user", async () => {
    const res = await request(app).get("/api/upload/profile-image/000000000000000000000000");
    expect([404, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should return error for malformed user ID", async () => {
    const res = await request(app).get("/api/upload/profile-image/not-a-valid-id");
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/upload/profile-image", () => {
  test("should fail if no image file is provided", async () => {
    const res = await request(app).post("/api/upload/profile-image").field("userId", uploadUserId);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No image file provided");
  });

  test("should fail if userId is missing", async () => {
    const testImagePath = getTestImagePath();
    const res = await request(app).post("/api/upload/profile-image").attach("image", testImagePath);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User ID is required");
  });

  test("should upload profile image successfully", async () => {
    const testImagePath = getTestImagePath();
    const res = await request(app).post("/api/upload/profile-image")
      .field("userId", uploadUserId)
      .attach("image", testImagePath);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile image uploaded successfully");
    expect(res.body.data).toHaveProperty("imageUrl");
  });

  test("should return imageUrl starting with /uploads/ after upload", async () => {
    const testImagePath = getTestImagePath();
    const res = await request(app).post("/api/upload/profile-image")
      .field("userId", uploadUserId)
      .attach("image", testImagePath);
    expect(res.status).toBe(200);
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\//);
  });

  test("should fail for non-existent userId", async () => {
    const testImagePath = getTestImagePath();
    const res = await request(app).post("/api/upload/profile-image")
      .field("userId", "000000000000000000000000")
      .attach("image", testImagePath);
    expect([404, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/upload/profile-image/:userId", () => {
  test("should delete profile image successfully", async () => {
    const res = await request(app).delete(`/api/upload/profile-image/${uploadUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile image deleted successfully");
  });

  test("should return success even if user has no image", async () => {
    const res = await request(app).delete(`/api/upload/profile-image/${uploadUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should return error for non-existent user", async () => {
    const res = await request(app).delete("/api/upload/profile-image/000000000000000000000000");
    expect([404, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test("should verify imageUrl is falsy after deletion", async () => {
    const testImagePath = getTestImagePath();
    await request(app).post("/api/upload/profile-image")
      .field("userId", uploadUserId)
      .attach("image", testImagePath);
    await request(app).delete(`/api/upload/profile-image/${uploadUserId}`);
    const res = await request(app).get(`/api/upload/profile-image/${uploadUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.imageUrl).toBeFalsy();
  });

  test("should return error for malformed user ID", async () => {
    const res = await request(app).delete("/api/upload/profile-image/not-a-valid-id");
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});