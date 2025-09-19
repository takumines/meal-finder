# 推奨コマンド

## 開発サーバー
```bash
# 開発サーバー起動（Turbopack使用）
npm run dev
# または
bun dev
```

## ビルド
```bash
# プロダクションビルド（Turbopack使用）
npm run build
# または
bun run build

# 本番サーバー起動
npm run start
# または
bun start
```

## コード品質
```bash
# リンティング（Biome）
npm run lint
# または
bun run lint

# フォーマッティング（Biome）
npm run format
# または
bun run format
```

## テスト
```bash
# 全テスト実行
npm test
# または
bun test

# テスト監視モード
npm run test:watch
# または
bun run test:watch

# ユニットテストのみ
npm run test:unit
# または
bun run test:unit

# 全テスト実行（明示的）
npm run test:all
# または
bun run test:all
```

## データベース（Prisma）
```bash
# マイグレーション実行
npx prisma migrate dev

# Prismaクライアント生成
npx prisma generate

# データベーススキーマ確認
npx prisma studio
```

## Git操作
```bash
# ステータス確認
git status

# 変更確認
git diff

# コミット
git add .
git commit -m "commit message"

# ブランチ操作
git checkout -b feature/new-feature
git push origin feature/new-feature
```

## パッケージ管理
```bash
# 依存関係インストール
npm install
# または
bun install

# 依存関係追加
npm install package-name
# または
bun add package-name

# 開発依存関係追加
npm install -D package-name
# または
bun add -d package-name
```

## ファイル・ディレクトリ操作（macOS/Darwin）
```bash
# ディレクトリ内容表示
ls -la

# ディレクトリ作成
mkdir directory-name

# ファイル検索
find . -name "*.ts" -type f

# テキスト検索（ripgrep推奨）
rg "search-pattern"

# ディレクトリツリー表示
tree -I node_modules
```

## 環境設定
```bash
# 環境変数ファイルコピー
cp .env.example .env.local

# Node.jsバージョン確認
node --version

# npmバージョン確認
npm --version

# bunバージョン確認
bun --version
```

## よく使用するタスク完了後のコマンド
1. `npm run lint` - コードスタイルチェック
2. `npm run format` - コードフォーマット
3. `npm test` - テスト実行
4. `npm run build` - ビルド確認