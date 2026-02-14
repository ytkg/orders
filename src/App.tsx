import { FormEvent, useMemo, useState } from "react";
import { MENU_ITEMS } from "./menu";

type OrderMemo = {
  id: number;
  drink: string;
  price: number;
  quantity: number;
  customer: string;
  createdAt: Date;
};

type Visitor = {
  id: number;
  name: string;
};

const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, index) =>
  String(index + 1)
);

function App() {
  const [selectedMenuId, setSelectedMenuId] = useState(MENU_ITEMS[0]?.id ?? 0);
  const [quantity, setQuantity] = useState("1");
  const [customer, setCustomer] = useState("");
  const [newVisitorName, setNewVisitorName] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [orders, setOrders] = useState<OrderMemo[]>([]);
  const [error, setError] = useState("");
  const [visitorError, setVisitorError] = useState("");

  const groupedMenu = useMemo(() => {
    const map = new Map<string, typeof MENU_ITEMS>();
    for (const item of MENU_ITEMS) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, []);

  const selectedMenuItem = useMemo(
    () => MENU_ITEMS.find((item) => item.id === selectedMenuId),
    [selectedMenuId]
  );

  const totalDrinks = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  );
  const totalAmount = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity * order.price, 0),
    [orders]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number.parseInt(quantity, 10);

    if (!selectedMenuItem) {
      setError("お酒を選択してください。");
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("個数は1以上の整数で入力してください。");
      return;
    }

    const nextOrder: OrderMemo = {
      id: Date.now(),
      drink: selectedMenuItem.name,
      price: selectedMenuItem.price,
      quantity: parsedQuantity,
      customer: customer.trim(),
      createdAt: new Date()
    };

    setOrders((prev) => [nextOrder, ...prev]);
    setQuantity("1");
    setCustomer("");
    setError("");
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
  };

  const removeVisitor = (id: number) => {
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
    setCustomer((prev) => {
      const target = visitors.find((visitor) => visitor.id === id);
      if (target && prev === target.name) {
        return "";
      }
      return prev;
    });
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

  return (
    <main className="page">
      <section className="panel">
        <h1>バー注文メモ</h1>
        <p className="subtitle">
          全メニューを一覧で見ながら選択して、注文メモを追加できます。
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="menu-browser">
            {groupedMenu.map(([menuCategory, items]) => (
              <section key={menuCategory} className="menu-category">
                <h3>{menuCategory}</h3>
                <div className="menu-items">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`menu-item${
                        selectedMenuId === item.id ? " active" : ""
                      }`}
                      onClick={() => setSelectedMenuId(item.id)}
                    >
                      <span>{item.name}</span>
                      <small>{item.price}円</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <label>
            個数
            <select
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            >
              {QUANTITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            注文者（任意）
            <select
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
            >
              <option value="">未選択</option>
              {visitors.map((visitor) => (
                <option key={visitor.id} value={visitor.name}>
                  {visitor.name}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="error">{error}</p> : null}
          {selectedMenuItem ? (
            <p className="subtitle">
              選択中: {selectedMenuItem.category} / {selectedMenuItem.name} (
              {selectedMenuItem.price}円)
            </p>
          ) : null}

          <button type="submit">メモを追加</button>
        </form>
      </section>

      <section className="panel">
        <h2>来店者（グループ）</h2>
        <p className="subtitle">注文者候補を事前に登録します。</p>
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
                <div>
                  <strong>{order.drink}</strong>
                  <p>
                    {order.quantity} 杯 ({order.price}円/杯) /{" "}
                    {order.customer || "注文者未入力"}
                  </p>
                  <label className="order-customer-edit">
                    注文者を変更
                    <select
                      value={order.customer}
                      onChange={(event) =>
                        updateOrderCustomer(order.id, event.target.value)
                      }
                    >
                      <option value="">未選択</option>
                      {visitors.map((visitor) => (
                        <option key={visitor.id} value={visitor.name}>
                          {visitor.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <small>{order.createdAt.toLocaleTimeString()}</small>
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
    </main>
  );
}

export default App;
