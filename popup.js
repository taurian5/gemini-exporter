// Gemini Chat Exporter - Popup Script
// Handles UI interactions and coordinates export process

const exportBtn = document.getElementById('exportBtn');
const statusDiv = document.getElementById('status');
const infoDiv = document.getElementById('info');

/**
 * Update status display
 * @param {string} message - Status message to display
 * @param {string} type - Status type: 'info', 'success', 'error'
 */
function updateStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
}

/**
 * Hide status display
 */
function hideStatus() {
  statusDiv.classList.add('hidden');
}

/**
 * Disable/enable export button
 * @param {boolean} disabled - Whether button should be disabled
 */
function setButtonState(disabled) {
  exportBtn.disabled = disabled;
  if (disabled) {
    exportBtn.classList.add('disabled');
  } else {
    exportBtn.classList.remove('disabled');
  }
}

/**
 * Generate filename for the exported markdown
 * @returns {string} Formatted filename
 */
function generateFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `gemini-chat-${year}-${month}-${day}-${hours}${minutes}${seconds}.md`;
}

/**
 * Download markdown content as a file
 * @param {string} content - Markdown content to download
 */
function downloadMarkdown(content) {
  const filename = generateFilename();
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false  // Auto-download to Downloads folder
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      updateStatus(`Download failed: ${chrome.runtime.lastError.message}`, 'error');
    } else {
      updateStatus(`Exported successfully!`, 'success');
      setTimeout(() => {
        window.close(); // Close popup after successful export
      }, 1500);
    }
    
    // Clean up the blob URL
    URL.revokeObjectURL(url);
  });
}

/**
 * Main export handler
 */
async function handleExport() {
  try {
    // Disable button and show loading state
    setButtonState(true);
    updateStatus('Extracting chat...', 'info');
    infoDiv.classList.add('hidden');
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a Gemini page
    if (!tab.url || !tab.url.includes('gemini.google.com')) {
      updateStatus('Please open a Gemini chat page first', 'error');
      setButtonState(false);
      return;
    }
    
    // Send message to content script to extract chat
    chrome.tabs.sendMessage(tab.id, { action: 'exportChat' }, (response) => {
      // Re-enable button
      setButtonState(false);
      
      // Check for errors
      if (chrome.runtime.lastError) {
        updateStatus(`Error: ${chrome.runtime.lastError.message}`, 'error');
        return;
      }
      
      if (!response) {
        updateStatus('No response from page. Try refreshing the Gemini page.', 'error');
        return;
      }
      
      if (!response.success) {
        updateStatus(response.error || 'Failed to extract chat', 'error');
        return;
      }
      
      // Success - show warning if present, then download
      if (response.warning) {
        updateStatus(response.warning, 'info');
        setTimeout(() => {
          updateStatus(`Found ${response.messageCount} messages. Downloading...`, 'success');
          downloadMarkdown(response.markdown);
        }, 2000);
      } else {
        updateStatus(`Found ${response.messageCount} messages. Downloading...`, 'success');
        downloadMarkdown(response.markdown);
      }
    });
    
  } catch (error) {
    setButtonState(false);
    updateStatus(`Error: ${error.message}`, 'error');
    console.error('Export error:', error);
  }
}

// Event listeners
exportBtn.addEventListener('click', handleExport);

// Check if we're on a Gemini page on popup load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url && !tabs[0].url.includes('gemini.google.com')) {
    updateStatus('Not on a Gemini page', 'error');
    setButtonState(true);
  }
});
