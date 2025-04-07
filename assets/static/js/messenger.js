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
        scrollThreshold: 5,
        scrollTop: messageDisplay.scrollTop
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
            chatHeader.innerHTML = selectedUser.receiver
            chatList.innerHTML = ""
            searchUser.value = ""
            document.getElementById('message').removeAttribute('readonly');
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

    function createMessage(message, action, isSendNow) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const day = now.toLocaleDateString([], { weekday: 'short' });

        // Add message to display with timestamp
        const tempContainer = document.createElement('div')
        tempContainer.innerHTML = `<div class="message-box ${action}">
                <div class="message-body">${message}</div>
                <p class="message-info">${day}, ${time}</p>
            </div>`;

        // console.log(messageDisplay.hasChildNodes)
        if (!messageDisplay.hasChildNodes() || isSendNow) {
            // console.log("mmmmmmmmmmmmmm")
            messageDisplay.appendChild(tempContainer)
        } else {
            // console.log("ttttttttttttttt")
            messageDisplay.insertBefore(tempContainer, messageDisplay.firstElementChild)
        }


        // Scroll to bottom
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }

    // Message handler for the Messenger page
    function handleMessengerMessage(chatData) {
        // Only process messages for the current chat
        if ((chatData.sender === window.loggedUser && chatData.receiver === selectedUser.receiver) ||
            (chatData.receiver === window.loggedUser && chatData.sender === selectedUser.receiver)) {
            const action = chatData.sender === window.loggedUser ? "sent" : "received";
            createMessage(chatData.message, action, true);
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
            scrollHelper.hasMore = responseData.hasMore
            // console.log("reverse:   ",responseData.chats.reverse())
            responseData.chats.reverse().forEach((chat) => {
                // console.log("hani:",chat.message)
                const flag = chat.sender == window.loggedUser ? "sent" : "received";
                createMessage(chat.message, flag);
            });

            if (!responseData.hasMore) {
                messageDisplay.innerHTML = `<p style="order:-10000000; text-align:center;">Start Chatting</p>` + messageDisplay.innerHTML;
            }
        }
        scrollHelper.isLoading = false
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

// (function () {
//     const searchIcon = document.querySelector('.search-icon');
//     const removeIcon = document.querySelector('.remove-icon');
//     const searchBox = document.querySelector(".search-box");
//     const searchUser = document.getElementById("search-user");
//     let chatList = document.getElementById("chat-list");
//     let chatHeader = document.getElementById("chat-header")
//     const sendBtn = document.getElementById("send-button");
//     let messageDisplay = document.getElementById("messages");

//     // Add scroll listener for message pagination
//     let isLoadingMore = false;
//     let scrollThreshold = 100; // Pixels from top to trigger loading more messages

//     const requestBody = {
//         input: searchUser.value,
//         index: 0
//     }

//     const selectedUser = {
//         receiver: null,
//         index: 0,
//         isSelected: false,
//         page: 15
//     }

//     function attachUserListeners() {
//         const usersInChatBox = document.querySelectorAll("#chat-list > li");
//         usersInChatBox.forEach(element => {
//             element.removeEventListener('click', window.selectChatFromOnlineUsers.goToChat);
//             element.addEventListener('click', window.selectChatFromOnlineUsers.goToChat);
//         });
//     }

//     attachUserListeners();

//     function debounce(func, wait) {
//         let timeout;
//         return function (...args) {
//             clearTimeout(timeout)
//             timeout = setTimeout(() => func(...args), wait)
//         }
//     }

//     async function fetchUsersApi(url, requestBody) {
//         try {
//             const response = await fetch(url, {
//                 method: 'Post',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody)
//             })
//             return response.json()
//         } catch (error) {
//             console.error("Fetch error:", error);
//             return { users: [] };
//         }
//     }

//     async function userSearch() {
//         const url = "/messenger"
//         let responseData;

//         if (requestBody.input === searchUser.value) {
//             ++requestBody.index
//         } else {
//             requestBody.index = 0
//             requestBody.input = searchUser.value
//             chatList.innerHTML = ""
//         }

//         if (requestBody.input.length > 0 && requestBody.input.length < 40 && requestBody.index >= 0) {
//             responseData = await fetchUsersApi(url, requestBody)

//             if (responseData && responseData.users) {
//                 responseData.users.forEach(user => {
//                     const listItem = document.createElement('li');
//                     listItem.setAttribute('data-user', user);
//                     listItem.textContent = user;
//                     chatList.appendChild(listItem);
//                 });

//                 attachUserListeners();
//             }
//         }
//     }

//     const select = {
//         element: null,
//         goToChat(e) {
//             messageDisplay.innerHTML = "";

//             selectedUser.receiver = !e ? this.element.target.dataset.user : e.target.dataset.user
//             selectedUser.isSelected = true
//             selectedUser.index = 0
//             chatHeader.innerHTML = selectedUser.receiver
//             chatList.innerHTML = ""
//             searchUser.value = ""
//             document.getElementById('message').removeAttribute('readonly');
//             loadingChat()
//             console.log("Selected user:", selectedUser);
//         },
//         initializeElement(e) {
//             this.element = e
//         }
//     }

//     window.selectChatFromOnlineUsers = select

//     function displaySearchBox() {
//         searchBox.classList.add('visible');
//     }

//     function hideSearchBox() {
//         searchBox.classList.remove('visible');
//         chatList.innerHTML = "";
//         attachUserListeners();
//     }

//     function createMessage(message, action) {
//         const now = new Date();
//         const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         const day = now.toLocaleDateString([], { weekday: 'short' });

//         // Add message to display with timestamp
//         messageDisplay.innerHTML += `<div class="message-box ${action}">
//                 <div class="message-body">${message}</div>
//                 <p class="message-info">${day}, ${time}</p>
//             </div>`;

//         // Scroll to bottom
//         messageDisplay.scrollTop = messageDisplay.scrollHeight;
//     }

//     // Message handler for the Messenger page
//     function handleMessengerMessage(chatData) {
//         // Only process messages for the current chat
//         if ((chatData.sender === window.loggedUser && chatData.receiver === selectedUser.receiver) ||
//             (chatData.receiver === window.loggedUser && chatData.sender === selectedUser.receiver)) {
//             const action = chatData.sender === window.loggedUser ? "sent" : "received";
//             createMessage(chatData.message, action);
//         }
//     }

//     function sendMessage() {
//         let input = document.getElementById("message");
//         let messageInput = input.value.trim();

//         if (messageInput === "" || !selectedUser.isSelected) {
//             return;
//         }

//         const message = {
//             sender: window.loggedUser,
//             receiver: selectedUser.receiver,
//             message: messageInput
//         };

//         // Use the WebSocket manager to send the message
//         if (window.WebSocketManager && window.WebSocketManager.sendMessage(message)) {
//             input.value = "";
//         }
//     }

//     async function loadingChat() {
//         if (!selectedUser.isSelected) return;

//         // Show loading indicator
//         const loadingIndicator = document.createElement('div');
//         loadingIndicator.className = 'loading-indicator';
//         loadingIndicator.innerHTML = '<p>Loading messages...</p>';
//         loadingIndicator.style.textAlign = 'center';
//         loadingIndicator.style.padding = '10px';
//         loadingIndicator.style.color = '#888';
//         loadingIndicator.id = 'loading-messages-indicator';

//         // Insert at the top of the message display
//         if (messageDisplay.firstChild) {
//             messageDisplay.insertBefore(loadingIndicator, messageDisplay.firstChild);
//         } else {
//             messageDisplay.appendChild(loadingIndicator);
//         }
//         x
//         // Remember scroll position
//         const scrollHeight = messageDisplay.scrollHeight;

//         // Fetch new page of messages
//         const responseData = await fetchChat();
//         scrollHelper.hasMore = responseData.hasMore

//         console.log(responseData);

//         // Remove loading indicator
//         const indicator = document.getElementById('loading-messages-indicator');
//         if (indicator) {
//             indicator.remove();
//         }

//         if (responseData && responseData.chats) {
//             // Create a document fragment to avoid multiple reflows
//             const fragment = document.createDocumentFragment();
//             const tempContainer = document.createElement('div');

//             responseData.chats.forEach((chat) => {
//                 const flag = chat.sender == window.loggedUser ? "sent" : "received";
//                 const now = new Date();
//                 const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//                 const day = now.toLocaleDateString([], { weekday: 'short' });

//                 tempContainer.innerHTML = `<div class="message-box ${flag}">
//                     <div class="message-body">${chat.message}</div>
//                     <p class="message-info">${day}, ${time}</p>
//                 </div>`;

//                 // Move nodes to fragment
//                 while (tempContainer.firstChild) {
//                     fragment.appendChild(tempContainer.firstChild);
//                 }
//             });

//             // Insert all messages at once at the beginning
//             if (messageDisplay.firstChild) {
//                 messageDisplay.insertBefore(fragment, messageDisplay.firstChild);
//             } else {
//                 messageDisplay.appendChild(fragment);
//             }

//             if (!responseData.hasMore) {
//                 const noMoreMessages = document.createElement('p');
//                 noMoreMessages.style.order = "-10000000";
//                 noMoreMessages.style.textAlign = "center";
//                 noMoreMessages.textContent = "Start Chatting";
//                 messageDisplay.insertBefore(noMoreMessages, messageDisplay.firstChild);
//             }

//             // Restore scroll position to prevent jumping
//             const newScrollHeight = messageDisplay.scrollHeight;
//             messageDisplay.scrollTop = newScrollHeight - scrollHeight;

//             // Update the index for the next page
//             selectedUser.index++;
//         }

//         isLoadingMore = false;
//     }

//     async function fetchChat() {
//         try {
//             const response = await fetch("/api/load_messages", {
//                 method: 'Post',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(selectedUser)
//             });

//             if (response.ok) {
//                 return response.json();
//             }
//         } catch (error) {
//             console.log(error);
//             return { chats: [], hasMore: false };
//         }
//     }

//     // Function to check if we should load more messages (debounced)
//     function checkLoadMore() {
//         if (isLoadingMore || !selectedUser.isSelected || !scrollHelper.hasMore) return;

//         if (messageDisplay.scrollTop < scrollThreshold) {
//             isLoadingMore = true;
//             loadingChat();
//         }
//     }

//     // Apply debounce to the scroll event handler
//     const debouncedLoadMore = debounce(checkLoadMore, 250);

//     // Add scroll event listener for pagination
//     window.appRegistry.registerEventListener(messageDisplay, 'scroll', debouncedLoadMore);

//     const debouncedPrint = debounce(userSearch, 500);

//     window.appRegistry.registerEventListener(searchIcon, 'click', displaySearchBox);
//     window.appRegistry.registerEventListener(removeIcon, 'click', hideSearchBox);
//     window.appRegistry.registerEventListener(searchUser, 'input', debouncedPrint);
//     window.appRegistry.registerEventListener(sendBtn, 'click', sendMessage);

//     // Register message handler for this page
//     if (window.WebSocketManager) {
//         window.WebSocketManager.registerMessageHandler(handleMessengerMessage);

//         // Clean up when navigating away
//         window.appRegistry.registerEventListener(window, 'beforeunload', function () {
//             window.WebSocketManager.removeMessageHandler(handleMessengerMessage);
//         });
//     }
// })();