import { useMemo } from "react";
import { OrderMemoPageView } from "./components/OrderMemoPageView";
import { useOrderMemoViewController } from "./hooks/useOrderMemoViewController";
import { groupMenuItemsByCategory } from "../features/menu/model/groupMenuItemsByCategory";
import { MENU_ITEMS } from "../features/menu/model/menuItems";
import { useOrderMemo } from "../features/orders/hooks/useOrderMemo";
import { useVisitorRegistry } from "../features/visitors/hooks/useVisitorRegistry";

function App() {
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

  const {
    visitors,
    newVisitorName,
    visitorError,
    setNewVisitorName,
    addVisitor,
    removeVisitor
  } = useVisitorRegistry({ onVisitorRemoved: clearOrdersByCustomer });

  const {
    isMenuDialogOpen,
    isVisitorDialogOpen,
    isConfirmedDialogOpen,
    openMenuDialog,
    closeMenuDialog,
    openVisitorDialog,
    closeVisitorDialog,
    closeConfirmedDialog,
    handleConfirmOrders,
    handleResetDraftOrders
  } = useOrderMemoViewController({
    hasOrders: orders.length > 0,
    confirmAllOrders,
    resetDraftOrders
  });

  const groupedMenu = useMemo(() => groupMenuItemsByCategory(MENU_ITEMS), []);

  return (
    <OrderMemoPageView
      orders={orders}
      visitors={visitors}
      groupedMenu={groupedMenu}
      groupedConfirmedOrders={groupedConfirmedOrders}
      totalDrinks={totalDrinks}
      confirmedTotalDrinks={confirmedTotalDrinks}
      addedNotice={addedNotice}
      newVisitorName={newVisitorName}
      visitorError={visitorError}
      isMenuDialogOpen={isMenuDialogOpen}
      isVisitorDialogOpen={isVisitorDialogOpen}
      isConfirmedDialogOpen={isConfirmedDialogOpen}
      onOpenMenuDialog={openMenuDialog}
      onOpenVisitorDialog={openVisitorDialog}
      onCloseMenuDialog={closeMenuDialog}
      onCloseVisitorDialog={closeVisitorDialog}
      onCloseConfirmedDialog={closeConfirmedDialog}
      onChangeNewVisitorName={setNewVisitorName}
      onAddVisitor={addVisitor}
      onRemoveVisitor={removeVisitor}
      onAddOrderFromMenu={addOrderFromMenu}
      onDecreaseOrder={(id) => incrementOrderQuantity(id, -1)}
      onIncreaseOrder={(id) => incrementOrderQuantity(id, 1)}
      onChangeOrderCustomer={updateOrderCustomer}
      onRemoveOrder={removeOrder}
      onConfirmOrders={handleConfirmOrders}
      onResetDraftOrders={handleResetDraftOrders}
      onClearAddedNotice={clearAddedNotice}
    />
  );
}

export default App;
