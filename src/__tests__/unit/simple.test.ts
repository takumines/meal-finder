import { describe, expect, it } from "vitest";

describe("Simple Test Suite", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle string operations", () => {
    const text = "Hello World";
    expect(text.toLowerCase()).toBe("hello world");
    expect(text.length).toBe(11);
  });

  it("should work with arrays", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr.includes(3)).toBe(true);
    expect(arr.filter((x) => x > 3)).toEqual([4, 5]);
  });

  it("should work with objects", () => {
    const obj = { name: "Test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.name).toBe("Test");
    expect(obj.value).toBeGreaterThan(40);
  });

  it("should handle async operations", async () => {
    const promise = Promise.resolve("success");
    const result = await promise;
    expect(result).toBe("success");
  });
});

describe("Type-related tests", () => {
  it("should validate basic types", () => {
    expect(typeof "string").toBe("string");
    expect(typeof 42).toBe("number");
    expect(typeof true).toBe("boolean");
    expect(typeof {}).toBe("object");
    expect(typeof []).toBe("object");
    expect(Array.isArray([])).toBe(true);
  });

  it("should handle date operations", () => {
    const now = new Date();
    expect(now instanceof Date).toBe(true);
    expect(typeof now.getTime()).toBe("number");
  });
});
