import { Button, Dialog, DialogContent } from "@mui/material";
import type { MenuItem } from "../../../menu";

type MenuDialogProps = {
  open: boolean;
  groupedMenu: Array<[string, MenuItem[]]>;
  onClose: () => void;
  onSelectMenuItem: (menuId: number) => void;
};

export function MenuDialog({
  open,
  groupedMenu,
  onClose,
  onSelectMenuItem
}: MenuDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      transitionDuration={0}
      aria-labelledby="menu-dialog-title"
    >
      <div className="dialog-title-wrapper dialog-header">
        <h2 id="menu-dialog-title" className="dialog-title-text">
          メニュー
        </h2>
        <Button variant="outlined" className="sub-button" onClick={onClose}>
          閉じる
        </Button>
      </div>
      <DialogContent dividers>
        <p className="subtitle">
          お酒をタップすると個数1・注文者未設定で追加されます。
        </p>
        <div className="menu-browser">
          {groupedMenu.map(([menuCategory, items]) => (
            <section key={menuCategory} className="menu-category">
              <h3>{menuCategory}</h3>
              <div className="menu-items">
                {items.map((item) => (
                  <Button
                    key={item.id}
                    variant="outlined"
                    className="menu-item"
                    onClick={() => onSelectMenuItem(item.id)}
                  >
                    <span>{item.name}</span>
                    <small>{item.price}円</small>
                  </Button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
