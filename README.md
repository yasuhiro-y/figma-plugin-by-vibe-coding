# 🚀 Figma Plugin by Vibe Coding

**プロフェッショナル品質のFigmaプラグイン開発ボイラープレート（AI支援開発対応）**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![rulesync](https://img.shields.io/badge/rulesync-FF6B35?style=for-the-badge)](https://github.com/dyoshikawa/rulesync)

モダンな技術スタックとAI開発支援ツール統合による、最高品質のFigmaプラグイン開発環境です。

## ✨ 特徴

### 🏗️ **最新技術スタック**
- **TypeScript 5.6+** - 完全な型安全性
- **React 18** - モダンなUI開発
- **Vite** - 高速ビルドシステム
- **shadcn/ui** - 美しいコンポーネント
- **Tailwind CSS** - ユーティリティファースト
- **Biome** - 高速なリント・フォーマット

### 🤖 **AI開発支援統合**
- **15+のAI開発ツール対応** - Cursor, Claude, Copilot, Cline等
- **rulesync** - AI開発ルール自動生成
- **型安全なコード生成** - AIが理解しやすい構造
- **プロンプト最適化** - 効率的なAI協働

### 🛡️ **プロダクション対応**
- **HMR安定性** - CSS "溶け" 問題解決済み
- **エラーハンドリング** - Result patternによる堅牢性  
- **自動品質チェック** - lint + format + typecheck
- **デュアルプロセス対応** - Figma Plugin API完全準拠

## 🚀 クイックスタート

### 1. プロジェクト作成
```bash
# npm create コマンドで新しいプロジェクト作成
npm create figma-plugin-by-vibe-coding my-awesome-plugin

# または、このリポジトリをクローン
git clone https://github.com/yasuhiro-y/figma-plugin-by-vibe-coding.git
cd figma-plugin-by-vibe-coding
pnpm install
```

### 2. AI開発ツール向けルール生成 🤖

**重要**: AI支援開発を使用する場合、必ずルールファイルを生成してください。

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

### 3. 開発開始

```bash
# 開発サーバー起動
pnpm dev

# または UI のみをブラウザで開発
pnpm dev:ui-only  # http://localhost:3000
```

### 4. Figmaでプラグイン読み込み

1. **Figma Desktop** を開く
2. **Plugins** → **Development** → **Import plugin from manifest...**
3. `dist/manifest.json` を選択
4. プラグインが読み込まれ、ランダム図形生成が利用可能

## 📋 開発コマンド

### 🔧 **基本コマンド**
```bash
pnpm dev              # 開発サーバー起動
pnpm build            # プロダクションビルド（hot reload安全）
pnpm build:fresh      # フルクリーンビルド（初回・リリース用）
pnpm dev:ui-only      # UI のみブラウザ開発
```

### 🧹 **品質管理**
```bash
pnpm lint:fix         # lint自動修正
pnpm format          # コード整形
pnpm typecheck       # TypeScript型チェック  
pnpm check-all       # 全品質チェック
```

### 🤖 **AI開発支援**
```bash
pnpm rules:generate  # 設定されたAIツール用ルール生成
pnpm rules:dev       # 主要ツールのみ（高速）
```

## 🏗️ プロジェクト構造

```
src/
├── plugin/           # プラグインスレッド（Figma API）
│   └── main.ts       
├── ui/               # UIスレッド（React）
│   ├── components/   # UIコンポーネント
│   ├── hooks/        
│   │   ├── core/     # コア機能（通信、接続管理）
│   │   └── features/ # 機能別（カスタムロジック）
│   └── styles/       # グローバルスタイル
├── common/           # 共有ファイル
│   ├── messages.ts   # 通信契約
│   ├── types.ts      # 型定義
│   └── constants.ts  # 定数
└── .rulesync/        # AI開発ルール（自動生成）
```

## 🎯 デモ機能

### ランダム図形生成デモ
- **機能**: ランダムな図形（矩形、楕円、多角形）を生成
- **特徴**: ランダムな色、サイズ、ビューポート内配置
- **通知**: `figma.notify()` によるネイティブ通知
- **型安全**: 完全なTypeScript型チェック

## 🤖 AI開発のコツ

1. **AIツール設定**: `rulesync.jsonc`で好みのAIツールを設定
2. **ルール更新**: 新機能実装前に `pnpm run rules:generate` 実行
3. **専門エージェント**: Claude の `figma-expert` エージェントに相談
4. **シンプルさ重視**: rulesyncの標準機能をそのまま活用

## 💡 トラブルシューティング

### **Hot Reload中のビルドエラー**
```bash
# ❌ 問題: pnpm build でプラグインが落ちる
# ✅ 解決: hot reload安全ビルド使用
pnpm build        # 安全ビルド（recommended）
pnpm build:fresh  # フルクリーンビルド（初回・リリース時のみ）
```

### **CSS適用問題**
- HMR時のCSS消失問題は解決済み
- 5層保護システムによる安定したスタイル適用
- `forceCSSSafety()` による自動復旧

### **rulesyncエラー**
```bash
# Node.js互換性エラーが出ても正常動作
ls .cursor CLAUDE.md  # ファイル生成確認
```

## 📦 npm create コマンド

```bash
# 基本使用
npm create figma-plugin-by-vibe-coding my-plugin

# AIツール指定
npm create figma-plugin-by-vibe-coding my-plugin --ai=cursor
npm create figma-plugin-by-vibe-coding my-plugin --ai=claudecode
```

## 📝 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照

## 🙋‍♂️ サポート

- **Issues**: [GitHub Issues](https://github.com/yasuhiro-y/figma-plugin-by-vibe-coding/issues)
- **Discussions**: プロジェクトのDiscussions
- **Documentation**: `README-LLM.md` (AI開発者向け詳細ガイド)

## 🌟 コントリビューション

プルリクエスト歓迎！詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

---

**Made with ❤️ for AI-assisted Figma plugin development**