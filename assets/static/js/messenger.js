(function () {
    const searchIcon = document.querySelector('.search-icon');
    const removeIcon = document.querySelector('.remove-icon');
    const searchBox = document.querySelector(".search-box");
    const searchUser = document.getElementById("search-user");
    let chatList = document.getElementById("chat-list");
    let chatHeader = document.getElementById("chat-header")
    const sendBtn = document.getElementById("send-button");
    let messageDisplay = document.getElementById("messages");

    const requestBody = {
        input: searchUser.value,
        index: 0
    }

    const selectedUser = {
        receiver: null,
        index: 0,
        isSelected: false,
        page: 10
    }

    function attachUserListeners() {
        const usersInChatBox = document.querySelectorAll("#chat-list > li");
        usersInChatBox.forEach(element => {
            element.removeEventListener('click', selectChat);
            element.addEventListener('click', selectChat);
        });
    }

    attachUserListeners();

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout)
            timeout = setTimeout(() => func(...args), wait)
        }
    }

    async function fetchUsersApi(url, requestBody) {
        try {
            const response = await fetch(url, {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })
            return response.json()
        } catch (error) {
            console.error("Fetch error:", error);
            return { users: [] };
        }
    }

    async function userSearch() {
        const url = "/messenger"
        let responseData;

        if (requestBody.input === searchUser.value) {
            ++requestBody.index
        } else {
            requestBody.index = 0
            requestBody.input = searchUser.value
            chatList.innerHTML = ""
        }

        if (requestBody.input.length > 0 && requestBody.input.length < 40 && requestBody.index >= 0) {
            responseData = await fetchUsersApi(url, requestBody)

            if (responseData && responseData.users) {
                responseData.users.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.setAttribute('data-user', user);
                    listItem.textContent = user;
                    chatList.appendChild(listItem);
                });

                attachUserListeners();
            }
        }
    }

    function selectChat(e) {
        messageDisplay.innerHTML = ""
        selectedUser.receiver = e.target.dataset.user;
        selectedUser.isSelected = true
        selectedUser.index = 0
        chatHeader.innerHTML = selectedUser.receiver
        chatList.innerHTML = ""
        searchUser.value = ""
        document.getElementById('message').removeAttribute('readonly');
        loadingChat()
        console.log("Selected user:", selectedUser);
    }

    function displaySearchBox() {
        searchBox.classList.add('visible');
    }

    function hideSearchBox() {
        searchBox.classList.remove('visible');
        chatList.innerHTML = "";
        attachUserListeners();
    }

    function createMessage(message, action) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const day = now.toLocaleDateString([], { weekday: 'short' });

        // Add message to display with timestamp
        messageDisplay.innerHTML += `<div class="message-box ${action}">
                <div class="message-body">${message}</div>
                <p class="message-info">${day}, ${time}</p>
            </div>`;

        // Scroll to bottom
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }

    // Message handler for the Messenger page
    function handleMessengerMessage(chatData) {
        // Only process messages for the current chat
        if ((chatData.sender === window.loggedUser && chatData.receiver === selectedUser.receiver) ||
            (chatData.receiver === window.loggedUser && chatData.sender === selectedUser.receiver)) {
            const action = chatData.sender === window.loggedUser ? "sent" : "received";
            createMessage(chatData.message, action);
        }
    }

    function sendMessage() {
        let input = document.getElementById("message");
        let messageInput = input.value.trim();

        if (messageInput === "" || !selectedUser.isSelected) {
            return;
        }

        const message = {
            sender: window.loggedUser,
            receiver: selectedUser.receiver,
            message: messageInput
        };

        // Use the WebSocket manager to send the message
        if (window.WebSocketManager && window.WebSocketManager.sendMessage(message)) {
            input.value = "";
        }
    }

    async function loadingChat() {
        ++selectedUser.index;
        const responseData = await fetchChat();
        console.log(responseData);

        if (responseData && responseData.chats) {
            responseData.chats.forEach((chat) => {
                const flag = chat.sender == window.loggedUser ? "sent" : "received";
                createMessage(chat.message, flag);
            });

            if (!responseData.hasMore) {
                messageDisplay.innerHTML = `<p style="order:-10000000; text-align:center;">Start Chatting</p>` + messageDisplay.innerHTML;
            }
        }
    }

    async function fetchChat() {
        try {
            const response = await fetch("/api/load_messages", {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedUser)
            });

            if (response.ok) {
                return response.json();
            }
        } catch (error) {
            console.log(error);
            return { chats: [], hasMore: false };
        }
    }

    const debouncedPrint = debounce(userSearch, 500);

    window.appRegistry.registerEventListener(searchIcon, 'click', displaySearchBox);
    window.appRegistry.registerEventListener(removeIcon, 'click', hideSearchBox);
    window.appRegistry.registerEventListener(searchUser, 'input', debouncedPrint);
    window.appRegistry.registerEventListener(sendBtn, 'click', sendMessage);

    // Register message handler for this page
    if (window.WebSocketManager) {
        window.WebSocketManager.registerMessageHandler(handleMessengerMessage);

        // Clean up when navigating away
        window.appRegistry.registerEventListener(window, 'beforeunload', function () {
            window.WebSocketManager.removeMessageHandler(handleMessengerMessage);
        });
    }
})();