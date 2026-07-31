document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const activeDocument = document.getElementById('activeDocument');
  const docName = document.getElementById('docName');
  const removeDocBtn = document.getElementById('removeDocBtn');

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  let isUploading = false;
  let hasDocument = false;

  // --- Upload Logic ---

  // Trigger file input click
  dropZone.addEventListener('click', (e) => {
    if (isUploading) return;
    fileInput.click();
  });

  // Drag events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (isUploading) return;

    if (e.dataTransfer.files.length) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Handle the file upload via API
  async function handleFileUpload(file) {
    if (file.type !== 'application/pdf') {
      addMessage('assistant', 'Sorry, I can only process PDF files. Please upload a valid PDF.');
      return;
    }

    isUploading = true;
    dropZone.classList.add('hidden');
    uploadStatus.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        uploadStatus.classList.add('hidden');
        activeDocument.classList.remove('hidden');
        docName.textContent = file.name;

        hasDocument = true;
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.placeholder = "Ask a question about " + file.name + "...";
        chatInput.focus();

        addMessage('assistant', `Successfully processed **${file.name}**! What would you like to know about it?`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      uploadStatus.classList.add('hidden');
      dropZone.classList.remove('hidden');
      isUploading = false;
      addMessage('assistant', `Error uploading file: ${error.message}`);
    }

    fileInput.value = '';
  }

  // Remove document
  removeDocBtn.addEventListener('click', () => {
    hasDocument = false;
    activeDocument.classList.add('hidden');
    dropZone.classList.remove('hidden');

    chatInput.disabled = true;
    sendBtn.disabled = true;
    chatInput.placeholder = "Upload a document to start chatting...";
    chatInput.value = '';

    addMessage('assistant', 'Document removed. Please upload another PDF to continue.');
  });

  // --- Chat Logic ---

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const question = chatInput.value.trim();
    if (!question || !hasDocument) return;

    // Add user message
    addMessage('user', question);

    // Clear input
    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    const typingId = addTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const result = await response.json();

      // Remove typing indicator
      document.getElementById(typingId).remove();

      if (result.success) {
        addMessage('assistant', result.data.answer);
        
        // Show chunks below the answer
        if (result.data.chunks && result.data.chunks.length > 0) {
          addChunks(result.data.chunks);
        }
      } else {
        throw new Error(result.message || 'Chat failed');
      }
    } catch (error) {
      document.getElementById(typingId).remove();
      addMessage('assistant', `Error: ${error.message}`);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  });

  // Helper to add messages to the DOM
  function addMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    const icon = role === 'user' ? 'bi-person-fill' : 'bi-robot';

    // Convert basic markdown (bold) to HTML for nicer display
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    msgDiv.innerHTML = `
      <div class="avatar"><i class="bi ${icon}"></i></div>
      <div class="message-bubble">${formattedText}</div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Helper to add a typing indicator bubble
  function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = `message assistant`;
    msgDiv.id = id;

    msgDiv.innerHTML = `
      <div class="avatar"><i class="bi bi-robot"></i></div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return id;
  }

  // Helper to render chunks one below the other
  function addChunks(chunks) {
    const container = document.createElement('div');
    container.className = 'chunks-wrapper';

    let html = '<div class="chunks-title"><i class="bi bi-file-text"></i> Matching Chunks</div>';

    chunks.forEach((chunk, index) => {
      html += `
        <div class="chunk-card">
          <div class="chunk-header">Chunk ${index + 1} &bull; Page ${chunk.page || 1} &bull; ${chunk.source || 'Unknown'}</div>
          <div class="chunk-body">${chunk.text}</div>
        </div>
      `;
    });

    container.innerHTML = html;
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

});
