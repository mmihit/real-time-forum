// import { showAlert } from "/static/js/alert.js";

(function () {
    let chatList = document.getElementById("chat-list");
    let chatHeader = document.getElementById("chat-header")
    const sendBtn = document.getElementById("send-button");
    let messageDisplay = document.getElementById("messages");

    const isTypingHtmlEffect = `
    <div class="typing-wrapper" id="typing-wrapper">
        <span class="typing-text">typing</span>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>`

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

    const select = {
        // messagesListElemes:null,
        element: null,
        goToChat(e) {
            console.log("this is the element: ", e)
            messageDisplay.innerHTML = "";
            selectedUser.receiver = !e ? this.element.target.dataset.user : e.target.dataset.user
            selectedUser.isSelected = true
            selectedUser.index = 0
            chatList.innerHTML = window.messagesListInnerHtml
            loadingChat()
            console.log("Selected user:", selectedUser);
            attachUserListeners()
        },
        initializeElement(e) {
            this.element = e
        }
    }

    window.selectChatFromOnlineUsers = select

    function attachUserListeners() {
        if (document.querySelectorAll(".profile-card")) {
            document.querySelectorAll(".profile-card").forEach(element => {
                element.removeEventListener('click', window.selectChatFromOnlineUsers.goToChat);
                element.addEventListener('click', window.selectChatFromOnlineUsers.goToChat);
            });
        }

    }

    attachUserListeners();

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout)
            timeout = setTimeout(() => func(...args), wait)
        }
    }

    function formatMessageDate(dateString) {
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
        if ((chatData.sender === window.localStorage.getItem("user") && chatData.receiver === selectedUser.receiver) ||
            (chatData.receiver === window.localStorage.getItem("user") && chatData.sender === selectedUser.receiver)) {
            const action = chatData.sender === window.localStorage.getItem("user") ? "sent" : "received";
            createMessage(chatData.message, chatData.sender, action);
        }
    }

    function handleTyping(data) {
        if (data.receiver === window.localStorage.getItem("user")) {
            if (data.isTyping != undefined && data.isTyping === true) {
                if (data.sender === selectedUser.receiver) {
                    chatHeader.innerHTML += isTypingHtmlEffect
                    document.querySelector('.chat-header .typing-wrapper').classList.add('selected')
                } else {
                    const lastMessageElement = document.querySelector(`#last-message[data-user="${data.sender}"]`);
                    lastMessageElement.parentElement.innerHTML += isTypingHtmlEffect
                    document.querySelector(`#last-message[data-user="${data.sender}"]`).nextElementSibling.classList.add("not-selected")
                    document.querySelector(`#last-message[data-user="${data.sender}"]`).style.display = "none"
                }
            } else if (data.isTyping != undefined && data.isTyping === false) {
                document.querySelectorAll(".typing-wrapper").forEach(element => {
                    element.remove()
                });
                if (data.sender !== selectedUser.receiver) {
                    const lastMessageElement = document.querySelector(`#last-message[data-user="${data.sender}"]`);
                    lastMessageElement.style.display = "block"
                }
            }
        }
    }

    function setupTypingListener() {

        let input = document.getElementById("message");

        let typingTimeout;
        let isTyping = false;

        input.addEventListener("input", () => {
            const data = {
                sender: window.localStorage.getItem("user"),
                receiver: selectedUser.receiver,
                isTyping: null,
                type: "IsTyping"
            }

            if (!isTyping) {

                isTyping = true;
                data.isTyping = true;
                window.WebSocketManager.sendMessage(data)
                console.log(data)
            }

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                isTyping = false;
                data.isTyping = false;
                window.WebSocketManager.sendMessage(data)
            }, 1000)
        })
    }

    setupTypingListener();

    const escapeHTML = (text) => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function sendMessage() {
        let input = document.getElementById("message");
        let messageInput = input.value.trim();

        if (messageInput === "" || !selectedUser.isSelected) {
            return;
        }

        const message = {
            sender: window.localStorage.getItem("user"),
            receiver: selectedUser.receiver,
            message: escapeHTML(messageInput)
        };

        if (window.WebSocketManager && window.WebSocketManager.sendMessage(message)) {
            input.value = "";
        }
    }

    async function loadingChat() {
        ++selectedUser.index;
        const responseData = await fetchChat();

        if (responseData) {
            chatHeader.innerHTML = `<p>${selectedUser.receiver}</p>`
            document.getElementById('message').removeAttribute('readonly');
            scrollHelper.hasMore = responseData.hasMore
            const scrollHeight = messageDisplay.scrollHeight;
            if (responseData.chats) {
                responseData.chats.reverse().forEach((chat) => {
                    const flag = chat.sender == window.localStorage.getItem("user") ? "sent" : "received";
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
                return data; // This return is correct
            } else {
                const data = await response.json();
                window.showAlert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }


    function checkLoadMore() {
        if (scrollHelper.isLoading || !selectedUser.isSelected || !scrollHelper.hasMore) return;
        if (messageDisplay.scrollTop < scrollHelper.scrollThreshold) {
            scrollHelper.isLoading = true;
            loadingChat();
        }
    }

    // const debouncedPrint = debounce(userSearch, 500);
    const debounceLoadMore = debounce(checkLoadMore, 500);

    window.appRegistry.registerEventListener(messageDisplay, 'scroll', debounceLoadMore);
    window.appRegistry.registerEventListener(sendBtn, 'click', sendMessage);

    // Register message handler for this page
    if (window.WebSocketManager) {
        window.WebSocketManager.registerMessageHandler(handleMessengerMessage);
        window.WebSocketManager.registerTypingHandler(handleTyping)

        if (window.WebSocketManager.connection)window.WebSocketManager.connection.addEventListener('message',attachUserListeners)
        window.appRegistry.registerEventListener(window, 'beforeunload', function () {
            window.WebSocketManager.removeMessageHandler();
        });
    }
})();

