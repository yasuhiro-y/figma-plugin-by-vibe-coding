# 🚀 Figma Plugin Vibe Coding Boilerplate

**Vibe Coding（AI支援開発）向けの最高品質Figmaプラグインボイラープレート**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

## 🎯 このボイラープレートの特徴

- **🤖 AI支援開発最適化**: Cursor、Claude Code、GitHub Copilot等のAI開発ツールと完全統合
- **🏗️ プロフェッショナル設計**: デュアルプロセス・アーキテクチャ完全対応
- **🛡️ 完全型安全**: TypeScript + Zod による厳密な型チェックとランタイム検証  
- **🎨 モダンUI**: shadcn/ui + Tailwind CSS による美しいインターフェース
- **⚡ 高速開発体験**: Vite による爆速ビルドとホットリロード
- **📱 レスポンシブ**: Figmaプラグイン環境に最適化された UI設計

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/figma-plugin-vibe-coding-boilerplate.git
cd figma-plugin-vibe-coding-boilerplate
```

### 2. 依存関係のインストール

```bash
pnpm install
# または npm install / yarn install
```

### 3. AI開発ツール向けルール生成 🤖

**重要**: このボイラープレートはAI支援開発を前提としているため、使用前に必ずAI開発ツール用のルールファイルを生成してください。

#### AIツールの選択
`rulesync.jsonc`を編集してAIツールを選択：
```jsonc
{
  // ✏️ 使いたいAIツールを指定
  "targets": ["cursor"],  // または ["claudecode"], ["copilot"] など
}
```

#### ルール生成実行
```bash
# 設定されたAIツール用のルールを生成
pnpm run rules:generate
```

> **⚠️ 注意**: Node.js互換性によりrulesyncでエラーが表示される場合がありますが、実際にはファイルは正常に生成されます。`.cursor/`, `CLAUDE.md` 等のファイルが作成されていれば成功です。

これにより選択したAIツール用のファイルが生成されます：
- **Cursor**: `.cursor/rules/` + カスタムコマンド
- **Claude Code**: `.claude/memories/` + 専門エージェント  
- **GitHub Copilot**: `.github/instructions/` 統合
- **Cline**: `.clinerules/` 自動生成
- **その他**: Amazon Q、Qwen、Gemini 等対応

### 4. 開発サーバーの起動

```bash
pnpm dev
```

### 5. Figmaでの設定

1. Figmaを開く
2. メニューバー > Plugins > Development > Import plugin from manifest...
3. `dist/manifest.json` を選択
4. プラグインが Plugins メニューに追加されます

## 📁 プロジェクト構造

```
src/
├── plugin/           # メインスレッド（Figma API アクセス）
│   └── main.ts
├── ui/               # UIスレッド（React コンポーネント）
│   ├── components/   
│   ├── hooks/        
│   └── main.tsx      
└── common/           # 共有型定義・通信契約
    ├── types.ts      
    ├── messages.ts   
    └── constants.ts  

.rulesync/            # AI開発ツール設定（編集可能）
├── rules/           # ルール定義
├── commands/        # カスタムコマンド
└── subagents/       # 専門エージェント
```

## 💻 開発コマンド

### 基本コマンド
```bash
pnpm dev              # 開発サーバー起動
pnpm build            # 本番用ビルド
pnpm typecheck        # 型チェック
pnpm lint             # コード品質チェック
pnpm format           # コードフォーマット
```

### AI支援開発コマンド 🤖
```bash
pnpm run rules:generate    # 全AI開発ツール用ルール生成（推奨）
pnpm run rules:dev        # 主要ツールのみ（高速）
```

## 🤖 AI開発ツールとの連携

このボイラープレートは以下のAI開発ツールと完全統合されています：

### ✅ 対応AI開発ツール（15+）
- **Cursor** - `.cursor/rules/` + カスタムコマンド
- **Claude Code** - `.claude/memories/` + 専門エージェント  
- **GitHub Copilot** - `.github/instructions/` 統合
- **その他** - Windsurf、Warp、Junie、Kiro 等、全主要ツール対応

### 🎯 専門エージェント
- **figma-expert** - Figma Plugin API専門エージェント
  - TypeScript完全型安全パターン
  - shadcn/ui統合ガイド
  - エラーハンドリングベストプラクティス

### 📝 カスタムコマンド
- **generate-plugin** - 新機能生成用コマンド
  - 完全型安全な実装
  - shadcn/ui準拠のUI生成
  - エラーハンドリング統合

## 🏗️ アーキテクチャの特徴

### デュアルプロセス・モデル
Figmaプラグインは2つの完全に分離されたプロセスで動作します：

1. **プラグインスレッド** (`src/plugin/`)
   - Figma API へのフルアクセス
   - サンドボックス化されたJavaScript環境
   - ブラウザAPI使用不可

2. **UIスレッド** (`src/ui/`)
   - 標準的なブラウザ環境
   - React + shadcn/ui
   - Figma API アクセス不可

**重要**: 両プロセス間の通信は `postMessage` のみ

## 🎨 UI設計原則

### shadcn/ui「ずっぷり」方針
このプロジェクトでは shadcn/ui に完全に依存する設計を採用：

- ✅ **shadcn/uiコンポーネントのみ使用**
- ✅ **一貫したデザインシステム**
- ❌ カスタムCSS・インラインスタイルは使用しない

### レスポンシブ設計
- プラグインウィンドウ: 320x480px または 400x600px
- 小さな画面での最適な UX
- アクセシビリティ対応

## 🛡️ 型安全性

### 完全TypeScript化
- 全ての関数に明示的な型注釈必須
- Result パターンによるエラーハンドリング  
- Zod による外部データのランタイム検証

### 通信層の型安全性
```typescript
interface PluginAPI {
  createRectangle(width: number, height: number): Promise<string>;
  getSelectedNodes(): Promise<NodeData[]>;
}
```

## 📚 ドキュメント

- **[README-LLM.md](./README-LLM.md)** - LLM/AI開発ツール向け技術詳細
- **[Figma Plugin API Docs](https://www.figma.com/plugin-docs/)** - 公式API ドキュメント
- **[shadcn/ui](https://ui.shadcn.com/)** - コンポーネントライブラリ

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 💡 ヒント

### 最初に試すこと
1. プラグインを起動して四角形を作成
2. Figmaで何かオブジェクトを選択して選択パネルを確認
3. 異なる色の四角形を作成

### トラブルシューティング
- **プラグインが起動しない** → `pnpm build` でビルドを確認
- **スタイルが適用されない** → ブラウザの開発者ツールでCSSを確認
- **型エラー** → `pnpm typecheck` で詳細確認

### AI開発のコツ 🤖
1. 新機能実装前に `pnpm run rules:generate` でルール更新
2. エラー時は Claude の `figma-expert` エージェントに相談
3. `generate-plugin` コマンドで新機能の雛形生成
4. 全AI開発ツール対応で、お好みのAIアシスタントが使用可能

---

**Happy Vibe Coding! 🚀✨**
