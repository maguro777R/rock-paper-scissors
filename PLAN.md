# 和風道場じゃんけんゲーム実装計画

## Summary

- このリポジトリに `Vite React` 製のブラウザじゃんけんゲームを実装する。
- ゲームは日本語 UI の `Best of 5` 形式にする。
- 相手は直近のプレイヤー傾向を少し読むが、完全予測にはしない。
- `imagegen` は和風道場の背景と対戦相手の画像生成に使う。
- ゲーム本体に OpenAI API は入れない。
- 作業内容、画像生成プロンプト、検証結果は `.logs/` に Markdown で残す。

## Implementation

- `package.json`、`index.html`、`src/main.jsx`、`src/App.jsx`、`src/styles.css` で `Vite React` 構成を作る。
- 表示要素は、タイトル、現在ラウンド、手の選択、相手の手、勝敗メッセージ、スコア、履歴、リセット、最終結果に絞る。
- 5 回の入力で勝負を終える。あいこも 1 ラウンドとして数える。
- 相手ロジックは序盤ランダム、履歴が 3 件以上ある場合は直近 4 件の最多手に勝つ手を 58% の確率で選ぶ。
- 画像は `public/assets/dojo-background.png` と `public/assets/opponent.png` に保存して参照する。

## QA

- `npm run build` で本番ビルドを確認する。
- ローカル開発サーバーを起動し、`playwright-interactive` で機能 QA と視覚 QA を行う。
- デスクトップ `1600x900` とモバイル `390x844` で、初期表示、通常操作、5 ラウンド終了、リセット、履歴の表示崩れを確認する。

## References

- OpenAI Codex app features: `https://developers.openai.com/codex/app/features#image-generation`
- OpenAI image generation guide: `https://developers.openai.com/api/docs/guides/image-generation#choosing-the-right-api`
