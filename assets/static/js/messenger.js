// import { showAlert } from "/static/js/alert.js";

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

    const scrollHelper = {
        hasMore: false,
        isLoading: false,
        scrollThreshold: 50,
        scrollTop: messageDisplay.scrollTop,
        scrollHeight: 0,
        newScrollHeight: 0
    }

    function attachUserListeners() {
        const usersInChatBox = document.querySelectorAll("#chat-list > li");
        usersInChatBox.forEach(element => {
            element.removeEventListener('click', window.selectChatFromOnlineUsers.goToChat);
            element.addEventListener('click', window.selectChatFromOnlineUsers.goToChat);
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



    const select = {
        element: null,
        goToChat(e) {
            messageDisplay.innerHTML = "";
            selectedUser.receiver = !e ? this.element.target.dataset.user : e.target.dataset.user
            selectedUser.isSelected = true
            selectedUser.index = 0
            chatList.innerHTML = ""
            searchUser.value = ""
            loadingChat()
            console.log("Selected user:", selectedUser);

        },
        initializeElement(e) {
            this.element = e
        }
    }

    window.selectChatFromOnlineUsers = select

    function displaySearchBox() {
        searchBox.classList.add('visible');
    }

    function hideSearchBox() {
        searchBox.classList.remove('visible');
        chatList.innerHTML = "";
        attachUserListeners();
    }

    function formatMessageDate(dateString) {
        // Parse the input date string or use current date
        const date = !dateString ? new Date() : new Date(dateString);
        const now = new Date();

        // Format time (HH:MM)
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeFormat = `${hours}:${minutes}`;

        // Format day and month
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Check if date is from current year
        const isCurrentYear = date.getFullYear() === now.getFullYear();

        // Check if date is from today
        const isToday = date.toDateString() === now.toDateString();

        // Format based on how recent the date is
        if (isToday) {
            // If message is from today, just show the time
            return timeFormat;
        } else if (isCurrentYear) {
            // If message is from this year but not today, show day/month, time
            return `${day}/${month}, ${timeFormat}`;
        } else {
            // If message is from previous years, show day/month/year, time
            const year = date.getFullYear();
            return `${day}/${month}/${year}, ${timeFormat}`;
        }
    }

    function createMessage(message, sender, action, date) {

        // if (!date) date=
        const newDate = formatMessageDate(date);

        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = `
        <div class="message-box ${action}">
            <div class="message-body">
                <div class="sender-container">
                    <p class="sender-name">${sender}</p>
                </div>
                <div style="display:flex;gap:5px;">
                    <p>${message}</p>
                    <p class="message-info">${newDate}</p>
                </div>
            </div>
        </div>`;

        if (!messageDisplay.hasChildNodes() || !date) {
            messageDisplay.appendChild(tempContainer)
        } else {
            messageDisplay.insertBefore(tempContainer, messageDisplay.firstElementChild)
        }

        !scrollHelper.isLoading ? messageDisplay.scrollTop = messageDisplay.scrollHeight : false;

    }

    // Message handler for the Messenger page
    function handleMessengerMessage(chatData) {
        // Only process messages for the current chat
        if ((chatData.sender === window.loggedUser && chatData.receiver === selectedUser.receiver) ||
            (chatData.receiver === window.loggedUser && chatData.sender === selectedUser.receiver)) {
            const action = chatData.sender === window.loggedUser ? "sent" : "received";
            createMessage(chatData.message, window.loggedUser, action);
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

        if (responseData) {
            chatHeader.innerHTML = selectedUser.receiver
            document.getElementById('message').removeAttribute('readonly');
            scrollHelper.hasMore = responseData.hasMore
            const scrollHeight = messageDisplay.scrollHeight;
            if (responseData.chats) {
                responseData.chats.reverse().forEach((chat) => {
                    const flag = chat.sender == window.loggedUser ? "sent" : "received";
                    createMessage(chat.message, chat.sender, flag, chat.create_date);
                }); 
            }

            // scrollHelper.newScrollHeight = 
            const newScrollHeight = messageDisplay.scrollHeight;
            messageDisplay.scrollTop = newScrollHeight - scrollHeight;
            if (!responseData.hasMore) {
                messageDisplay.innerHTML = `<p style="order:-10000000; text-align:center;">Start Chatting</p>` + messageDisplay.innerHTML;
            }
        }

        scrollHelper.isLoading = false
    }

    async function fetchChat() {
        try {
            const response = await fetch("/api/load_messages", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedUser)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                return data; // This return is correct
            } else {
                const data = await response.json();
                window.showAlert(data.message);
                // return { chats: [], hasMore: false }; // Return default value on error
            }
        } catch (error) {
            console.log(error);
            // return { chats: [], hasMore: false }; // Return default value on exception
        }
    }

    function checkLoadMore() {
        if (scrollHelper.isLoading || !selectedUser.isSelected || !scrollHelper.hasMore) return;
        console.log("scrollTop:", messageDisplay.scrollTop)
        console.log("scrollThreshold:", scrollHelper.scrollThreshold)
        if (messageDisplay.scrollTop < scrollHelper.scrollThreshold) {
            scrollHelper.isLoading = true;
            loadingChat();
        }
    }

    const debouncedPrint = debounce(userSearch, 500);
    const debounceLoadMore = debounce(checkLoadMore, 500);

    window.appRegistry.registerEventListener(messageDisplay, 'scroll', debounceLoadMore);
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

