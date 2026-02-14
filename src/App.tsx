import { FormEvent, useMemo, useState } from "react";

type OrderMemo = {
  id: number;
  drink: string;
  quantity: number;
  customer: string;
  createdAt: Date;
};

const DRINK_OPTIONS = [
  "ビール",
  "ハイボール",
  "レモンサワー",
  "ジントニック",
  "モヒート",
  "ウイスキー",
  "赤ワイン",
  "白ワイン",
  "ノンアルコール"
];
const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, index) =>
  String(index + 1)
);

function App() {
  const [drink, setDrink] = useState(DRINK_OPTIONS[0]);
  const [quantity, setQuantity] = useState("1");
  const [customer, setCustomer] = useState("");
  const [orders, setOrders] = useState<OrderMemo[]>([]);
  const [error, setError] = useState("");

  const totalDrinks = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number.parseInt(quantity, 10);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("個数は1以上の整数で入力してください。");
      return;
    }

    const nextOrder: OrderMemo = {
      id: Date.now(),
      drink,
      quantity: parsedQuantity,
      customer: customer.trim(),
      createdAt: new Date()
    };

    setOrders((prev) => [nextOrder, ...prev]);
    setDrink(DRINK_OPTIONS[0]);
    setQuantity("1");
    setCustomer("");
    setError("");
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
          お酒の種類・個数をすばやく記録し、注文者は後から入力できます。
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            お酒
            <select
              value={drink}
              onChange={(event) => setDrink(event.target.value)}
            >
              {DRINK_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

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
            <input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="未入力でも追加できます"
            />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <button type="submit">メモを追加</button>
        </form>
      </section>

      <section className="panel">
        <h2>現在のメモ</h2>
        <p className="subtitle">
          {orders.length} 件 / 合計 {totalDrinks} 杯
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
                    {order.quantity} 杯 / {order.customer || "注文者未入力"}
                  </p>
                  <label className="order-customer-edit">
                    注文者を後入力
                    <input
                      value={order.customer}
                      onChange={(event) =>
                        updateOrderCustomer(order.id, event.target.value)
                      }
                      placeholder="例: A3席"
                    />
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
