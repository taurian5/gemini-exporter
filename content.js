// Gemini Chat Exporter - Content Script
// Runs on gemini.google.com pages to extract chat content

/**
 * Main function to extract all messages from the current Gemini chat
 * @returns {Array} Array of message objects with role and content
 */
function extractChatMessages() {
  const messages = [];

  try {
    // Strategy 1: Look for conversation-container (from your screenshots)
    let conversationContainer = document.querySelector('.conversation-container, [class*="chat-history"]');

    if (!conversationContainer) {
      // Strategy 2: Look for the main content area
      conversationContainer = document.querySelector('[class*="content-container"], main');
    }

    if (!conversationContainer) {
      console.log('Conversation container not found, searching entire document');
      conversationContainer = document.body;
    }

    console.log('Container found:', conversationContainer.className || conversationContainer.tagName);

    // Find user queries - looking for elements with "user-query" in the class
    const userQueries = conversationContainer.querySelectorAll('[class*="user-query"]');
    console.log(`Found ${userQueries.length} user query elements`);

    // Find model responses - looking for elements with "model-response" in the class
    const modelResponses = conversationContainer.querySelectorAll('[class*="model-response"]');
    console.log(`Found ${modelResponses.length} model response elements`);

    // If we still don't find anything, try a more aggressive search
    if (userQueries.length === 0 && modelResponses.length === 0) {
      console.log('Trying aggressive search...');

      // Look for the specific classes from the screenshot
      const userElements = document.querySelectorAll('.user-query-container, [class*="user-query-bubble"]');
      const modelElements = document.querySelectorAll('.model-response-text, .response-container, [class*="model-response"]');

      console.log(`Aggressive search found: ${userElements.length} user, ${modelElements.length} model`);

      // Combine all elements with their type
      const allElements = [
        ...Array.from(userElements).map(el => ({ element: el, type: 'user' })),
        ...Array.from(modelElements).map(el => ({ element: el, type: 'model' }))
      ];

      // Sort by actual DOM position
      allElements.sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });

      // Process all messages in DOM order
      allElements.forEach((item, index) => {
        let textContent = item.element.innerText || item.element.textContent;

        // Clean up UI elements
        textContent = cleanUIElements(textContent);

        if (textContent && textContent.trim().length > 0) {
          const codeBlocks = extractCodeBlocks(item.element);
          messages.push({
            role: item.type === 'user' ? 'User' : 'Gemini',
            content: textContent.trim(),
            codeBlocks: codeBlocks,
            index: index
          });
        }
      });

      // Deduplicate messages based on content
      const deduplicatedMessages = deduplicateMessages(messages);

      console.log(`Extracted ${messages.length} messages (${deduplicatedMessages.length} after deduplication) via aggressive search`);
      return deduplicatedMessages;
    }

    // Normal processing: Combine and sort all messages by their DOM position
    const allElements = [
      ...Array.from(userQueries).map(el => ({ element: el, type: 'user' })),
      ...Array.from(modelResponses).map(el => ({ element: el, type: 'model' }))
    ];

    // Sort by DOM order
    allElements.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    // Extract content from each message
    allElements.forEach((item, index) => {
      const element = item.element;
      let textContent = '';

      if (item.type === 'user') {
        // Look for query text container
        const queryText = element.querySelector('.query-text');
        textContent = queryText ? queryText.innerText : element.innerText;
      } else {
        // Look for response text container
        const responseText = element.querySelector('.model-response-text');
        textContent = responseText ? responseText.innerText : element.innerText;
      }

      // Clean up UI elements
      textContent = cleanUIElements(textContent);

      if (textContent && textContent.trim().length > 0) {
        const role = item.type === 'user' ? 'User' : 'Gemini';
        const codeBlocks = extractCodeBlocks(element);

        messages.push({
          role: role,
          content: textContent.trim(),
          codeBlocks: codeBlocks,
          index: index
        });
      }
    });

    console.log(`Extracted ${messages.length} messages`);
    return messages;
    
  } catch (error) {
    console.error('Error extracting messages:', error);
    return [];
  }
}

/**
 * Deduplicate messages based on content
 * @param {Array} messages - Array of message objects
 * @returns {Array} Deduplicated array of messages
 */
function deduplicateMessages(messages) {
  const seen = new Set();
  const deduplicated = [];

  for (const message of messages) {
    // Create a unique key based on role and a hash of the full content
    // Use first 200 chars + last 100 chars + length to catch long duplicates
    const contentSample = message.content.length > 300
      ? message.content.substring(0, 200) + message.content.substring(message.content.length - 100) + message.content.length
      : message.content;
    const key = `${message.role}:${contentSample}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(message);
    }
  }

  return deduplicated;
}

/**
 * Clean up UI elements and artifacts from text content
 * @param {string} text - The text to clean
 * @returns {string} Cleaned text
 */
function cleanUIElements(text) {
  if (!text) return text;

  // Remove common UI button texts
  const uiPatterns = [
    /^Show thinking\s*/gm,
    /^Hide thinking\s*/gm,
    /^Copy code\s*/gm,
    /^Copied!\s*/gm,
    /^Share\s*/gm,
    /^Edit\s*/gm
  ];

  let cleaned = text;
  uiPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned;
}

/**
 * Extract code blocks from a message element
 * @param {Element} element - The message element to search
 * @returns {Array} Array of code block objects
 */
function extractCodeBlocks(element) {
  const codeBlocks = [];
  const preElements = element.querySelectorAll('pre');
  
  preElements.forEach(pre => {
    const codeElement = pre.querySelector('code');
    if (codeElement) {
      const language = detectLanguage(codeElement);
      const code = codeElement.textContent || codeElement.innerText;
      
      codeBlocks.push({
        language: language,
        code: code.trim()
      });
    }
  });
  
  return codeBlocks;
}

/**
 * Attempt to detect programming language from code element classes
 * @param {Element} codeElement - The code element
 * @returns {string} Detected language or empty string
 */
function detectLanguage(codeElement) {
  const classes = codeElement.className || '';
  
  // Common patterns: language-javascript, lang-python, hljs-javascript, etc.
  const langMatch = classes.match(/(?:language-|lang-|hljs-)(\w+)/);
  if (langMatch) {
    return langMatch[1];
  }
  
  // Check parent pre element too
  const preClasses = codeElement.parentElement?.className || '';
  const preLangMatch = preClasses.match(/(?:language-|lang-)(\w+)/);
  if (preLangMatch) {
    return preLangMatch[1];
  }
  
  return '';
}

/**
 * Get the chat title from the page
 * @returns {string} Chat title or default
 */
function getChatTitle() {
  // Since Gemini doesn't display a title in the main chat area,
  // generate a title from the first user message
  const firstUserMessage = document.querySelector('.user-query-container, [class*="user-query-bubble"]');

  if (firstUserMessage) {
    let text = firstUserMessage.innerText || firstUserMessage.textContent;

    // Clean up the text
    text = cleanUIElements(text);
    text = text.trim();

    // Take first line or first 60 characters, whichever is shorter
    const firstLine = text.split('\n')[0];
    const truncated = firstLine.length > 60 ? firstLine.substring(0, 60) : firstLine;

    if (truncated.length > 0) {
      console.log('Generated title from first message:', truncated);
      return truncated + (firstLine.length > 60 ? '...' : '');
    }
  }

  console.log('Using default title');
  return 'Gemini Conversation';
}

/**
 * Convert extracted messages to Markdown format
 * @param {Array} messages - Array of message objects
 * @returns {string} Formatted Markdown string
 */
function convertToMarkdown(messages) {
  const title = getChatTitle();
  const timestamp = new Date().toLocaleString();

  let markdown = `# ${title}\n\n`;
  markdown += `*Exported: ${timestamp}*\n\n`;
  markdown += `---\n\n`;

  messages.forEach(msg => {
    markdown += `## ${msg.role}\n\n`;

    let content = msg.content;

    // Replace code blocks inline with properly formatted markdown
    if (msg.codeBlocks && msg.codeBlocks.length > 0) {
      msg.codeBlocks.forEach((block, index) => {
        const codeText = block.code.trim();
        const placeholder = `<<<CODE_BLOCK_${index}>>>`;

        // Replace the first occurrence of this code block with a placeholder
        content = content.replace(codeText, placeholder);

        // Also remove standalone language labels that might appear before code blocks
        if (block.language) {
          // Remove lines that are just the language name (case insensitive)
          const langPattern = new RegExp(`^\\s*${block.language}\\s*$`, 'gmi');
          content = content.replace(langPattern, '');
        }
      });

      // Now replace placeholders with properly formatted code blocks
      msg.codeBlocks.forEach((block, index) => {
        const placeholder = `<<<CODE_BLOCK_${index}>>>`;
        const lang = block.language || '';
        const formattedCode = `\n\n\`\`\`${lang}\n${block.code}\n\`\`\`\n\n`;
        content = content.replace(placeholder, formattedCode);
      });
    }

    // Clean up multiple consecutive blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Add the content with inline code blocks
    markdown += `${content.trim()}\n\n`;
  });

  return markdown;
}

/**
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'exportChat') {
    try {
      const messages = extractChatMessages();
      
      if (messages.length === 0) {
        sendResponse({ 
          success: false, 
          error: 'No messages found. Make sure you are on a Gemini chat page.' 
        });
        return true;
      }
      
      const markdown = convertToMarkdown(messages);

      // Add a note about scrolling for long conversations
      let warningNote = '';
      if (messages.length > 10) {
        warningNote = '\n\n**Note:** For long conversations, make sure you\'ve scrolled through the entire chat history before exporting to ensure all messages are loaded in the page.';
      }

      sendResponse({
        success: true,
        markdown: markdown + warningNote,
        messageCount: messages.length,
        warning: messages.length > 10 ? 'For long conversations, scroll to the top first to load all messages.' : null
      });
      
    } catch (error) {
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
    
    return true; // Required for async response
  }
});

// Log when content script loads
console.log('Gemini Chat Exporter: Content script loaded');
