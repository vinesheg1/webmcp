# WebMCP Standalone POC - No Extension Required! 🚀

A complete task management application with **built-in AI chat** - no browser extension needed!

## ✨ Features

- **🤖 Built-in AI Chat** - Talk directly to AI in the app
- **📋 Task Management** - Add, complete, delete, and manage tasks
- **🆓 Free API** - Uses Google Gemini with generous free tier
- **⚡ Real-time Updates** - Watch tasks change as AI works
- **💾 No Backend** - Everything runs in your browser
- **🔒 Secure** - API key stored locally, never sent to our servers

## 🆓 Free AI APIs Supported

### Option 1: Google Gemini (Recommended) ✅
- **Free tier**: 60 requests per minute
- **Get key**: https://aistudio.google.com/app/apikey
- **Best for**: General use, very reliable

### Option 2: Groq (Alternative)
- **Free tier**: Very fast inference
- **Get key**: https://console.groq.com/keys
- **Best for**: Speed demos

### Option 3: HuggingFace
- **Free tier**: Available
- **Get key**: https://huggingface.co/settings/tokens
- **Best for**: Open source models

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
# or: npm install
```

### 2. Start the App

```bash
pnpm dev
# or: npm run dev
```

The app opens at: **http://localhost:5173**

### 3. Get Your Free API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste it in the app
5. Click "Save & Connect"

### 4. Start Chatting!

Try these:
- "Add a task to buy groceries"
- "Show me all my tasks"
- "Mark task 1 as complete"
- "Get task statistics"
- "Delete task 2"
- "Clear all completed tasks"

## 💡 How It Works

```
┌─────────────────┐
│   Your Browser  │
│                 │
│  Task Manager   │◄──────┐
│       +         │       │
│   AI Chat UI    │       │
│                 │       │
└────────┬────────┘       │
         │                │
         │ API Call       │ Tool Execution
         │                │
         ▼                │
┌─────────────────┐       │
│  Gemini API     │       │
│  (Free Tier)    │       │
│                 │       │
│  Function       │───────┘
│  Calling        │
└─────────────────┘
```

## 🛠️ Available Tools

The AI can use these 6 tools:

| Tool | Description | Example |
|------|-------------|---------|
| `add_task` | Add new task | "Add a task to call mom" |
| `complete_task` | Mark as done | "Complete task 1" |
| `get_tasks` | List tasks | "Show all pending tasks" |
| `delete_task` | Remove task | "Delete task 3" |
| `clear_completed` | Clean up | "Clear completed tasks" |
| `get_stats` | Get statistics | "Show me task stats" |

## 🎯 What Makes This Different?

### vs Extension-based WebMCP:
- ✅ No extension to install
- ✅ Works immediately
- ✅ Built-in chat UI
- ❌ Requires API key setup

### vs Original WebMCP POC:
- ✅ No MCP-B extension needed
- ✅ Free API (Gemini)
- ✅ Chat interface included
- ✅ Works standalone

## 📁 Project Structure

```
webmcp-standalone-poc/
├── src/
│   └── main.ts           # AI integration + task logic
├── index.html            # Split-screen UI
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## 🔧 Customization

### Add More Tools

Edit `src/main.ts`:

```typescript
const tools = [
  // ... existing tools
  {
    name: 'my_custom_tool',
    description: 'What it does',
    parameters: {
      type: 'object',
      properties: {
        param: { type: 'string', description: 'Parameter' }
      },
      required: ['param']
    },
    execute: (args: any) => {
      // Your logic here
      return 'Result message';
    }
  }
];
```

### Switch to Different AI Provider

#### Use Groq (Faster, Free):

```bash
npm install groq-sdk
```

Update `main.ts` to use Groq SDK instead of Gemini.

#### Use OpenAI (Paid):

```bash
npm install openai
```

Update to use OpenAI SDK.

## 🎨 UI Customization

The UI uses inline CSS in `index.html`. Easy to customize:

- **Colors**: Search for color codes (e.g., `#667eea`)
- **Layout**: Modify flexbox in `.task-panel` and `.chat-panel`
- **Styling**: All styles in `<style>` tag

## 🔒 Security Notes

- API keys stored in `localStorage` (browser only)
- Never committed to git
- Keys never sent to any server except AI provider
- Consider adding `.env` support for production

## 📊 API Usage Limits

### Google Gemini Free Tier:
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ Generous for POC/demos

### If You Hit Limits:
1. Wait for rate limit reset
2. Get another free API key
3. Switch to Groq (faster limits)
4. Upgrade to paid tier

## 🐛 Troubleshooting

### "Invalid API Key"
- Double-check the key from Google AI Studio
- Make sure there are no extra spaces
- Try generating a new key

### AI doesn't use tools
- Check browser console for errors
- Verify tools are defined correctly
- Try being more explicit: "Use the add_task tool"

### Tasks not updating
- Check browser console
- Refresh the page
- Clear localStorage and restart

## 🚀 Next Steps

Once you've tested:

1. **Add persistence** - Save tasks to localStorage
2. **Add categories** - Group tasks by project
3. **Add priorities** - High/medium/low
4. **Add due dates** - Calendar integration
5. **Deploy it** - Host on Vercel/Netlify
6. **Add auth** - User accounts
7. **Add backend** - Real API for multi-user

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)
- [Vite Documentation](https://vitejs.dev/)

## 💬 Support

This is a POC/demo. For production use:
- Add error boundaries
- Implement retry logic
- Add rate limiting
- Use environment variables
- Add user authentication

---

**🎉 Enjoy your no-extension WebMCP POC!**

No browser extensions. No complex setup. Just AI-powered task management! 🚀
