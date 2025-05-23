# Claude作品集

このリポジトリには、Claude AIを使って作成した様々なゲーム、ツール、AIアプリケーションが格納されています。

## 🎮 ゲーム一覧

### パズル・思考ゲーム
- **🍬 キャンディクラッシュ風パズル** (`apps/candy-crush/`)
  - マッチ3パズルゲーム。カラフルなキャンディを3つ以上揃えて消していく爽快感！
  
- **🔢 2048パズル** (`apps/2048-puzzle/`)
  - 人気のスライドパズルゲーム。同じ数字を合体させて2048を目指そう！
  
- **♞ チェス** (`apps/chess/`)
  - 2人用のクラシックなチェスゲーム。すべてのチェスルールに対応

### アクションゲーム
- **🐍 スネークゲーム** (`apps/snake-game/`)
  - クラシックなスネーク（蛇）ゲーム。えさを食べて蛇を成長させよう
  
- **🎮 ブロック崩し** (`apps/block-breaker/`)
  - クラシックなブロック崩しゲーム。カラフルなブロックを破壊してハイスコアを目指そう！
  
- **⛏️ Minecraft Clone** (`apps/minecraft-clone/`)
  - 3Dボクセルサンドボックスゲーム。ブロックを配置・破壊して自由に世界を作ろう！

### スキルゲーム
- **⌨️ タイピングゲーム** (`apps/typing-game/`)
  - タイピングスキルを向上させるゲーム。WPMと正確率を測定

## 🛠️ ツール・アプリ一覧

### 生産性ツール
- **🧮 電卓** (`apps/calculator/`)
  - シンプルで使いやすい電卓アプリ。計算履歴表示機能付き
  
- **📋 TODOリスト** (`apps/todo-list/`)
  - タスク管理アプリ。フィルタリングや統計表示機能も搭載
  
- **📝 メモ帳** (`apps/notepad/`)
  - シンプルで使いやすいメモ帳アプリ。書式設定ツールバー付き
  
- **🍅 ポモドーロタイマー** (`apps/pomodoro/`)
  - 生産性向上のためのポモドーロテクニック用タイマー

### 情報・エンターテイメント
- **🌦️ 天気予報** (`apps/weather-app/`)
  - 世界中の都市の天気情報を取得。現在の天気と5日間の予報を表示
  
- **🥠 おみくじ** (`apps/fortune-cookie/`)
  - 今日のあなたの運勢を占います。毎日チェックして、幸運を引き寄せよう！

## 🤖 AIアプリケーション

### AI搭載ツール
- **📸 AI写真整理アプリ** (`apps/photo-organizer/`)
  - AIを使って写真を自動で分類・整理。重複写真の検出や品質分析も実行
  
- **💰 AI Finance Manager** (`apps/ai-finance-manager/`)
  - AI搭載の家計管理アプリ。支出追跡と財務インサイトを提供
  
- **📈 AI Habit Tracker** (`apps/ai-habit-tracker/`)
  - AI搭載の習慣追跡アプリ。習慣の監視と進捗分析を実行

## 📁 ディレクトリ構成

```
claude_make_app/
├── index.html                    # ホームページ（アプリ一覧）
├── README.md                     # このファイル
├── .gitignore                    # Git除外設定
├── .nojekyll                     # GitHub Pages設定
├── .github/                      # GitHub Actions設定
├── .claude/                      # Claude AI設定
└── apps/                         # アプリケーション格納ディレクトリ
    ├── ai-finance-manager/       # AI家計管理アプリ
    ├── ai-habit-tracker/         # AI習慣追跡アプリ
    ├── fortune-cookie/           # おみくじアプリ
    ├── photo-organizer/          # AI写真整理アプリ
    ├── candy-crush/              # キャンディクラッシュ風パズル
    ├── chess/                    # チェスゲーム
    ├── snake-game/               # スネークゲーム
    ├── pomodoro/                 # ポモドーロタイマー
    ├── notepad/                  # メモ帳アプリ
    ├── weather-app/              # 天気予報アプリ
    ├── todo-list/                # TODOリストアプリ
    ├── calculator/               # 電卓アプリ
    ├── 2048-puzzle/              # 2048パズルゲーム
    ├── typing-game/              # タイピングゲーム
    ├── minecraft-clone/          # Minecraftクローン
    └── block-breaker/            # ブロック崩しゲーム
```

## 🚀 使い方

### オンラインで使用
GitHub Pagesでホストされているため、以下のURLから直接アクセスできます：
```
https://kt199671.github.io/claude_make_app/
```

### ローカルで使用
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
2. アプリのファイル（`index.html`, `script.js`, `style.css`など）をそのフォルダに配置
3. トップレベルの`index.html`にアプリへのリンクを追加
4. このREADMEファイルにアプリの説明を追加

## 🎯 特徴

- **多様なジャンル**: ゲーム、生産性ツール、AIアプリケーションまで幅広くカバー
- **レスポンシブデザイン**: モバイルデバイスでも快適に使用可能
- **純粋なHTML/CSS/JavaScript**: フレームワーク不要で軽量
- **AI統合**: 最新のAI技術を活用したアプリケーション
- **オープンソース**: すべてのコードが公開されており、学習や改良が可能

## 📝 ライセンス

このリポジトリのコードは自由に使用できます。

## 🤖 クレジット

すべてのアプリはClaude AIの支援を受けて作成されました。