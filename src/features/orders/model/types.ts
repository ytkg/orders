export type OrderMemo = {
  id: string;
  drink: string;
  price: number;
  quantity: number;
  customer: string;
  createdAt: Date;
};

export type ConfirmedOrder = OrderMemo & {
  confirmedAt: Date;
};
