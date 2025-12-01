# SanctumWriter Pro ✍️⚡

> AI writing companion powered by frontier models

A feature-rich markdown editor with access to the world's best AI models - GPT-4, Claude, Gemini, Grok, and 100+ more. All the power of SanctumWriter, supercharged with cloud AI.

![SanctumWriter Pro](https://img.shields.io/badge/Status-Beta-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Pro](https://img.shields.io/badge/Version-Pro-purple)

## 🆚 SanctumWriter vs Pro

| Feature | [SanctumWriter](https://github.com/lafintiger/SanctumWriter) | **SanctumWriter Pro** |
|---------|--------------------------------------------------------------|----------------------|
| Local Models (Ollama/LM Studio) | ✅ | ✅ |
| OpenRouter (100+ models) | ❌ | ✅ |
| OpenAI (GPT-4o, GPT-4) | ❌ | ✅ |
| Anthropic (Claude 3.5, Opus) | ❌ | ✅ |
| Google (Gemini Pro, Flash) | ❌ | ✅ |
| xAI (Grok 3) | ❌ | ✅ |
| 100% Local/Private | ✅ | Local + Cloud |
| Cost | Free | Provider fees apply |

**Choose SanctumWriter** if you want 100% privacy and free usage with local models.  
**Choose SanctumWriter Pro** if you want access to frontier AI models like GPT-4 and Claude.

---

## ✨ Features

### Core Writing Tools
- 📝 **Markdown Editor** - Full-featured editor with syntax highlighting (CodeMirror)
- 🤖 **AI Writing Companion** - Chat with AI to help write and edit
- ✨ **Agentic Editing** - AI directly modifies your document (no copy/paste!)
- 🎯 **Selection-Aware** - Highlight text and ask the AI to rewrite just that section
- 📁 **File Browser** - Navigate and manage your documents
- 👁️ **Live Preview** - See rendered markdown as you type

### Pro Cloud Features
- ⚡ **Frontier Models** - Access GPT-4, Claude, Gemini, Grok instantly
- 🌐 **OpenRouter Integration** - One API key = 100+ models
- 🔄 **Seamless Switching** - Switch between local and cloud models anytime
- 🔑 **Secure Key Storage** - API keys stored locally, never on our servers

### Advanced Features
- 👥 **Council of Writers** - Multi-model review system
- 🔍 **Research Integration** - SearXNG search with AI summaries
- 📚 **RAG Knowledge Base** - Reference documents for context
- 🧠 **Session Memory** - AI remembers across conversations
- 📖 **Citations & Bibliography** - Academic citation management
- 📁 **Multi-Document Projects** - Obsidian-compatible project folders
- 📤 **Export** - PDF, DOCX, HTML with table of contents

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/lafintiger/SanctumWriterPro.git
cd SanctumWriterPro
npm install
```

### 2. Start the App

```bash
npm run dev
```

Open **http://localhost:3130** in your browser.

### 3. Add an API Key

1. Go to **Settings** (gear icon) → **API Keys** tab
2. Add at least one API key:
   - **OpenRouter** (recommended) - [Get key](https://openrouter.ai/keys) - Access 100+ models
   - **OpenAI** - [Get key](https://platform.openai.com/api-keys)
   - **Anthropic** - [Get key](https://console.anthropic.com/settings/keys)
   - **Google AI** - [Get key](https://aistudio.google.com/apikey)
   - **xAI** - [Get key](https://console.x.ai/)

### 4. Select a Cloud Model

Click the provider dropdown in the header → Select a cloud provider → Choose a model.

---

## 🔑 Recommended: OpenRouter

**OpenRouter is the easiest way to get started** - one API key gives you access to:

- GPT-4o, GPT-4 Turbo
- Claude 3.5 Sonnet, Claude 3 Opus
- Llama 3.1 405B
- Mistral Large
- Gemini Pro
- And 100+ more models

[Get your OpenRouter API key →](https://openrouter.ai/keys)

---

## 💰 Pricing

SanctumWriter Pro itself is **free and open source**. You only pay for the cloud API usage:

| Provider | Approximate Cost |
|----------|------------------|
| OpenRouter | Varies by model ($0.10 - $15 per 1M tokens) |
| OpenAI GPT-4o | ~$5 per 1M tokens |
| Anthropic Claude 3.5 | ~$3 per 1M tokens |
| Google Gemini | Often free tier available |

💡 **Tip**: For most writing, a few dollars goes a long way. A typical document edit costs fractions of a cent.

---

## 🔒 Privacy & Security

- **API keys stored locally** in your browser's localStorage
- **Keys sent directly to providers** - we never see them
- **No telemetry** - we don't track your usage
- **Open source** - audit the code yourself

For maximum privacy, use the [free SanctumWriter](https://github.com/lafintiger/SanctumWriter) with local models.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS
- **State**: Zustand
- **LLM**: Ollama, LM Studio, OpenRouter, OpenAI, Anthropic, Google, xAI

---

## 📖 Usage

### Basic Writing
1. Create or open a document
2. Write markdown in the editor
3. Use the AI chat to get help

### Using Cloud Models
1. Add your API key in Settings → API Keys
2. Select a cloud provider from the dropdown
3. Choose a model
4. Chat with frontier AI!

### Selection-Based Editing
1. **Highlight text** in the editor
2. Ask: "Rewrite this" or "Make it more concise"
3. AI directly modifies just the selected text

---

## 🐛 Troubleshooting

### "API key required"
Add your API key in **Settings → API Keys** for the provider you want to use.

### "Need API Key" in provider menu
The provider is available but not configured. Click it anyway, then add your key in Settings.

### Models not loading
1. Check your API key is correct
2. Verify the provider's service is operational
3. Some providers require billing setup before API works

### Want to use local models?
Local providers (Ollama, LM Studio) still work! They're in the "Local (Free)" section of the provider menu.

---

## 🔗 Related

- **[SanctumWriter](https://github.com/lafintiger/SanctumWriter)** - Free, 100% local version
- **[Ollama](https://ollama.ai)** - Run models locally
- **[OpenRouter](https://openrouter.ai)** - Multi-model API gateway

---

## 📄 License

MIT - See [LICENSE](LICENSE) for details.

---

**SanctumWriter Pro** - *Frontier AI at your fingertips.*
