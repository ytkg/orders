import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Grow, Snackbar } from "@mui/material";
import { ConfirmedOrdersDialog } from "../features/confirmed/components/ConfirmedOrdersDialog";
import { MenuDialog } from "../features/menu/components/MenuDialog";
import { groupMenuItemsByCategory } from "../features/menu/model/groupMenuItemsByCategory";
import { OrderList } from "../features/orders/components/OrderList";
import { useOrderMemo } from "../features/orders/hooks/useOrderMemo";
import { VisitorDialog } from "../features/visitors/components/VisitorDialog";
import type { Visitor } from "../features/visitors/model/types";
import {
  readVisitorsFromCookie,
  writeVisitorsToCookie
} from "../features/visitors/storage/visitorCookieStorage";
import { MENU_ITEMS } from "../menu";
import { generateId } from "../shared/utils/id";

function App() {
  const [newVisitorName, setNewVisitorName] = useState("");
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);
  const [isConfirmedDialogOpen, setIsConfirmedDialogOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>(() => readVisitorsFromCookie());
  const [visitorError, setVisitorError] = useState("");

  const {
    orders,
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
  } = useOrderMemo();

  const groupedMenu = useMemo(() => groupMenuItemsByCategory(MENU_ITEMS), []);

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

    setVisitors((prev) => [
      ...prev,
      {
        id: generateId("visitor"),
        name: normalized
      }
    ]);
    setNewVisitorName("");
    setVisitorError("");
    setIsVisitorDialogOpen(true);
  };

  const removeVisitor = (id: string) => {
    const removedVisitor = visitors.find((visitor) => visitor.id === id);
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));

    if (!removedVisitor) {
      return;
    }

    clearOrdersByCustomer(removedVisitor.name);
  };

  const handleResetDraftOrders = () => {
    if (orders.length === 0) {
      return;
    }

    const shouldReset = window.confirm("メモをリセットします。よろしいですか？");
    if (!shouldReset) {
      return;
    }

    resetDraftOrders();
  };

  const handleConfirmOrders = () => {
    if (confirmAllOrders()) {
      setIsConfirmedDialogOpen(true);
    }
  };

  useEffect(() => {
    writeVisitorsToCookie(visitors);
  }, [visitors]);

  return (
    <>
      <header className="fixed-header">
        <div className="fixed-header-inner">
          <h1>バー注文メモ</h1>
          <div className="header-actions">
            <Button variant="contained" onClick={() => setIsMenuDialogOpen(true)}>
              メニューを開く
            </Button>
            <Button
              variant="outlined"
              className="sub-button"
              onClick={() => setIsVisitorDialogOpen(true)}
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
          onDecrease={(id) => incrementOrderQuantity(id, -1)}
          onIncrease={(id) => incrementOrderQuantity(id, 1)}
          onCustomerChange={updateOrderCustomer}
          onRemove={removeOrder}
        />

        <footer className="fixed-footer">
          <div className="fixed-footer-inner">
            <Button
              variant="contained"
              className="confirm-button"
              disabled={orders.length === 0}
              onClick={handleConfirmOrders}
            >
              確認
            </Button>
            <Button
              variant="outlined"
              className="sub-button"
              disabled={orders.length === 0}
              onClick={handleResetDraftOrders}
            >
              メモをリセット
            </Button>
          </div>
        </footer>
      </main>

      <MenuDialog
        open={isMenuDialogOpen}
        groupedMenu={groupedMenu}
        onClose={() => setIsMenuDialogOpen(false)}
        onSelectMenuItem={addOrderFromMenu}
      />

      <VisitorDialog
        open={isVisitorDialogOpen}
        visitors={visitors}
        newVisitorName={newVisitorName}
        visitorError={visitorError}
        onClose={() => setIsVisitorDialogOpen(false)}
        onChangeNewVisitorName={setNewVisitorName}
        onSubmit={addVisitor}
        onRemoveVisitor={removeVisitor}
      />

      <ConfirmedOrdersDialog
        open={isConfirmedDialogOpen}
        groupedConfirmedOrders={groupedConfirmedOrders}
        confirmedTotalDrinks={confirmedTotalDrinks}
        onClose={() => setIsConfirmedDialogOpen(false)}
      />

      <Snackbar
        key={addedNotice?.id}
        open={Boolean(addedNotice)}
        autoHideDuration={1000}
        onClose={clearAddedNotice}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Grow}
        message={addedNotice ? `${addedNotice.name} を追加しました` : ""}
      />
    </>
  );
}

export default App;
