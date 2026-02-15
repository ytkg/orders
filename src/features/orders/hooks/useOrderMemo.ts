import { useMemo, useState } from "react";
import { MENU_ITEMS } from "../../../menu";
import { generateId } from "../../../shared/utils/id";
import { MAX_QUANTITY, MIN_QUANTITY } from "../model/constants";
import type { ConfirmedOrder, OrderMemo } from "../model/types";

type AddedNotice = {
  id: string;
  name: string;
};

export function useOrderMemo() {
  const [orders, setOrders] = useState<OrderMemo[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<ConfirmedOrder[]>([]);
  const [addedNotice, setAddedNotice] = useState<AddedNotice | null>(null);

  const totalDrinks = useMemo(
    () => orders.reduce((sum, order) => sum + order.quantity, 0),
    [orders]
  );

  const confirmedTotalDrinks = useMemo(
    () => confirmedOrders.reduce((sum, order) => sum + order.quantity, 0),
    [confirmedOrders]
  );

  const groupedConfirmedOrders = useMemo(() => {
    const grouped = new Map<string, { drink: string; customer: string; quantity: number }>();

    for (const order of confirmedOrders) {
      const key = `${order.drink}__${order.customer}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.quantity += order.quantity;
        continue;
      }
      grouped.set(key, {
        drink: order.drink,
        customer: order.customer,
        quantity: order.quantity
      });
    }

    return Array.from(grouped.values());
  }, [confirmedOrders]);

  const addOrderFromMenu = (menuId: number) => {
    const selected = MENU_ITEMS.find((item) => item.id === menuId);
    if (!selected) {
      return;
    }

    const nextOrder: OrderMemo = {
      id: generateId("order"),
      drink: selected.name,
      price: selected.price,
      quantity: 1,
      customer: "",
      createdAt: new Date()
    };

    setOrders((prev) => [nextOrder, ...prev]);
    setAddedNotice({
      id: generateId("notice"),
      name: selected.name
    });
  };

  const clearAddedNotice = () => {
    setAddedNotice(null);
  };

  const removeOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const updateOrderCustomer = (id: string, nextCustomer: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, customer: nextCustomer } : order))
    );
  };

  const clearOrdersByCustomer = (customerName: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.customer === customerName ? { ...order, customer: "" } : order
      )
    );
  };

  const incrementOrderQuantity = (id: string, delta: number) => {
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

  const resetDraftOrders = () => {
    setOrders([]);
  };

  const confirmAllOrders = () => {
    if (orders.length === 0) {
      return false;
    }

    const confirmedAt = new Date();
    const nextConfirmed = orders.map((order) => ({
      ...order,
      confirmedAt
    }));

    setConfirmedOrders(nextConfirmed);
    return true;
  };

  return {
    orders,
    confirmedOrders,
    groupedConfirmedOrders,
    totalDrinks,
    confirmedTotalDrinks,
    addedNotice,
    addOrderFromMenu,
    clearAddedNotice,
    removeOrder,
    updateOrderCustomer,
    clearOrdersByCustomer,
    incrementOrderQuantity,
    resetDraftOrders,
    confirmAllOrders
  };
}
