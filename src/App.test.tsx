import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import App from "./app/App";

function getDialogByName(name: string) {
  return screen.getByRole("dialog", { name });
}

function getOrderSection() {
  const heading = screen.getByRole("heading", { name: "現在のメモ", hidden: true });
  const section = heading.closest("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

function getOrderRows(options?: { includeHidden?: boolean }) {
  return within(getOrderSection()).getAllByRole("listitem", {
    hidden: options?.includeHidden ?? false
  });
}

async function addOrderFromMenu(
  user: ReturnType<typeof userEvent.setup>,
  options?: { keepMenuOpen?: boolean }
) {
  await user.click(screen.getByRole("button", { name: "メニューを開く" }));
  const menuDialog = getDialogByName("メニュー");
  const menuDialogScope = within(menuDialog);
  await user.click(menuDialogScope.getByRole("button", { name: /ハイボール/ }));
  if (!options?.keepMenuOpen) {
    await user.click(menuDialogScope.getByRole("button", { name: "閉じる" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "メニュー" })).not.toBeInTheDocument();
    });
  }
}

async function addHighballOrders(
  user: ReturnType<typeof userEvent.setup>,
  count: number
) {
  await user.click(screen.getByRole("button", { name: "メニューを開く" }));
  const menuDialog = getDialogByName("メニュー");
  const menuDialogScope = within(menuDialog);

  for (let i = 0; i < count; i += 1) {
    await user.click(menuDialogScope.getByRole("button", { name: /ハイボール/ }));
  }

  await user.click(menuDialogScope.getByRole("button", { name: "閉じる" }));
  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "メニュー" })).not.toBeInTheDocument();
  });
}

async function addVisitor(
  user: ReturnType<typeof userEvent.setup>,
  visitorName: string
) {
  await user.click(screen.getByRole("button", { name: "来店者を管理" }));
  const visitorDialog = getDialogByName("来店者（グループ）管理");
  const visitorDialogScope = within(visitorDialog);
  await user.type(
    visitorDialogScope.getByRole("textbox", { name: "来店者名" }),
    visitorName
  );
  await user.click(visitorDialogScope.getByRole("button", { name: "来店者を追加" }));
}

async function closeVisitorDialog(user: ReturnType<typeof userEvent.setup>) {
  const visitorDialog = getDialogByName("来店者（グループ）管理");
  const visitorDialogScope = within(visitorDialog);
  await user.click(visitorDialogScope.getByRole("button", { name: "閉じる" }));
  await waitFor(() => {
    expect(screen.queryByRole("dialog", { name: "来店者（グループ）管理" })).not.toBeInTheDocument();
  });
}

function getFirstOrderRow(options?: { includeHidden?: boolean }) {
  return getOrderRows(options)[0] as HTMLLIElement;
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

    expect(screen.getByRole("dialog", { name: "メニュー" })).toBeInTheDocument();
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

  test("T4: 個数変更（UI連打）", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);
    const row = getFirstOrderRow();
    const plusButton = within(row).getByRole("button", { name: "個数を1増やす" });

    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(plusButton);
    }

    expect(within(row).getByText("6")).toBeInTheDocument();
  });

  test("T5: 注文者変更", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);

    await addVisitor(user, "田中グループ");
    await closeVisitorDialog(user);

    const row = getFirstOrderRow();
    const combobox = within(row).getByRole("combobox");
    await user.selectOptions(combobox, "田中グループ");
    expect(combobox).toHaveValue("田中グループ");
  });

  test("T6: 来店者追加と重複エラー", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    const visitorDialog = getDialogByName("来店者（グループ）管理");
    const visitorDialogScope = within(visitorDialog);
    const input = visitorDialogScope.getByRole("textbox", { name: "来店者名" });
    await user.type(input, "A卓");
    await user.click(visitorDialogScope.getByRole("button", { name: "来店者を追加" }));
    expect(visitorDialogScope.getByText(/A卓/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "A卓");
    await user.click(visitorDialogScope.getByRole("button", { name: "来店者を追加" }));
    expect(visitorDialogScope.getByText("同じ来店者名は登録できません。")).toBeInTheDocument();
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
    expect(within(getFirstOrderRow()).getByText("ハイボール")).toBeInTheDocument();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "メモをリセット" }));
    expect(within(getOrderSection()).getByText("まだメモはありません。")).toBeInTheDocument();
  });

  test("T9-1: 来店者登録後に注文者候補として選択できる", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addOrderFromMenu(user);

    await addVisitor(user, "A卓");
    await closeVisitorDialog(user);

    const row = getFirstOrderRow();
    const combobox = within(row).getByRole("combobox");
    await user.selectOptions(combobox, "A卓");
    expect(combobox).toHaveValue("A卓");
  });

  test("T9-2: 同一商品を連続追加して2件の注文行を作れる", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addHighballOrders(user, 2);

    const rows = getOrderRows();
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("ハイボール")).toBeInTheDocument();
    expect(within(rows[1]).getByText("ハイボール")).toBeInTheDocument();
  });

  test("T9-3: 確認画面で同一商品・同一注文者を合算表示", async () => {
    const user = userEvent.setup();
    render(<App />);

    await addVisitor(user, "A卓");
    await closeVisitorDialog(user);
    await addHighballOrders(user, 2);

    const rows = getOrderRows();
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
    expect(screen.getByRole("dialog", { name: "メニュー" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "メニュー" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "来店者を管理" }));
    expect(screen.getByRole("dialog", { name: "来店者（グループ）管理" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "来店者（グループ）管理" })).not.toBeInTheDocument();
    });
  });

  test("T11: モーダルを閉じるとトリガーへフォーカスが戻る", async () => {
    const user = userEvent.setup();
    render(<App />);

    const triggerButton = screen.getByRole("button", { name: "来店者を管理" });
    await user.click(triggerButton);
    expect(screen.getByRole("dialog", { name: "来店者（グループ）管理" })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
