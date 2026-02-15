# テスト計測ルール

## 目的

- テスト最適化の効果を、誰でも同じ手順で比較できるようにする
- 実行時間短縮と回帰検出力の両立を継続する

## 計測条件

- ローカル端末で計測する（CIとの差は参考値として扱う）
- 端末負荷を下げるため、重いアプリ/ブラウザタブは閉じて計測する
- 各コマンドを3回実行し、中央値を採用する
- ファイル単位の計測は `--maxWorkers=1` を付ける

## 計測コマンド

```bash
npm test
npx vitest run src/App.test.tsx --maxWorkers=1
npx vitest run src/features/menu/components/MenuDialog.test.tsx
npx vitest run src/features/orders/hooks/useOrderMemo.test.ts
```

## 基準値と目標値（2026-02-15）

| 対象 | 直近実測（1回） | 目標（中央値） |
| --- | --- | --- |
| 全体 (`npm test`) | tests: 約59.7s | 55s 以下 |
| `src/App.test.tsx` | tests: 約53.7s | 50s 以下 |
| `src/features/menu/components/MenuDialog.test.tsx` | tests: 約1.3s | 1.0s 以下 |
| `src/features/orders/hooks/useOrderMemo.test.ts` | tests: 約0.02s | 0.05s 以下 |

## PR運用ルール

- テスト変更を含むPRは、変更前後の計測結果を本文に記載する
- 目標を超える場合は、理由と次の改善案を記載する
- UI統合テストは代表ケースに絞り、上限/境界の厳密検証は hook / utility 単体テストへ寄せる
