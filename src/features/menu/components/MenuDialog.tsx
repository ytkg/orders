import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, DialogContent, Tab, Tabs } from "@mui/material";
import type { MenuItem } from "../model/menuItems";

type MenuDialogProps = {
  open: boolean;
  groupedMenu: Array<[string, MenuItem[]]>;
  onClose: () => void;
  onSelectMenuItem: (menuItem: MenuItem) => void;
};

const ALL_CATEGORIES = "__all__";
const MENU_SCROLL_TOP_PADDING = 8;

export function MenuDialog({
  open,
  groupedMenu,
  onClose,
  onSelectMenuItem
}: MenuDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const menuBrowserRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRef = useRef<Map<string, HTMLElement>>(new Map());

  const menuCategories = useMemo(
    () => groupedMenu.map(([menuCategory]) => menuCategory),
    [groupedMenu]
  );
  const hasMenuItems = groupedMenu.length > 0;

  useEffect(() => {
    if (open) {
      return;
    }

    setSelectedCategory(ALL_CATEGORIES);
  }, [open]);

  useEffect(() => {
    if (selectedCategory === ALL_CATEGORIES) {
      return;
    }

    if (menuCategories.includes(selectedCategory)) {
      return;
    }

    setSelectedCategory(ALL_CATEGORIES);
  }, [menuCategories, selectedCategory]);

  const handleCategoryChange = (_event: SyntheticEvent, value: string) => {
    setSelectedCategory(value);

    const menuBrowser = menuBrowserRef.current;
    if (!menuBrowser) {
      return;
    }

    if (value === ALL_CATEGORIES) {
      menuBrowser.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const categorySection = categorySectionRef.current.get(value);
    if (!categorySection) {
      return;
    }

    const menuBrowserRect = menuBrowser.getBoundingClientRect();
    const categorySectionRect = categorySection.getBoundingClientRect();
    const targetTop =
      menuBrowser.scrollTop +
      (categorySectionRect.top - menuBrowserRect.top) -
      MENU_SCROLL_TOP_PADDING;

    menuBrowser.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  const registerCategorySection = (menuCategory: string) => {
    return (element: HTMLElement | null) => {
      if (element) {
        categorySectionRef.current.set(menuCategory, element);
        return;
      }

      categorySectionRef.current.delete(menuCategory);
    };
  };

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

        <div className="menu-controls">
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="カテゴリへ移動"
            className="menu-category-tabs"
          >
            <Tab label="すべて" value={ALL_CATEGORIES} />
            {menuCategories.map((menuCategory) => (
              <Tab key={menuCategory} label={menuCategory} value={menuCategory} />
            ))}
          </Tabs>
        </div>

        <div className="menu-browser" ref={menuBrowserRef}>
          {hasMenuItems ? (
            groupedMenu.map(([menuCategory, items]) => (
              <section
                key={menuCategory}
                className="menu-category"
                ref={registerCategorySection(menuCategory)}
              >
                <h3>{menuCategory}</h3>
                <div className="menu-items">
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      variant="outlined"
                      className="menu-item"
                      onClick={() => onSelectMenuItem(item)}
                    >
                      <span>{item.name}</span>
                      <small>{item.price}円</small>
                    </Button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p className="menu-empty">該当する商品はありません。</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
