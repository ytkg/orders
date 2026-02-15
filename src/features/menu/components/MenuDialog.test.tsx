import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { MenuItem } from "../model/menuItems";
import { MenuDialog } from "./MenuDialog";

const GROUPED_MENU: Array<[string, MenuItem[]]> = [
  [
    "ビール",
    [
      { id: 1, category: "ビール", name: "ハイネケン", price: 750 },
      { id: 2, category: "ビール", name: "コロナ", price: 850 }
    ]
  ],
  [
    "カクテル",
    [
      { id: 3, category: "カクテル", name: "ハイボール", price: 700 },
      { id: 4, category: "カクテル", name: "ジントニック", price: 750 }
    ]
  ]
];

function renderDialog(options?: {
  groupedMenu?: Array<[string, MenuItem[]]>;
  onSelectMenuItem?: (menuItem: MenuItem) => void;
}) {
  return render(
    <MenuDialog
      open
      groupedMenu={options?.groupedMenu ?? GROUPED_MENU}
      onClose={() => undefined}
      onSelectMenuItem={options?.onSelectMenuItem ?? vi.fn()}
    />
  );
}

describe("MenuDialog", () => {
  test("カテゴリタブクリックで該当カテゴリ位置へスクロールする", async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollToSpy
    });

    renderDialog();

    await user.click(screen.getByRole("tab", { name: "カクテル" }));
    expect(scrollToSpy).toHaveBeenCalled();
    expect(scrollToSpy.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ behavior: "smooth" })
    );

    // タブは移動専用で、商品表示は絞り込まない。
    expect(screen.getByRole("button", { name: /ハイボール/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ジントニック/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ハイネケン/ })).toBeInTheDocument();
  });

  test("すべてタブクリックで先頭へスクロールする", async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollToSpy
    });

    renderDialog();

    await user.click(screen.getByRole("tab", { name: "カクテル" }));
    await user.click(screen.getByRole("tab", { name: "すべて" }));

    expect(scrollToSpy).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
  });

  test("商品が0件のとき空状態を表示する", () => {
    renderDialog({ groupedMenu: [] });
    expect(screen.getByText("該当する商品はありません。")).toBeInTheDocument();
  });

  test("商品タップで既存の追加フローを維持する", async () => {
    const user = userEvent.setup();
    const onSelectMenuItem = vi.fn();
    renderDialog({ onSelectMenuItem });

    await user.click(screen.getByRole("button", { name: /ハイボール/ }));
    expect(onSelectMenuItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, name: "ハイボール" })
    );
  });
});
