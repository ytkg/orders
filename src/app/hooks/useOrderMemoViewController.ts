import { useState } from "react";

type UseOrderMemoViewControllerOptions = {
  hasOrders: boolean;
  confirmAllOrders: () => boolean;
  resetDraftOrders: () => void;
};

export function useOrderMemoViewController({
  hasOrders,
  confirmAllOrders,
  resetDraftOrders
}: UseOrderMemoViewControllerOptions) {
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);
  const [isConfirmedDialogOpen, setIsConfirmedDialogOpen] = useState(false);

  const handleConfirmOrders = () => {
    if (confirmAllOrders()) {
      setIsConfirmedDialogOpen(true);
    }
  };

  const handleResetDraftOrders = () => {
    if (!hasOrders) {
      return;
    }

    const shouldReset = window.confirm("メモをリセットします。よろしいですか？");
    if (!shouldReset) {
      return;
    }

    resetDraftOrders();
  };

  return {
    isMenuDialogOpen,
    isVisitorDialogOpen,
    isConfirmedDialogOpen,
    openMenuDialog: () => setIsMenuDialogOpen(true),
    closeMenuDialog: () => setIsMenuDialogOpen(false),
    openVisitorDialog: () => setIsVisitorDialogOpen(true),
    closeVisitorDialog: () => setIsVisitorDialogOpen(false),
    closeConfirmedDialog: () => setIsConfirmedDialogOpen(false),
    handleConfirmOrders,
    handleResetDraftOrders
  };
}
