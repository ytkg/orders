import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import App from "./App";

async function addOrderFromMenu(
  user: ReturnType<typeof userEvent.setup>,
  options?: { keepMenuOpen?: boolean }
) {
  await user.click(screen.getByRole("button", { name: "メニューを開く" }));
  expect(screen.getByRole("heading", { name: "メニュー" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /ハイボール/ }));
  if (!options?.keepMenuOpen) {
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "メニュー" })).not.toBeInTheDocument();
    });
  }
}

function getFirstOrderRow(options?: { includeHidden?: boolean }) {
  return screen.getAllByRole("listitem", { hidden: options?.includeHidden ?? false })[0] as HTMLLIElement;
}

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("T1: 初期表示", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "バー注文メモ" })).toBeInTheDocument();
    expect(screen.getByText("まだメモはありません。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "メモをリセット" })).toBeInTheDocument();
  });

  test("T2: メニューから注文追加", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addOrderFromMenu(user, { keepMenuOpen: true });

    expect(screen.getByRole("heading", { name: "メニュー" })).toBeInTheDocument();
    expect(screen.getByText("ハイボール を追加しました")).toBeInTheDocument();
    const row = getFirstOrderRow({ includeHidden: true });
    expect(within(row).getByText("ハイボール")).toBeInTheDocument();
    expect(within(row).getByText(/1杯/)).toBeInTheDocument();
    expect(within(row).getByText(/注文者未入力/)).toBeInTheDocument();
  });

  test("T3: 個数変更（通常）", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);
    const row = getFirstOrderRow();

    await user.click(within(row).getByRole("button", { name: "個数を1減らす" }));
    expect(within(row).getByText("1")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "個数を1増やす" }));
    expect(within(row).getByText("2")).toBeInTheDocument();
  });

  test("T4: 個数変更（上限）", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);
    const row = getFirstOrderRow();
    const plusButton = within(row).getByRole("button", { name: "個数を1増やす" });

    for (let i = 0; i < 120; i += 1) {
      fireEvent.click(plusButton);
    }

    expect(within(row).getByText("99")).toBeInTheDocument();

    fireEvent.click(plusButton);
    expect(within(row).getByText("99")).toBeInTheDocument();
  });

  test("T5: 注文者変更", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    await user.type(screen.getByPlaceholderText("例: A卓 / 田中さんグループ"), "田中グループ");
    await user.click(screen.getByRole("button", { name: "来店者を追加" }));
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "来店者（グループ）管理" })
      ).not.toBeInTheDocument();
    });

    const row = getFirstOrderRow();
    const combobox = within(row).getByRole("combobox");
    await user.selectOptions(combobox, "田中グループ");
    expect(combobox).toHaveValue("田中グループ");
  });

  test("T6: 来店者追加と重複エラー", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    const input = screen.getByPlaceholderText("例: A卓 / 田中さんグループ");
    await user.type(input, "A卓");
    await user.click(screen.getByRole("button", { name: "来店者を追加" }));
    expect(screen.getByText(/A卓/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "A卓");
    await user.click(screen.getByRole("button", { name: "来店者を追加" }));
    expect(screen.getByText("同じ来店者名は登録できません。")).toBeInTheDocument();
  });

  test("T7: 確認モーダル表示とメモ保持", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);

    await user.click(screen.getByRole("button", { name: "確認" }));
    const confirmDialog = screen.getByRole("dialog", { name: "確定オーダー" });
    expect(within(confirmDialog).getByText("ハイボール")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "通常表示へ戻る" }));
    const row = getFirstOrderRow();
    expect(within(row).getByText("ハイボール")).toBeInTheDocument();
  });

  test("T8: メモリセット", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "メモをリセット" }));
    expect(screen.getByText("ハイボール")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "メモをリセット" }));
    expect(screen.getByText("まだメモはありません。")).toBeInTheDocument();
  });

  test("T9: 確認画面で同一商品・同一注文者を合算表示", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    await user.type(screen.getByPlaceholderText("例: A卓 / 田中さんグループ"), "A卓");
    await user.click(screen.getByRole("button", { name: "来店者を追加" }));
    await user.click(screen.getByRole("button", { name: "閉じる" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "来店者（グループ）管理" })
      ).not.toBeInTheDocument();
    });

    await addOrderFromMenu(user);
    await addOrderFromMenu(user);

    const rows = screen.getAllByRole("listitem");
    const firstSelect = within(rows[0]).getByRole("combobox");
    await user.selectOptions(firstSelect, "A卓");

    const secondSelect = within(rows[1]).getByRole("combobox");
    await user.selectOptions(secondSelect, "A卓");

    await user.click(screen.getByRole("button", { name: "確認" }));
    const confirmDialog = screen.getByRole("dialog", { name: "確定オーダー" });
    const scoped = within(confirmDialog);
    expect(scoped.getByText("1 件 / 合計 2 杯")).toBeInTheDocument();
    expect(scoped.getByText("2杯 / A卓")).toBeInTheDocument();
  });

  test("T10: モーダルはEscapeで閉じる", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "メニューを開く" }));
    expect(screen.getByRole("heading", { name: "メニュー" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "メニュー" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    expect(screen.getByRole("heading", { name: "来店者（グループ）管理" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "来店者（グループ）管理" })
      ).not.toBeInTheDocument();
    });
  });

  test("T11: モーダルを閉じるとトリガーへフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(<App />);

    const triggerButton = screen.getByRole("button", { name: "来店者を管理" });
    await user.click(triggerButton);
    expect(screen.getByRole("heading", { name: "来店者（グループ）管理" })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
