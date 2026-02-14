import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MENU_ITEMS } from "./menu";

type OrderMemo = {
  id: number;
  drink: string;
  price: number;
  quantity: number;
  customer: string;
  createdAt: Date;
};
type ConfirmedOrder = OrderMemo & {
  confirmedAt: Date;
};

type Visitor = {
  id: number;
  name: string;
};

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

function App() {
  const [newVisitorName, setNewVisitorName] = useState("");
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isConfirmedViewOpen, setIsConfirmedViewOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [orders, setOrders] = useState<OrderMemo[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<ConfirmedOrder[]>([]);
  const [visitorError, setVisitorError] = useState("");
  const holdStartTimeoutRef = useRef<Map<number, number>>(new Map());
  const holdIntervalRef = useRef<Map<number, number>>(new Map());
  const suppressClickRef = useRef<Set<number>>(new Set());

  const groupedMenu = useMemo(() => {
    const map = new Map<string, typeof MENU_ITEMS>();
    for (const item of MENU_ITEMS) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, []);

  const totalDrinks = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  );
  const totalAmount = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity * order.price, 0),
    [orders]
  );
  const confirmedTotalDrinks = useMemo(
    () => confirmedOrders.reduce((sum, order) => sum + order.quantity, 0),
    [confirmedOrders]
  );
  const confirmedTotalAmount = useMemo(
    () =>
      confirmedOrders.reduce((sum, order) => sum + order.quantity * order.price, 0),
    [confirmedOrders]
  );

  const addOrderFromMenu = (menuId: number) => {
    const selected = MENU_ITEMS.find((item) => item.id === menuId);
    if (!selected) {
      return;
    }

    const nextOrder: OrderMemo = {
      id: Date.now(),
      drink: selected.name,
      price: selected.price,
      quantity: 1,
      customer: "",
      createdAt: new Date()
    };
    setOrders((prev) => [nextOrder, ...prev]);
  };

  const addVisitor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = newVisitorName.trim();

    if (!normalized) {
      setVisitorError("来店者名を入力してください。");
      return;
    }
    if (visitors.some((visitor) => visitor.name === normalized)) {
      setVisitorError("同じ来店者名は登録できません。");
      return;
    }

    const nextVisitor: Visitor = {
      id: Date.now(),
      name: normalized
    };
    setVisitors((prev) => [...prev, nextVisitor]);
    setNewVisitorName("");
    setVisitorError("");
    setIsVisitorModalOpen(true);
  };

  const removeVisitor = (id: number) => {
    const removed = visitors.find((visitor) => visitor.id === id);
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
    if (!removed) {
      return;
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.customer === removed.name ? { ...order, customer: "" } : order
      )
    );
  };

  const removeOrder = (id: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const updateOrderCustomer = (id: number, nextCustomer: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, customer: nextCustomer } : order
      )
    );
  };

  const updateOrderQuantity = (id: number, nextQuantity: number) => {
    const clamped = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, nextQuantity));
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, quantity: clamped } : order
      )
    );
  };
  const confirmAllOrders = () => {
    if (orders.length === 0) {
      return;
    }
    const confirmedAt = new Date();
    const nextConfirmed = orders.map((order) => ({
      ...order,
      confirmedAt
    }));
    setConfirmedOrders(nextConfirmed);
    setIsConfirmedViewOpen(true);
  };
  const resetDraftOrders = () => {
    if (orders.length === 0) {
      return;
    }
    const shouldReset = window.confirm("メモをリセットします。よろしいですか？");
    if (!shouldReset) {
      return;
    }
    setOrders([]);
  };
  const incrementOrderQuantity = (id: number, delta: number) => {
    let reachedMax = false;
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        const nextQuantity = Math.min(
          MAX_QUANTITY,
          Math.max(MIN_QUANTITY, order.quantity + delta)
        );
        if (nextQuantity === MAX_QUANTITY) {
          reachedMax = true;
        }
        return { ...order, quantity: nextQuantity };
      })
    );
    return reachedMax;
  };
  const clearIncrementTimers = (id: number) => {
    const timeoutId = holdStartTimeoutRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      holdStartTimeoutRef.current.delete(id);
    }
    const intervalId = holdIntervalRef.current.get(id);
    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
      holdIntervalRef.current.delete(id);
    }
  };
  const handlePlusPointerDown = (id: number) => {
    clearIncrementTimers(id);
    const timeoutId = window.setTimeout(() => {
      suppressClickRef.current.add(id);
      const reachedMaxAtStart = incrementOrderQuantity(id, 1);
      if (reachedMaxAtStart) {
        clearIncrementTimers(id);
        return;
      }
      const intervalId = window.setInterval(() => {
        const reachedMax = incrementOrderQuantity(id, 1);
        if (reachedMax) {
          clearIncrementTimers(id);
        }
      }, 100);
      holdIntervalRef.current.set(id, intervalId);
    }, 300);
    holdStartTimeoutRef.current.set(id, timeoutId);
  };
  const handlePlusPointerStop = (id: number) => {
    clearIncrementTimers(id);
  };
  const handlePlusClick = (id: number) => {
    if (suppressClickRef.current.has(id)) {
      suppressClickRef.current.delete(id);
      return;
    }
    incrementOrderQuantity(id, 1);
  };

  useEffect(() => {
    return () => {
      holdStartTimeoutRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      holdIntervalRef.current.forEach((intervalId) => {
        window.clearInterval(intervalId);
      });
    };
  }, []);

  return (
    <>
      <header className="fixed-header">
        <div className="fixed-header-inner">
          <h1>バー注文メモ</h1>
        </div>
      </header>
      <main className="page">
      <section className="panel">
        <h2>現在のメモ</h2>
        <p className="subtitle">
          {orders.length} 件 / 合計 {totalDrinks} 杯 / {totalAmount}円
        </p>

        {orders.length === 0 ? (
          <p className="empty">まだメモはありません。</p>
        ) : (
          <ul className="orders">
            {orders.map((order) => (
              <li key={order.id} className="order">
                <div className="order-main">
                  <div className="order-head">
                    <strong>{order.drink}</strong>
                    <span className="order-sum">
                      {order.quantity * order.price}円
                    </span>
                  </div>
                  <p className="order-meta">
                    {order.quantity}杯 x {order.price}円 /{" "}
                    {order.customer || "注文者未入力"} /{" "}
                    {order.createdAt.toLocaleTimeString()}
                  </p>
                  <div className="order-controls">
                    <div className="stepper" role="group" aria-label="個数ステッパー">
                      <button
                        type="button"
                        className="stepper-button"
                        aria-label="個数を1減らす"
                        onClick={() => incrementOrderQuantity(order.id, -1)}
                      >
                        -
                      </button>
                      <span className="stepper-value" aria-live="polite">
                        {order.quantity}
                      </span>
                      <button
                        type="button"
                        className="stepper-button"
                        aria-label="個数を1増やす"
                        onClick={() => handlePlusClick(order.id)}
                        onPointerDown={() => handlePlusPointerDown(order.id)}
                        onPointerUp={() => handlePlusPointerStop(order.id)}
                        onPointerCancel={() => handlePlusPointerStop(order.id)}
                        onPointerLeave={() => handlePlusPointerStop(order.id)}
                      >
                        +
                      </button>
                    </div>
                    <select
                      aria-label="注文者を選択"
                      value={order.customer}
                      onChange={(event) =>
                        updateOrderCustomer(order.id, event.target.value)
                      }
                    >
                      <option value="">注文者</option>
                      {visitors.map((visitor) => (
                        <option key={visitor.id} value={visitor.name}>
                          {visitor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove"
                  onClick={() => removeOrder(order.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="fixed-footer">
        <div className="fixed-footer-inner">
          <button
            type="button"
            className="confirm-button"
            disabled={orders.length === 0}
            onClick={confirmAllOrders}
          >
            確認
          </button>
          <button type="button" onClick={() => setIsMenuDrawerOpen(true)}>
            メニューを開く
          </button>
          <button
            type="button"
            className="sub-button"
            disabled={orders.length === 0}
            onClick={resetDraftOrders}
          >
            メモをリセット
          </button>
          <button
            type="button"
            className="sub-button"
            onClick={() => setIsVisitorModalOpen(true)}
          >
            来店者を管理
          </button>
        </div>
      </footer>

      {isMenuDrawerOpen ? (
        <div
          className="drawer-backdrop"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <section
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>メニュー</h2>
              <button
                type="button"
                className="sub-button"
                onClick={() => setIsMenuDrawerOpen(false)}
              >
                閉じる
              </button>
            </div>
            <p className="subtitle">
              お酒をタップすると個数1・注文者未設定で追加されます。
            </p>
            <div className="menu-browser">
              {groupedMenu.map(([menuCategory, items]) => (
                <section key={menuCategory} className="menu-category">
                  <h3>{menuCategory}</h3>
                  <div className="menu-items">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="menu-item"
                        onClick={() => {
                          addOrderFromMenu(item.id);
                          setIsMenuDrawerOpen(false);
                        }}
                      >
                        <span>{item.name}</span>
                        <small>{item.price}円</small>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {isVisitorModalOpen ? (
        <div
          className="modal-backdrop"
          onClick={() => setIsVisitorModalOpen(false)}
        >
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>来店者（グループ）管理</h2>
              <button
                type="button"
                className="sub-button"
                onClick={() => setIsVisitorModalOpen(false)}
              >
                閉じる
              </button>
            </div>
            <p className="subtitle">注文者候補を追加・削除できます。</p>
            <form className="form" onSubmit={addVisitor}>
              <label>
                来店者名
                <input
                  value={newVisitorName}
                  onChange={(event) => setNewVisitorName(event.target.value)}
                  placeholder="例: A卓 / 田中さんグループ"
                />
              </label>
              {visitorError ? <p className="error">{visitorError}</p> : null}
              <button type="submit">来店者を追加</button>
            </form>
            {visitors.length === 0 ? (
              <p className="empty">来店者はまだ登録されていません。</p>
            ) : (
              <ul className="visitors">
                {visitors.map((visitor) => (
                  <li key={visitor.id} className="visitor">
                    <span>{visitor.name}</span>
                    <button
                      type="button"
                      className="remove"
                      onClick={() => removeVisitor(visitor.id)}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
      {isConfirmedViewOpen ? (
        <div
          className="confirm-backdrop"
          onClick={() => setIsConfirmedViewOpen(false)}
        >
          <section
            className="confirm-view"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>確定オーダー</h2>
              <button
                type="button"
                className="sub-button"
                onClick={() => setIsConfirmedViewOpen(false)}
              >
                閉じる
              </button>
            </div>
            <p className="subtitle">
              {confirmedOrders.length} 件 / 合計 {confirmedTotalDrinks} 杯 /{" "}
              {confirmedTotalAmount}円
            </p>
            {confirmedOrders.length === 0 ? (
              <p className="empty">確定済みオーダーはありません。</p>
            ) : (
              <ul className="confirmed-orders">
                {confirmedOrders.map((order) => (
                  <li key={order.id} className="confirmed-order">
                    <strong>{order.drink}</strong>
                    <p>
                      {order.quantity}杯 / {order.customer || "注文者未入力"}
                    </p>
                    <small>
                      {order.quantity * order.price}円 / 確定{" "}
                      {order.confirmedAt.toLocaleTimeString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
            <div className="confirm-actions">
              <button type="button" onClick={() => setIsConfirmedViewOpen(false)}>
                通常表示へ戻る
              </button>
            </div>
          </section>
        </div>
      ) : null}
      </main>
    </>
  );
}

export default App;
