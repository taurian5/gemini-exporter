# DOM Inspection Guide for iPhone

This guide will help you inspect Gemini's DOM structure using Safari on your iPhone to refine the selectors in content.js.

## Setup Safari Web Inspector

1. **Enable Web Inspector**
   - Settings → Safari → Advanced
   - Toggle ON "Web Inspector"

2. **Enable Develop Menu** (if you have a Mac nearby)
   - Can remote inspect from Mac
   - But we'll focus on iPhone-only method

## Inspecting Gemini DOM on iPhone

### Method 1: Element Inspector (Limited but works)

1. **Open Gemini** in Safari
   - Go to gemini.google.com
   - Start or open a conversation

2. **Long-press on a message**
   - Long-press on a user message bubble
   - Look for "Inspect Element" in the menu
   - If not available, try tapping elsewhere first

3. **View element info**
   - Safari will show some basic element info
   - Note any class names or IDs you see

### Method 2: Manual Source View

1. **View page source**
   - In Safari, add "view-source:" before the URL
   - Or use bookmarklet (see below)

2. **Search for patterns**
   - Look for repeated elements
   - Find class names with "message", "user", "model", "response"

### Method 3: Console Logging

Since you have this extension code, you can add logging to content.js to help debug:

```javascript
// Add to content.js extractChatMessages() function:
console.log('All elements:', document.querySelectorAll('*').length);
console.log('Message-like elements:', document.querySelectorAll('[class*="message"]'));

// Then check console in desktop Chrome when testing
```

## What to Look For

### User Messages
Look for elements containing your prompts. Note:
- **Element type**: `<div>`, `<section>`, `<article>`?
- **Class names**: Common patterns:
  - `user-message`
  - `query`
  - `prompt`
  - `human-message`
- **Data attributes**: Like `data-role="user"`
- **Structure**: Is text directly in element or nested?

### AI Responses
Look for Gemini's responses. Note:
- **Class names**: Common patterns:
  - `model-response`
  - `assistant-message`  
  - `ai-message`
  - `gemini-response`
- **Same or different structure** from user messages?

### Code Blocks
Check how code is displayed:
- Usually `<pre><code>` structure
- Look for language class: `language-javascript`, `lang-python`
- Note syntax highlighting library used

### Conversation Container
Find the main container:
- Likely has class like `conversation`, `chat`, `messages`
- Contains all message elements
- May have `role="main"` attribute

## Recording Your Findings

Create a note with this structure:

```
=== GEMINI DOM STRUCTURE ===

CONVERSATION CONTAINER:
- Selector: [your finding]
- Example: <div class="conversation-container">

USER MESSAGE:
- Selector: [your finding]
- Example: <div class="user-query">

AI MESSAGE:
- Selector: [your finding]  
- Example: <div class="model-response">

CODE BLOCK:
- Structure: [your finding]
- Example: <pre class="code-block"><code class="language-js">

CHAT TITLE:
- Selector: [your finding]
- Example: <h1 class="chat-title">
```

## Updating content.js with Findings

Once you have the selectors, update these lines in content.js:

```javascript
// Around line 20-30
const turnContainers = document.querySelectorAll('YOUR_ACTUAL_SELECTOR_HERE');

// Around line 50-60  
const isUser = element.className.includes('YOUR_USER_CLASS_HERE');

// Around line 115-120
const titleElement = document.querySelector('YOUR_TITLE_SELECTOR_HERE');
```

## Alternative: Desktop Testing First

If iPhone inspection is too limited:

1. **Save these files** to iCloud/Files app
2. **Transfer to desktop** when available
3. **Install in Chrome** as unpacked extension
4. **Use Chrome DevTools** for thorough inspection
5. **Update selectors** based on findings
6. **Test export** to verify it works

## Next Steps After Inspection

1. Note all selectors
2. Update content.js with real selectors
3. Test on desktop Chrome
4. Iterate if needed
5. Export should work!

## Quick Desktop Testing Workflow

When you get 15 minutes on desktop:

1. Copy folder to desktop
2. Chrome → Extensions → Load unpacked
3. Open Gemini chat
4. F12 → inspect elements → note selectors
5. Update content.js
6. Click extension → test export
7. Debug any issues
8. Done!

The extension is 95% ready - just needs the right selectors plugged in.
