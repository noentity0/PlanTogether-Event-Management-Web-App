const { nowUtc, parseEventDateTime } = require("../../src/utils/date");

describe("date utils", () => {
  test("nowUtc returns a Date instance", () => {
    expect(nowUtc()).toBeInstanceOf(Date);
  });

  test("parseEventDateTime parses valid UTC date and time values", () => {
    expect(parseEventDateTime("2099-06-20", "18:30").toISOString()).toBe("2099-06-20T18:30:00.000Z");
  });

  test("parseEventDateTime rejects invalid calendar dates", () => {
    expect(() => parseEventDateTime("2099-02-30", "18:30")).toThrow("Use date format YYYY-MM-DD and time format HH:MM");
  });
});
