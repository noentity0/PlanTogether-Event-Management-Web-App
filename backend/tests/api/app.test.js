const mongoose = require("mongoose");
const request = require("supertest");

jest.mock("../../src/models/User", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../src/models/Event", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

const User = require("../../src/models/User");
const Event = require("../../src/models/Event");
const app = require("../../src/app");
const { ACCESS_TOKEN_COOKIE, createAccessToken } = require("../../src/utils/security");

function execReturning(value) {
  return {
    exec: jest.fn().mockResolvedValue(value),
  };
}

function selectedExecReturning(value) {
  return {
    select: jest.fn().mockReturnValue(execReturning(value)),
  };
}

function sortedLeanExecReturning(value) {
  return {
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue(execReturning(value)),
    }),
  };
}

function buildUser(overrides = {}) {
  return {
    _id: overrides._id || new mongoose.Types.ObjectId(),
    name: "Jane Doe",
    email: "jane@example.com",
    role: "user",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function buildEvent(overrides = {}) {
  return {
    _id: overrides._id || new mongoose.Types.ObjectId(),
    title: "Launch Night",
    description: "A polished description for a future event.",
    date: "2099-06-20",
    time: "18:30",
    location: "Bangalore Convention Hall",
    category: "Tech",
    capacity: 50,
    startsAt: new Date("2099-06-20T18:30:00.000Z"),
    createdBy: overrides.createdBy || new mongoose.Types.ObjectId(),
    createdByName: "Jane Doe",
    createdByEmail: "jane@example.com",
    registrations: [],
    bookmarkedBy: [],
    comments: [],
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("backend API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET / returns the health payload", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "PlanTogether backend is running" });
  });

  test("POST /api/auth/register creates a new account", async () => {
    const createdUser = buildUser();
    User.findOne.mockReturnValue(execReturning(null));
    User.create.mockResolvedValue(createdUser);

    const response = await request(app).post("/api/auth/register").send({
      name: " Jane Doe ",
      email: " JANE@example.com ",
      password: "secret123",
    });

    expect(response.status).toBe(201);
    expect(User.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
    expect(response.body.user).toMatchObject({
      id: createdUser._id.toString(),
      name: "Jane Doe",
      email: "jane@example.com",
      role: "user",
    });
    expect(response.body.token).toBeUndefined();
    expect(response.headers["set-cookie"][0]).toContain(`${ACCESS_TOKEN_COOKIE}=`);
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
  });

  test("POST /api/auth/login rejects invalid credentials", async () => {
    User.findOne.mockReturnValue(selectedExecReturning(null));

    const response = await request(app).post("/api/auth/login").send({
      email: "missing@example.com",
      password: "secret123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ detail: "Invalid email or password" });
  });

  test("GET /api/auth/verify returns the current user for a valid token", async () => {
    const currentUser = buildUser();
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));

    const response = await request(app).get("/api/auth/verify").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: currentUser._id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      role: "user",
    });
  });

  test("GET /api/auth/verify accepts the httpOnly cookie token", async () => {
    const currentUser = buildUser();
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));

    const response = await request(app).get("/api/auth/verify").set("Cookie", [`${ACCESS_TOKEN_COOKIE}=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: currentUser._id.toString(),
      email: currentUser.email,
    });
  });

  test("POST /api/auth/logout clears the auth cookie", async () => {
    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"][0]).toContain(`${ACCESS_TOKEN_COOKIE}=`);
    expect(response.headers["set-cookie"][0]).toContain("Expires=Thu, 01 Jan 1970");
  });

  test("GET /api/admin/users rejects a normal user", async () => {
    const currentUser = buildUser({ role: "user" });
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ detail: "Admin access required" });
    expect(User.find).not.toHaveBeenCalled();
  });

  test("GET /api/admin/users returns users for an admin", async () => {
    const currentUser = buildUser({ role: "admin" });
    const normalUser = buildUser({
      _id: new mongoose.Types.ObjectId(),
      name: "Alex Guest",
      email: "alex@example.com",
    });
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));
    User.find.mockReturnValue(sortedLeanExecReturning([currentUser, normalUser]));

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(User.find).toHaveBeenCalledWith({});
    expect(response.body).toEqual([
      expect.objectContaining({ email: currentUser.email, role: "admin" }),
      expect.objectContaining({ email: normalUser.email, role: "user" }),
    ]);
  });

  test("POST /api/events creates a future event for the authenticated user", async () => {
    const currentUser = buildUser();
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));
    Event.create.mockImplementation(async (payload) => buildEvent({ ...payload, createdBy: currentUser._id }));

    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Launch Night",
        description: "A polished description for a future event.",
        date: "2099-06-20",
        time: "18:30",
        location: "Bangalore Convention Hall",
        category: "Tech",
        capacity: 50,
      });

    expect(response.status).toBe(201);
    expect(Event.create).toHaveBeenCalled();
    expect(response.body).toMatchObject({
      title: "Launch Night",
      created_by: currentUser._id.toString(),
      created_by_name: currentUser.name,
      attendee_count: 0,
    });
  });

  test("POST /api/events rejects events scheduled in the past", async () => {
    const currentUser = buildUser();
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    User.findById.mockReturnValue(execReturning(currentUser));

    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Past Meetup",
        description: "A polished description for a past event.",
        date: "2000-01-01",
        time: "10:00",
        location: "Bangalore Convention Hall",
        category: "Tech",
        capacity: 50,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ detail: "Event date and time must be in the future" });
    expect(Event.create).not.toHaveBeenCalled();
  });

  test("POST /api/events/:eventId/register blocks registration when capacity is full", async () => {
    const currentUser = buildUser();
    const token = createAccessToken(currentUser._id.toString(), currentUser.email);
    const eventId = new mongoose.Types.ObjectId();
    User.findById.mockReturnValue(execReturning(currentUser));
    Event.findById.mockReturnValue(
      execReturning(
        buildEvent({
          _id: eventId,
          capacity: 1,
          registrations: [
            {
              userId: new mongoose.Types.ObjectId().toString(),
              name: "Alex Guest",
              email: "alex@example.com",
              joinedAt: new Date("2099-06-10T18:30:00.000Z"),
            },
          ],
        })
      )
    );

    const response = await request(app)
      .post(`/api/events/${eventId.toString()}/register`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ detail: "This event is already full" });
  });

  test("DELETE /api/events/:eventId lets an admin delete any event", async () => {
    const adminUser = buildUser({ role: "admin" });
    const token = createAccessToken(adminUser._id.toString(), adminUser.email);
    const eventId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();
    const event = buildEvent({ _id: eventId, createdBy: ownerId });
    User.findById.mockReturnValue(execReturning(adminUser));
    Event.findById.mockReturnValue(execReturning(event));

    const response = await request(app).delete(`/api/events/${eventId.toString()}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(event.deleteOne).toHaveBeenCalled();
  });

  test("DELETE /api/events/:eventId/comments/:commentId lets an admin delete any comment", async () => {
    const adminUser = buildUser({ role: "admin" });
    const token = createAccessToken(adminUser._id.toString(), adminUser.email);
    const eventId = new mongoose.Types.ObjectId();
    const commentId = "comment-1";
    const event = buildEvent({
      _id: eventId,
      createdBy: new mongoose.Types.ObjectId(),
      comments: [
        {
          id: commentId,
          author: {
            id: new mongoose.Types.ObjectId().toString(),
            name: "Alex Guest",
            email: "alex@example.com",
          },
          message: "Can this be moderated?",
          createdAt: new Date("2099-06-10T18:30:00.000Z"),
        },
      ],
    });
    User.findById.mockReturnValue(execReturning(adminUser));
    Event.findById.mockReturnValue(execReturning(event));

    const response = await request(app)
      .delete(`/api/events/${eventId.toString()}/comments/${commentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(event.comments).toHaveLength(0);
    expect(event.save).toHaveBeenCalled();
  });
});
