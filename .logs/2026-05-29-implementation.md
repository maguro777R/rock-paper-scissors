# 2026-05-29 実装ログ

## 方針

- `PLAN.md` が存在しなかったため、新規作成した。
- 実装方式は `Vite React`。
- `@vitejs/plugin-react` を使うため、`vite.config.js` を作成した。
- UI 言語は日本語。
- ゲーム本体に OpenAI API は入れない。
- `openai-docs` で Codex の built-in image generation が UI assets、backgrounds、illustrations に使えることを確認した。
- OpenAI image generation guide で、単発画像生成には Image API が適することを確認した。

## 画像生成

### 背景

```text
Use case: stylized-concept
Asset type: browser game background for a Japanese rock-paper-scissors game
Primary request: A polished horizontal background image of a traditional Japanese dojo for a browser game.
Scene/backdrop: wooden dojo floor, shoji screens, training space, subtle wall details, calm daytime atmosphere.
Subject: empty dojo interior, no people.
Style/medium: high-quality stylized game illustration, clean and readable, not photorealistic.
Composition/framing: landscape 16:9, stable perspective, generous open space in the center and right side for UI overlays, no important detail near edges.
Lighting/mood: soft natural daylight, focused, calm, competitive.
Color palette: warm wood, off-white paper screens, restrained indigo and muted red accents; avoid a one-note brown palette.
Constraints: no text, no logos, no watermark, no weapons, no clutter, no dark blur, no low-contrast haze.
```

保存先: `public/assets/dojo-background.png`

### 対戦相手

```text
Use case: stylized-concept
Asset type: browser game opponent portrait for a Japanese rock-paper-scissors game
Primary request: A non-sexual, dignified young adult woman in traditional Japanese clothing as a rock-paper-scissors opponent.
Subject: young adult woman, calm competitive expression, wearing refined kimono-inspired training attire, hands relaxed and ready, upper body portrait.
Style/medium: high-quality stylized game illustration, clean linework, readable silhouette, polished but restrained.
Composition/framing: portrait-oriented upper body, front three-quarter view, centered subject with padding, suitable for placement inside a game UI panel.
Lighting/mood: soft dojo daylight, focused, composed, serious but approachable.
Color palette: deep indigo, muted red, off-white, warm wood accents; avoid neon colors.
Constraints: adult appearance, no sexualized pose, no school uniform, no text, no logos, no watermark, no weapons, no extra characters, no exaggerated fantasy armor.
Avoid: childish proportions, revealing clothing, cluttered background, unreadable hands.
```

保存先: `public/assets/opponent.png`

## 実装メモ

- 5 ラウンドで終了する `Best of 5` として実装した。
- あいこも 1 ラウンドとして扱う。
- 相手は履歴 3 件未満ではランダムに出す。
- 履歴 3 件以上では、直近 4 件のプレイヤー最多手に勝つ手を 58% の確率で選ぶ。

## QA

- `playwright-interactive` の `node_repl` 経由で Chromium 起動を試したが、macOS の `MachPortRendezvousServer` 権限エラーで起動できなかった。
- 代替として、同じ Playwright を使う `scripts/playwright-qa.mjs` を追加した。
- `npm install` は通常サンドボックス内では `registry.npmjs.org` の DNS 解決に失敗した。承認付きで再実行し、成功した。
- `npm run build` は成功した。
- `npx playwright install chromium` で Chromium を取得した。
- `npm run qa:browser` は成功した。
- デスクトップ `1600x900` では、初期状態と終了状態の両方で横スクロール、縦スクロールなし。
- モバイル `390x844` では、横スクロールなし。履歴と対戦相手は縦スクロールで続く構成。
- 実操作で、グー、チョキ、パー、5 ラウンド終了、最終結果、履歴 5 件、リセット、終了後の手ボタン無効化を確認した。
- 視覚確認で、モバイルのタイトルが 1 文字だけ改行される問題を見つけ、`white-space: nowrap` とモバイル向け文字サイズ調整で修正した。

## QA 証跡

- `.logs/desktop-initial.png`
- `.logs/desktop-finished.png`
- `.logs/mobile-initial.png`
- `.logs/mobile-finished.png`

## 残リスク

- `playwright-interactive` の `node_repl` 起動は、このセッションのサンドボックス条件では完了できなかった。検証自体は Playwright の CLI 実行で代替した。
- 相手ロジックには乱数があるため、勝敗結果そのものは実行ごとに変わる。
