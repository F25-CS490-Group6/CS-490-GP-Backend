const { getSalonNameFallback, formatReminderMessage } = require("../modules/utils/salonHelpers");
const { getSalonName } = require("../modules/bookings/controller");

describe("salon name helpers", () => {
  test("getSalonNameFallback returns name when available", () => {
    expect(getSalonNameFallback({ name: "Studio 1" })).toBe("Studio 1");
    expect(getSalonNameFallback({ salon_name: "Legacy Name" })).toBe("Legacy Name");
  });

  test("getSalonNameFallback defaults gracefully", () => {
    expect(getSalonNameFallback({})).toBe("the salon");
    expect(getSalonNameFallback(null)).toBe("the salon");
    expect(getSalonNameFallback(undefined)).toBe("the salon");
  });

  test("formatReminderMessage interpolates name and date", () => {
    const date = new Date("2025-12-12T15:00:00Z");
    const msg = formatReminderMessage({ name: "Studio 1" }, date);
    expect(msg).toContain("Studio 1");
    expect(msg).toContain(date.toLocaleString());
  });

  test("controller getSalonName mirrors fallback logic", () => {
    expect(getSalonName({ name: "Primary" })).toBe("Primary");
    expect(getSalonName({ salon_name: "Secondary" })).toBe("Secondary");
    expect(getSalonName({})).toBe("the salon");
  });
});
