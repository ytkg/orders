import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MAX_QUANTITY, MIN_QUANTITY } from "../model/constants";
import { useOrderMemo } from "./useOrderMemo";

function addHighballOrder(
  result: { current: ReturnType<typeof useOrderMemo> }
) {
  act(() => {
    result.current.addOrderFromMenu({ name: "ハイボール", price: 700 });
  });

  const orderId = result.current.orders[0]?.id;
  expect(orderId).toBeTruthy();
  return orderId as string;
}

describe("useOrderMemo", () => {
  test("個数は上限99を超えない", () => {
    const { result } = renderHook(() => useOrderMemo());
    const orderId = addHighballOrder(result);

    act(() => {
      for (let i = 0; i < 200; i += 1) {
        result.current.incrementOrderQuantity(orderId, 1);
      }
    });

    expect(result.current.orders[0]?.quantity).toBe(MAX_QUANTITY);
  });

  test("個数は下限1を下回らない", () => {
    const { result } = renderHook(() => useOrderMemo());
    const orderId = addHighballOrder(result);

    act(() => {
      result.current.incrementOrderQuantity(orderId, -50);
    });

    expect(result.current.orders[0]?.quantity).toBe(MIN_QUANTITY);
  });
});
