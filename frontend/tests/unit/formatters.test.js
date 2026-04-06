import { formatDateTime, formatEventDate, formatEventTime } from "../../src/utils/formatters";

describe("frontend formatters", () => {
  test("formatEventDate returns a readable date string", () => {
    expect(formatEventDate("2099-06-20")).toContain("2099");
  });

  test("formatEventTime returns a readable time string", () => {
    expect(formatEventTime("18:30")).toMatch(/18:30|6:30/i);
  });

  test("formatDateTime combines the formatted date and time", () => {
    expect(formatDateTime("2099-06-20", "18:30")).toContain("at");
  });
});
