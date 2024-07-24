document
  .getElementById("chatForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userInput = document.getElementById("userInput").value;
    if (userInput.trim() !== "") {
      addMessage(userInput, "user");
      document.getElementById("userInput").value = "";

      document.getElementById("loadingDots").classList.remove("d-none");

      fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ message: userInput }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.response) {
            // Gelen yanıttaki [doc1], [doc2] ifadelerini temizlde
            const cleanedResponse = data.response.replace(/\[doc\d+\]/g, "");
            addMessage(cleanedResponse, "bot");
          } else {
            // throws 429 rate limit error
            console.error("Error:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          document.getElementById("loadingDots").classList.add("d-none");
        });
    }
  });

function addMessage(content, type) {
  const messageContainer = document.getElementById("messageContainer");
  const messageDiv = document.createElement("div");
  //messageDiv.className = 'message ${type}';
  messageDiv.className = `message ${type}`;
  messageDiv.innerText = content;
  messageContainer.appendChild(messageDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}


document.addEventListener('DOMContentLoaded', () => {
  const chatHistoryList = document.getElementById('chatHistoryList');

  // Function to fetch chat history from the server
  async function fetchChatHistory() {
    try {
      const response = await fetch('/api/chatHistory');  // Call the Flask endpoint
      const data = await response.json();
      return data.map(chat => `Chat: ${chat.message}`);  // Adjust this based on your data structure
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Function to display chat history
  async function displayChatHistory() {
    const chatHistory = await fetchChatHistory();
    chatHistoryList.innerHTML = '';  // Clear previous items
    chatHistory.forEach(chat => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item';
      listItem.textContent = chat;
      chatHistoryList.appendChild(listItem);
    });
  }

  // Event listener for the offcanvas show event
  const offcanvasChatHistory = document.getElementById('offcanvasChatHistory');
  offcanvasChatHistory.addEventListener('show.bs.offcanvas', displayChatHistory);
});