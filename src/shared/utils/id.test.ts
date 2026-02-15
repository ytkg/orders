import { describe, expect, test, vi } from "vitest";
import { createIdGenerator } from "./id";

describe("createIdGenerator", () => {
  test("UUID factory が値を返す場合はその値を使う", () => {
    const generate = createIdGenerator(() => "fixed-uuid");

    expect(generate("order")).toBe("fixed-uuid");
    expect(generate("order")).toBe("fixed-uuid");
  });

  test("fallback は同一時刻でも重複しない", () => {
    const generate = createIdGenerator(() => null);
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const first = generate("order");
    const second = generate("order");

    expect(first).toBe("order-1700000000000-1");
    expect(second).toBe("order-1700000000000-2");
    expect(first).not.toBe(second);

    nowSpy.mockRestore();
  });
});
