const chatWindow = document.querySelector('.chat-window');
const composer = document.querySelector('.composer');
const promptField = document.querySelector('#prompt');
const messageTemplate = document.querySelector('#message-template');

const sampleReplies = [
  "Here\'s a sparkly thought: focus on the next actionable step, and your plan will reveal itself like stardust.",
  "I don\'t have an API yet, but my imagination is fully online. What shall we dream up together?",
  "PurpleGlass thinks your idea has real shimmer. Try outlining the goal, the why, and the first move.",
  "Consider pairing inspiration with structure. A quick bullet list can turn a vibe into a roadmap.",
  "I\'m all about luminous clarity. Need feedback, a summary, or a poem? Just say the word!",
  "Glossy tip: take a mindful pause, breathe in, and let your next question glow brighter." 
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

composer.addEventListener('submit', handleSubmit);

promptField.focus();
