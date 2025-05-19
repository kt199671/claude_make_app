# Claude作品集

このリポジトリには、Claude AIを使って作成した様々なゲームやアプリケーションが格納されています。

## 🎮 アプリ一覧

### 1. ブロック崩し
- **場所**: `apps/block-breaker/`
- **説明**: クラシックなブロック崩しゲーム
- **操作**: キーボード（矢印キー）またはマウス
- **特徴**: カラフルなブロック、スコア機能、ゲームオーバー/クリア画面

### 2. Minecraft Clone
- **場所**: `apps/minecraft-clone/`
- **説明**: 3Dボクセルサンドボックスゲーム
- **操作**: 
  - WASD: 移動
  - Space: ジャンプ
  - Shift: しゃがむ
  - マウス: 視点操作
  - 左クリック: ブロック破壊
  - 右クリック: ブロック設置
- **特徴**: 
  - 地形自動生成
  - 5種類のブロック（草、土、石、木、砂）
  - 木の自動生成
  - 物理演算（重力、ジャンプ）

## 📁 ディレクトリ構成

```
claude_make_app/
├── index.html             # ホームページ（アプリ一覧）
├── README.md             # このファイル
├── apps/                 # アプリケーション格納ディレクトリ
│   ├── block-breaker/    # ブロック崩しゲーム
│   │   ├── index.html
│   │   └── game.js
│   └── minecraft-clone/  # Minecraftクローン
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