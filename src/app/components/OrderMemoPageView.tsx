import type { FormEvent } from "react";
import { Button, Grow, Snackbar } from "@mui/material";
import { ConfirmedOrdersDialog } from "../../features/confirmed/components/ConfirmedOrdersDialog";
import { MenuDialog } from "../../features/menu/components/MenuDialog";
import type { MenuItem } from "../../features/menu/model/menuItems";
import { OrderList } from "../../features/orders/components/OrderList";
import type { OrderMemo } from "../../features/orders/model/types";
import { VisitorDialog } from "../../features/visitors/components/VisitorDialog";
import type { Visitor } from "../../features/visitors/model/types";

type GroupedConfirmedOrder = {
  drink: string;
  customer: string;
  quantity: number;
};

type AddedNotice = {
  id: string;
  name: string;
} | null;

type OrderMemoPageViewProps = {
  orders: OrderMemo[];
  visitors: Visitor[];
  groupedMenu: Array<[string, MenuItem[]]>;
  groupedConfirmedOrders: GroupedConfirmedOrder[];
  totalDrinks: number;
  confirmedTotalDrinks: number;
  addedNotice: AddedNotice;
  newVisitorName: string;
  visitorError: string;
  isMenuDialogOpen: boolean;
  isVisitorDialogOpen: boolean;
  isConfirmedDialogOpen: boolean;
  onOpenMenuDialog: () => void;
  onOpenVisitorDialog: () => void;
  onCloseMenuDialog: () => void;
  onCloseVisitorDialog: () => void;
  onCloseConfirmedDialog: () => void;
  onChangeNewVisitorName: (name: string) => void;
  onAddVisitor: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveVisitor: (id: string) => void;
  onAddOrderFromMenu: (menuItem: MenuItem) => void;
  onDecreaseOrder: (id: string) => void;
  onIncreaseOrder: (id: string) => void;
  onChangeOrderCustomer: (id: string, customer: string) => void;
  onRemoveOrder: (id: string) => void;
  onConfirmOrders: () => void;
  onResetDraftOrders: () => void;
  onClearAddedNotice: () => void;
};

export function OrderMemoPageView({
  orders,
  visitors,
  groupedMenu,
  groupedConfirmedOrders,
  totalDrinks,
  confirmedTotalDrinks,
  addedNotice,
  newVisitorName,
  visitorError,
  isMenuDialogOpen,
  isVisitorDialogOpen,
  isConfirmedDialogOpen,
  onOpenMenuDialog,
  onOpenVisitorDialog,
  onCloseMenuDialog,
  onCloseVisitorDialog,
  onCloseConfirmedDialog,
  onChangeNewVisitorName,
  onAddVisitor,
  onRemoveVisitor,
  onAddOrderFromMenu,
  onDecreaseOrder,
  onIncreaseOrder,
  onChangeOrderCustomer,
  onRemoveOrder,
  onConfirmOrders,
  onResetDraftOrders,
  onClearAddedNotice
}: OrderMemoPageViewProps) {
  return (
    <>
      <header className="fixed-header">
        <div className="fixed-header-inner">
          <h1>バー注文メモ</h1>
          <div className="header-actions">
            <Button variant="contained" onClick={onOpenMenuDialog}>
              メニューを開く
            </Button>
            <Button
              variant="outlined"
              className="sub-button"
              onClick={onOpenVisitorDialog}
            >
              来店者を管理
            </Button>
          </div>
        </div>
      </header>

      <main className="page">
        <OrderList
          orders={orders}
          visitors={visitors}
          totalDrinks={totalDrinks}
          onDecrease={onDecreaseOrder}
          onIncrease={onIncreaseOrder}
          onCustomerChange={onChangeOrderCustomer}
          onRemove={onRemoveOrder}
        />

        <footer className="fixed-footer">
          <div className="fixed-footer-inner">
            <Button
              variant="contained"
              className="confirm-button"
              disabled={orders.length === 0}
              onClick={onConfirmOrders}
            >
              確認
            </Button>
            <Button
              variant="outlined"
              className="sub-button"
              disabled={orders.length === 0}
              onClick={onResetDraftOrders}
            >
              メモをリセット
            </Button>
          </div>
        </footer>
      </main>

      <MenuDialog
        open={isMenuDialogOpen}
        groupedMenu={groupedMenu}
        onClose={onCloseMenuDialog}
        onSelectMenuItem={onAddOrderFromMenu}
      />

      <VisitorDialog
        open={isVisitorDialogOpen}
        visitors={visitors}
        newVisitorName={newVisitorName}
        visitorError={visitorError}
        onClose={onCloseVisitorDialog}
        onChangeNewVisitorName={onChangeNewVisitorName}
        onSubmit={onAddVisitor}
        onRemoveVisitor={onRemoveVisitor}
      />

      <ConfirmedOrdersDialog
        open={isConfirmedDialogOpen}
        groupedConfirmedOrders={groupedConfirmedOrders}
        confirmedTotalDrinks={confirmedTotalDrinks}
        onClose={onCloseConfirmedDialog}
      />

      <Snackbar
        key={addedNotice?.id}
        open={Boolean(addedNotice)}
        autoHideDuration={1000}
        onClose={onClearAddedNotice}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Grow}
        message={addedNotice ? `${addedNotice.name} を追加しました` : ""}
      />
    </>
  );
}
