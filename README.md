# Gemini Chat Exporter

A Chrome extension to export Gemini AI conversations to Markdown format with one click. 100% local processing - your data never leaves your browser.

## Features

- ✅ One-click export to Markdown
- ✅ Preserves conversation structure (user vs AI messages)
- ✅ Handles code blocks with proper markdown formatting and language detection
- ✅ Automatic deduplication of messages
- ✅ Clean UI element removal (buttons, labels, etc.)
- ✅ Auto-download to Downloads folder
- ✅ Local-only processing (no data transmission)
- ✅ Clean, timestamped filenames
- ✅ Minimal permissions (activeTab, downloads only)
- ✅ Warning for long conversations about scrolling to load all messages

## Installation (Development)

Since this extension is not yet published to the Chrome Web Store, you'll need to load it as an unpacked extension:

1. **Download/Clone the project files** to a folder on your computer

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `gemini-exporter` folder containing the manifest.json file

5. **Verify installation**
   - You should see "Gemini Chat Exporter" in your extensions list
   - The extension icon should appear in your Chrome toolbar

## Usage

1. **Navigate to a Gemini chat**
   - Go to [gemini.google.com](https://gemini.google.com)
   - Open or start a conversation

2. **For long conversations: Scroll first!**
   - Gemini lazy-loads messages
   - Scroll to the top of the conversation to ensure all messages are loaded
   - This ensures the complete chat history is exported

3. **Click the extension icon**
   - Find the Gemini Exporter icon in your toolbar
   - Click it to open the popup

4. **Export the chat**
   - Click the "Export Chat" button
   - File auto-downloads to your Downloads folder
   - Done! Your conversation is saved as Markdown

## File Structure

```
gemini-exporter/
├── manifest.json          # Extension configuration
├── content.js            # Extracts chat from Gemini pages
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and download handling
├── styles.css            # Popup styling
└── README.md             # This file
```

## Current Status

**Version**: 1.0.0 (Functional)

### ✅ Tested & Working

- ✅ Message extraction from Gemini conversations
- ✅ Code block formatting with language tags
- ✅ Message deduplication for long conversations
- ✅ UI element cleanup (removes "Show thinking", "Copy code", etc.)
- ✅ Correct message ordering via DOM position sorting
- ✅ Auto-download functionality
- ✅ Title generation from first user message

### ⚠️ Known Limitations

- **Lazy loading**: Gemini loads messages as you scroll. For long conversations, scroll to the top first before exporting
- **Chrome auto-download**: To skip the save dialog, disable "Ask where to save each file" in Chrome settings (chrome://settings/downloads)
- **Icon design**: Current icons are basic placeholders (blue background with white "G")
- **Language labels**: Standalone language labels (like "JavaScript" or "Python") above code blocks are sometimes not removed

## Privacy & Security

- **No external requests**: All processing happens locally in your browser
- **No data storage**: Extension doesn't save your conversations
- **Minimal permissions**: Only accesses the active tab when you click export
- **Open source**: All code is visible for review

## Markdown Output Format

```markdown
# [Chat Title]

*Exported: [timestamp]*

---

## User

[user message]

## Gemini

[AI response]

```language
[code block if present]
```

## User

[next message...]
```

## Troubleshooting

**"No messages found" error**
- Ensure you're on a Gemini chat page (gemini.google.com)
- Scroll through the entire conversation first to load all messages
- Refresh the page and try again
- Check the console for errors (F12 → Console tab)

**Extension not appearing**
- Check that it's enabled in chrome://extensions/
- Look for it in the extensions menu (puzzle piece icon) if not pinned
- Ensure you're on a gemini.google.com page

**Messages appear out of order**
- Scroll to the very top of the conversation before exporting
- This ensures all messages are loaded in the DOM

**"Could not establish connection" error**
- Refresh the Gemini page after reloading the extension
- The content script needs to be re-injected

**Download dialog appears despite auto-download setting**
- This is a Chrome security feature that cannot be fully bypassed
- To minimize interruption: chrome://settings/downloads → Disable "Ask where to save each file"

## Future Enhancements

- Support for images in conversations
- Batch export multiple chats
- Custom formatting options
- Export to additional formats (JSON, HTML)
- Gemini AI Studio support

## Development Notes

This extension was created with:
- Manifest V3 (Chrome's latest extension format)
- Vanilla JavaScript (no frameworks)
- Mobile-first development workflow

## License

MIT License - feel free to use and modify

## Contributing

Issues and pull requests welcome! Key areas that need work:
1. Refining DOM selectors for Gemini's actual structure
2. Improved code block language detection
3. Better handling of very long conversations
4. Icon design

---

**Note**: This extension is not affiliated with Google or Gemini AI.
