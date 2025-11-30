# SanctumWriter ✍️

> Your private sanctuary for writing with AI

A local-first markdown editor that uses your own LLMs (Ollama/LM Studio) as a collaborative writing companion. Like Cursor for code, but for prose.

![SanctumWriter](https://img.shields.io/badge/Status-Beta-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Local](https://img.shields.io/badge/100%25-Local-purple)

## ✨ Features

- 📝 **Markdown Editor** - Full-featured editor with syntax highlighting (CodeMirror)
- 🤖 **AI Writing Companion** - Chat with local LLMs to help write and edit
- ✨ **Agentic Editing** - AI directly modifies your document (no copy/paste!)
- 🎯 **Selection-Aware** - Highlight text and ask the AI to rewrite just that section
- 📁 **File Browser** - Navigate and manage your documents
- 👁️ **Live Preview** - See rendered markdown as you type
- 🔒 **100% Local** - All data stays on your machine. Your words, your privacy.

## 🚀 Quick Start

### Prerequisites

You need one of the following running locally:

**Option 1: Ollama** (Recommended)
```bash
# Install from https://ollama.ai
ollama pull llama3
ollama serve
```

**Option 2: LM Studio**
1. Download from https://lmstudio.ai
2. Load a model
3. Start the local server (localhost:1234)

### Installation

```bash
# Clone the repo
git clone https://github.com/lafintiger/SanctumWriter.git
cd SanctumWriter

# Install dependencies
npm install

# Start the app
npm run dev
```

Open **http://localhost:3000** in your browser.

## 📖 Usage

### Basic Editing
1. Click **+** to create a new document
2. Write markdown in the editor
3. Documents auto-save as you type

### AI Assistance
1. Type a message in the chat panel
2. The AI sees your document and any selected text
3. Ask for help: "Make this more engaging" or "Expand this section"

### Selection-Based Editing
1. **Highlight text** in the editor
2. Chat shows "Selection active"
3. Ask: "Rewrite this" or "Make it more concise"
4. AI directly modifies just the selected text

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save document |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + F` | Find in document |

## 🛠️ AI Tools

The AI can execute these document operations:

| Tool | Description |
|------|-------------|
| `replace_selection` | Replace highlighted text |
| `insert_at_cursor` | Insert text at cursor |
| `edit_lines` | Replace specific line ranges |
| `append_to_document` | Add text at end |
| `search_replace` | Find and replace |
| `insert_heading` | Add a heading |

## 🏗️ Tech Stack

- **Framework**: Next.js 14
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS
- **State**: Zustand
- **LLM**: Ollama / LM Studio (local)

## 🔧 Configuration

Create a `.env.local` file:

```env
WORKSPACE_PATH=./documents
OLLAMA_URL=http://localhost:11434
LMSTUDIO_URL=http://localhost:1234
```

## 🐛 Troubleshooting

### "Ollama not available"
```bash
# Make sure Ollama is running
ollama serve
# Check it's accessible
curl http://localhost:11434/api/tags
```

### Models not showing
```bash
# Pull a model first
ollama pull llama3
# Or for a smaller model
ollama pull gemma3:4b
```

## 📄 License

MIT - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with ❤️ for writers who value their privacy.

---

**SanctumWriter** - *Your words. Your sanctuary.*
