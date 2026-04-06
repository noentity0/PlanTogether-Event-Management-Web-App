const mongoose = require("mongoose");

const { deriveDisplayName, serializeEvent, serializeUser } = require("../../src/utils/formatters");

describe("backend formatters", () => {
  test("deriveDisplayName builds a readable fallback from email", () => {
    expect(deriveDisplayName("jane_doe-test@example.com")).toBe("Jane Doe Test");
  });

  test("serializeUser returns the expected API shape", () => {
    const userId = new mongoose.Types.ObjectId();

    expect(
      serializeUser({
        _id: userId,
        name: "Jane Doe",
        email: "jane@example.com",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      })
    ).toMatchObject({
      id: userId.toString(),
      name: "Jane Doe",
      email: "jane@example.com",
    });
  });

  test("serializeEvent calculates derived attendee and ownership fields", () => {
    const ownerId = new mongoose.Types.ObjectId();
    const attendeeId = new mongoose.Types.ObjectId();

    const payload = serializeEvent(
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Launch Night",
        description: "A polished description for a future event.",
        date: "2099-06-20",
        time: "18:30",
        location: "Bangalore Convention Hall",
        category: "Tech",
        capacity: 3,
        startsAt: new Date("2099-06-20T18:30:00.000Z"),
        createdBy: ownerId,
        createdByName: "Jane Doe",
        createdByEmail: "jane@example.com",
        registrations: [
          {
            userId: attendeeId.toString(),
            name: "Alex Guest",
            email: "alex@example.com",
            joinedAt: new Date("2099-06-10T18:30:00.000Z"),
          },
        ],
        bookmarkedBy: [{ id: attendeeId.toString(), name: "Alex Guest", email: "alex@example.com" }],
        comments: [],
      },
      { _id: attendeeId },
      { includePrivate: true }
    );

    expect(payload).toMatchObject({
      attendee_count: 1,
      available_spots: 2,
      is_owner: false,
      is_registered: true,
      is_bookmarked: true,
      created_by: ownerId.toString(),
    });
    expect(payload.registrations).toHaveLength(1);
  });
});
