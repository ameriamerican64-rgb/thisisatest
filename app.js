const chatWindow = document.querySelector('.chat-window');
const composer = document.querySelector('.composer');
const promptField = document.querySelector('#prompt');
const sendButton = document.querySelector('.send');
const messageTemplate = document.querySelector('#message-template');
const settingsToggle = document.querySelector('.settings-toggle');
const settingsPanel = document.querySelector('.settings-panel');
const themeInputs = document.querySelectorAll('input[name="theme"]');
const compactToggle = document.querySelector('#compact-mode');
const logoutButton = document.querySelector('#logout-button');
const userNameField = document.querySelector('.user-name');
const loginOverlay = document.querySelector('.auth-overlay');
const loginForm = document.querySelector('#login-form');
const displayNameField = document.querySelector('#display-name');

let settingsOpen = false;

const sampleReplies = [
  "Here's a sparkly thought: focus on the next actionable step, and your plan will reveal itself like stardust.",
  "I don't have an API yet, but my imagination is fully online. What shall we dream up together?",
  "PurpleGlass thinks your idea has real shimmer. Try outlining the goal, the why, and the first move.",
  "Consider pairing inspiration with structure. A quick bullet list can turn a vibe into a roadmap.",
  "I'm all about luminous clarity. Need feedback, a summary, or a poem? Just say the word!",
  "Glossy tip: take a mindful pause, breathe in, and let your next question glow brighter.",
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createMessage(role, content) {
  const node = messageTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(role);
  const avatar = node.querySelector('.avatar');
  const bubble = node.querySelector('.bubble');

  if (role === 'user') {
    avatar.textContent = '🙂';
  } else {
    avatar.textContent = '🤖';
  }

  bubble.innerHTML = content;
  return node;
}

function scrollToBottom() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: 'smooth',
  });
}

function setTypingIndicator(visible) {
  if (visible) {
    const typing = createMessage(
      'assistant',
      '<div class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></div>'
    );
    typing.classList.add('typing');
    chatWindow.append(typing);
    scrollToBottom();
  } else {
    const indicator = chatWindow.querySelector('.message.typing');
    if (indicator) {
      indicator.remove();
    }
  }
}

function getRandomReply() {
  const index = Math.floor(Math.random() * sampleReplies.length);
  return sampleReplies[index];
}

function handleSubmit(event) {
  event.preventDefault();
  if (!document.body.classList.contains('is-authenticated')) {
    return;
  }

  const text = promptField.value.trim();

  if (!text) {
    return;
  }

  const safeText = escapeHtml(text).replace(/\n/g, '<br>');
  const userMessage = createMessage('user', `<p>${safeText}</p>`);
  chatWindow.append(userMessage);
  scrollToBottom();

  promptField.value = '';
  promptField.style.height = 'auto';
  promptField.focus();

  setTypingIndicator(true);

  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    setTypingIndicator(false);
    const reply = getRandomReply();
    const assistantMessage = createMessage('assistant', `<p>${reply}</p>`);
    chatWindow.append(assistantMessage);
    scrollToBottom();
  }, delay);
}

promptField.addEventListener('input', () => {
  promptField.style.height = 'auto';
  promptField.style.height = `${Math.min(promptField.scrollHeight, 200)}px`;
});

promptField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

composer.addEventListener('submit', handleSubmit);

function setSettingsOpen(open) {
  settingsOpen = open;
  settingsPanel.classList.toggle('open', open);
  settingsToggle.setAttribute('aria-expanded', String(open));
}

function applyTheme(theme) {
  const selectedTheme = theme === 'midnight' ? 'midnight' : 'glow';
  document.body.dataset.theme = selectedTheme;
  localStorage.setItem('pg-theme', selectedTheme);
  themeInputs.forEach((input) => {
    input.checked = input.value === selectedTheme;
  });
}

function applyCompact(compact) {
  document.body.classList.toggle('compact', compact);
  compactToggle.checked = compact;
  localStorage.setItem('pg-compact', compact ? '1' : '0');
}

function updateComposerAvailability(enabled) {
  promptField.disabled = !enabled;
  sendButton.disabled = !enabled;
}

function renderUser(name) {
  const hasName = Boolean(name);
  document.body.classList.toggle('is-authenticated', hasName);
  userNameField.textContent = hasName ? name : 'Guest';
  if (hasName) {
    localStorage.setItem('pg-username', name);
  } else {
    localStorage.removeItem('pg-username');
  }
  updateComposerAvailability(hasName);
}

function showLogin() {
  loginOverlay.classList.add('visible');
  document.body.classList.add('modal-open');
  displayNameField.value = '';
  setTimeout(() => {
    displayNameField.focus();
  }, 50);
}

function hideLogin() {
  loginOverlay.classList.remove('visible');
  document.body.classList.remove('modal-open');
}

settingsToggle.addEventListener('click', () => {
  setSettingsOpen(!settingsOpen);
});

document.addEventListener('click', (event) => {
  if (
    settingsOpen &&
    !settingsPanel.contains(event.target) &&
    !settingsToggle.contains(event.target)
  ) {
    setSettingsOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsOpen) {
    setSettingsOpen(false);
    settingsToggle.focus();
  }
});

themeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    applyTheme(input.value);
  });
});

compactToggle.addEventListener('change', (event) => {
  applyCompact(event.target.checked);
});

logoutButton.addEventListener('click', () => {
  setSettingsOpen(false);
  renderUser(null);
  showLogin();
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = displayNameField.value.trim();
  if (!name) {
    displayNameField.focus();
    return;
  }
  renderUser(name);
  hideLogin();
  setSettingsOpen(false);
  promptField.focus();
});

function initialiseFromStorage() {
  const savedTheme = localStorage.getItem('pg-theme') || 'glow';
  const savedCompact = localStorage.getItem('pg-compact') === '1';
  const savedUser = localStorage.getItem('pg-username');

  applyTheme(savedTheme);
  applyCompact(savedCompact);
  setSettingsOpen(false);

  if (savedUser) {
    renderUser(savedUser);
    hideLogin();
    promptField.focus();
  } else {
    renderUser(null);
    showLogin();
  }
}

initialiseFromStorage();
