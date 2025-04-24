const synth = window.speechSynthesis;

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (message === "") return;

  appendMessage(message, "user");
  input.value = "";

  const response = await fetch("https://disease-2-gqkg.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  appendMessage(data.response, "bot");
  speakText(data.response);
}

function appendMessage(text, sender) {
  const messagesDiv = document.getElementById("messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  if (sender === "bot") {
    messageDiv.innerHTML = `
      <div class="bot-text" data-original="${text}">${text}</div>
      <button class="translate-button" onclick="toggleTranslate(this)">Translate to Telugu</button>
    `;
  } else {
    messageDiv.textContent = text;
  }

  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function toggleTranslate(button) {
  const textDiv = button.previousElementSibling;
  const original = textDiv.getAttribute("data-original");
  const currentText = textDiv.textContent;
  const isTelugu = currentText !== original;

  if (isTelugu) {
    textDiv.textContent = original;
    button.textContent = "Translate to Telugu";
    speakText(original, 'en-US');
  } else {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(original)}`);
    const data = await response.json();
    const translatedText = data[0].map(part => part[0]).join("");
    textDiv.textContent = translatedText;
    button.textContent = "Translate to English";
    speakText(translatedText, 'te-IN');
  }
}

function speakText(text, lang = 'en-US') {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    synth.cancel(); // stop any ongoing speech
    synth.speak(utter);
  }
}

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser doesn't support speech recognition");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    sendMessage();
  };

  recognition.onerror = function(event) {
    alert("Speech recognition error: " + event.error);
  };

  recognition.start();
}
