document
  .getElementById("chatForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userInput = document.getElementById("userInput").value;
    if (userInput.trim() !== "") {
      addMessage(userInput, "user");
      document.getElementById("userInput").value = "";

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
        });
    }
  });

function addMessage(content, type) {
  const messageContainer = document.getElementById("messageContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.innerText = content;
  messageContainer.appendChild(messageDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}