import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";

type GroupedConfirmedOrder = {
  drink: string;
  customer: string;
  quantity: number;
};

type ConfirmedOrdersDialogProps = {
  open: boolean;
  groupedConfirmedOrders: GroupedConfirmedOrder[];
  confirmedTotalDrinks: number;
  onClose: () => void;
};

export function ConfirmedOrdersDialog({
  open,
  groupedConfirmedOrders,
  confirmedTotalDrinks,
  onClose
}: ConfirmedOrdersDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      transitionDuration={0}
      aria-labelledby="confirmed-orders-dialog-title"
    >
      <div className="dialog-title-wrapper dialog-header">
        <h2 id="confirmed-orders-dialog-title" className="dialog-title-text">
          確定オーダー
        </h2>
        <Button variant="outlined" className="sub-button" onClick={onClose}>
          閉じる
        </Button>
      </div>

      <DialogContent dividers>
        <p className="subtitle">
          {groupedConfirmedOrders.length} 件 / 合計 {confirmedTotalDrinks} 杯
        </p>

        {groupedConfirmedOrders.length === 0 ? (
          <p className="empty">確定済みオーダーはありません。</p>
        ) : (
          <ul className="confirmed-orders">
            {groupedConfirmedOrders.map((order) => (
              <li
                key={`${order.drink}__${order.customer}`}
                className="confirmed-order"
              >
                <strong>{order.drink}</strong>
                <p>
                  {order.quantity}杯 / {order.customer || "注文者未入力"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          通常表示へ戻る
        </Button>
      </DialogActions>
    </Dialog>
  );
}
