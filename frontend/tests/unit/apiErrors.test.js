import { formatApiError } from "../../src/utils/apiErrors";

describe("formatApiError", () => {
  test("returns the backend detail string when available", () => {
    expect(
      formatApiError(
        {
          response: {
            data: {
              detail: "Event is full",
            },
          },
        },
        "Fallback message"
      )
    ).toBe("Event is full");
  });

  test("joins validation issues from an array payload", () => {
    expect(
      formatApiError(
        {
          response: {
            data: {
              detail: [
                { loc: ["body", "email"], msg: "is required" },
                { loc: ["body", "password"], msg: "is too short" },
              ],
            },
          },
        },
        "Fallback message"
      )
    ).toBe("email: is required password: is too short");
  });

  test("falls back when the response detail is missing", () => {
    expect(formatApiError({}, "Fallback message")).toBe("Fallback message");
  });
});
