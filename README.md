# BLUE PAWS ホームページ（bluepaws.jp）

Netlify が `master` ブランチの `public/` をそのまま公開します（ビルドなし。設定は `netlify.toml`）。

## ファイル
- `site/content.yaml` … 文言・料金・写真の場所。ふだん編集するのはここだけ
- `site/template.html` … ページの雛形（デザイン）
- `site/render.js` … 雛形に文言を流し込む処理。ブラウザ（文言エディタ）と Node.js の両方で使う
- `site/build.js` … `public/index.html` を作り直すスクリプト
- `public/` … 公開されるファイル。`public/index.html` は生成物なので直接編集しない
- `public/img/site/` … ページで使う写真

## 手元で作り直すとき
```
npm install js-yaml@4.1.0
node site/build.js
```
