# Claude作品集

このリポジトリには、Claude AIを使って作成した様々なゲームやアプリケーションが格納されています。

## 🎮 アプリ一覧

### 1. ブロック崩し
- **場所**: `apps/block-breaker/`
- **説明**: クラシックなブロック崩しゲーム
- **操作**: キーボード（矢印キー）またはマウス
- **特徴**: カラフルなブロック、スコア機能、ゲームオーバー/クリア画面

## 📁 ディレクトリ構成

```
claude_make_app/
├── index.html          # ホームページ（アプリ一覧）
├── README.md          # このファイル
├── apps/              # アプリケーション格納ディレクトリ
│   └── block-breaker/ # ブロック崩しゲーム
│       ├── index.html
│       └── game.js
└── .gitignore
```

## 🚀 使い方

1. リポジトリをクローン
```bash
git clone https://github.com/kt199671/claude_make_app.git
```

2. ブラウザでindex.htmlを開く
```bash
cd claude_make_app
open index.html  # macOS
# または
start index.html # Windows
# または
xdg-open index.html # Linux
```

3. 遊びたいアプリをクリック

## 🛠 開発

新しいアプリを追加する場合：

1. `apps/`ディレクトリに新しいフォルダを作成
2. アプリのファイルをそのフォルダに配置
3. トップレベルの`index.html`にアプリへのリンクを追加

## 📝 ライセンス

このリポジトリのコードは自由に使用できます。

## 🤖 クレジット

すべてのアプリはClaude AIの支援を受けて作成されました。