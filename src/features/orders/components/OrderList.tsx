import { Button } from "@mui/material";
import type { Visitor } from "../../visitors/model/types";
import type { OrderMemo } from "../model/types";

type OrderListProps = {
  orders: OrderMemo[];
  visitors: Visitor[];
  totalDrinks: number;
  onDecrease: (id: string) => void;
  onIncrease: (id: string) => void;
  onCustomerChange: (id: string, customer: string) => void;
  onRemove: (id: string) => void;
};

export function OrderList({
  orders,
  visitors,
  totalDrinks,
  onDecrease,
  onIncrease,
  onCustomerChange,
  onRemove
}: OrderListProps) {
  return (
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
              <div className="order-main">
                <div className="order-head">
                  <strong>{order.drink}</strong>
                </div>
                <p className="order-meta">
                  {order.quantity}杯 / {order.customer || "注文者未入力"}
                </p>
                <div className="order-controls">
                  <div className="stepper" role="group" aria-label="個数ステッパー">
                    <button
                      type="button"
                      className="stepper-button"
                      aria-label="個数を1減らす"
                      onClick={() => onDecrease(order.id)}
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
                      onClick={() => onIncrease(order.id)}
                    >
                      +
                    </button>
                  </div>

                  <select
                    className="order-customer-select"
                    aria-label="注文者を選択"
                    value={order.customer}
                    onChange={(event) => onCustomerChange(order.id, event.target.value)}
                  >
                    <option value="">未選択</option>
                    {visitors.map((visitor) => (
                      <option key={visitor.id} value={visitor.name}>
                        {visitor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                variant="outlined"
                className="remove"
                onClick={() => onRemove(order.id)}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
