import { FormEvent, useMemo, useState } from "react";

type OrderMemo = {
  id: number;
  drink: string;
  quantity: number;
  customer: string;
  createdAt: Date;
};

function App() {
  const [drink, setDrink] = useState("");
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

    if (!drink.trim() || !customer.trim()) {
      setError("Drink and customer are required.");
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive integer.");
      return;
    }

    const nextOrder: OrderMemo = {
      id: Date.now(),
      drink: drink.trim(),
      quantity: parsedQuantity,
      customer: customer.trim(),
      createdAt: new Date()
    };

    setOrders((prev) => [nextOrder, ...prev]);
    setDrink("");
    setQuantity("1");
    setCustomer("");
    setError("");
  };

  const removeOrder = (id: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <main className="page">
      <section className="panel">
        <h1>Bar Order Memo</h1>
        <p className="subtitle">Record drink, quantity, and customer on screen.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Drink
            <input
              value={drink}
              onChange={(event) => setDrink(event.target.value)}
              placeholder="e.g. Gin and tonic"
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>

          <label>
            Customer
            <input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="e.g. Seat A3"
            />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <button type="submit">Add Memo</button>
        </form>
      </section>

      <section className="panel">
        <h2>Current Memos</h2>
        <p className="subtitle">
          {orders.length} memos / {totalDrinks} drinks
        </p>

        {orders.length === 0 ? (
          <p className="empty">No memos yet.</p>
        ) : (
          <ul className="orders">
            {orders.map((order) => (
              <li key={order.id} className="order">
                <div>
                  <strong>{order.drink}</strong>
                  <p>
                    x{order.quantity} for {order.customer}
                  </p>
                  <small>{order.createdAt.toLocaleTimeString()}</small>
                </div>
                <button
                  type="button"
                  className="remove"
                  onClick={() => removeOrder(order.id)}
                >
                  Remove
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
