import { FormEvent } from "react";
import { Button, Dialog, DialogContent, TextField } from "@mui/material";
import type { Visitor } from "../model/types";

type VisitorDialogProps = {
  open: boolean;
  visitors: Visitor[];
  newVisitorName: string;
  visitorError: string;
  onClose: () => void;
  onChangeNewVisitorName: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveVisitor: (id: string) => void;
};

export function VisitorDialog({
  open,
  visitors,
  newVisitorName,
  visitorError,
  onClose,
  onChangeNewVisitorName,
  onSubmit,
  onRemoveVisitor
}: VisitorDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      transitionDuration={0}
      aria-labelledby="visitor-dialog-title"
    >
      <div className="dialog-title-wrapper dialog-header">
        <h2 id="visitor-dialog-title" className="dialog-title-text">
          来店者（グループ）管理
        </h2>
        <Button variant="outlined" className="sub-button" onClick={onClose}>
          閉じる
        </Button>
      </div>

      <DialogContent dividers>
        <p className="subtitle">注文者候補を追加・削除できます。</p>

        <form className="form" onSubmit={onSubmit}>
          <label className="visitor-form-label">
            来店者名
            <TextField
              size="small"
              value={newVisitorName}
              onChange={(event) => onChangeNewVisitorName(event.target.value)}
              placeholder="例: A卓 / 田中さんグループ"
            />
          </label>

          {visitorError ? <p className="error">{visitorError}</p> : null}

          <Button type="submit" variant="contained">
            来店者を追加
          </Button>
        </form>

        {visitors.length === 0 ? (
          <p className="empty">来店者はまだ登録されていません。</p>
        ) : (
          <ul className="visitors">
            {visitors.map((visitor) => (
              <li key={visitor.id} className="visitor">
                <span>{visitor.name}</span>
                <Button
                  variant="outlined"
                  className="remove"
                  onClick={() => onRemoveVisitor(visitor.id)}
                >
                  削除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
