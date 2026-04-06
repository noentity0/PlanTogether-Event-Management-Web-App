const {
  validateCommentPayload,
  validateEventPayload,
  validateLoginPayload,
  validateRegisterPayload,
} = require("../../src/utils/validation");

describe("validation utils", () => {
  test("validateRegisterPayload normalizes the email and trims the name", () => {
    expect(
      validateRegisterPayload({
        name: "  Jane Doe  ",
        email: "  JANE@Example.com ",
        password: "secret123",
      })
    ).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret123",
    });
  });

  test("validateLoginPayload rejects missing credentials", () => {
    expect(() => validateLoginPayload({ email: "", password: "" })).toThrow("Email and password are required");
  });

  test("validateCommentPayload enforces the allowed message length", () => {
    expect(() => validateCommentPayload({ message: "x" })).toThrow("Comment must be between 2 and 600 characters");
  });

  test("validateEventPayload converts capacity to a number", () => {
    expect(
      validateEventPayload({
        title: "Launch Night",
        description: "A polished description for a future event.",
        date: "2099-06-20",
        time: "18:30",
        location: "Bangalore Convention Hall",
        category: "Tech",
        capacity: "42",
      })
    ).toMatchObject({
      title: "Launch Night",
      category: "Tech",
      capacity: 42,
    });
  });

  test("validateEventPayload rejects unknown categories", () => {
    expect(() =>
      validateEventPayload({
        title: "Launch Night",
        description: "A polished description for a future event.",
        date: "2099-06-20",
        time: "18:30",
        location: "Bangalore Convention Hall",
        category: "Gaming",
        capacity: null,
      })
    ).toThrow("Select a valid category");
  });
});
