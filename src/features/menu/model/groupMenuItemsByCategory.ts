import { MENU_ITEMS, type MenuItem } from "./menuItems";

export function groupMenuItemsByCategory(
  menuItems: MenuItem[] = MENU_ITEMS
): Array<[string, MenuItem[]]> {
  const grouped = new Map<string, MenuItem[]>();

  for (const item of menuItems) {
    const entries = grouped.get(item.category) ?? [];
    entries.push(item);
    grouped.set(item.category, entries);
  }

  return Array.from(grouped.entries());
}
