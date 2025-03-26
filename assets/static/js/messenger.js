(function () {
    const searchIcon = document.querySelector('.search-icon');
    const removeIcon = document.querySelector('.remove-icon');
    const searchBox = document.querySelector(".search-box");
    const searchUser = document.getElementById("search-user");
    let chatList = document.getElementById("chat-list");
    let chatHeader = document.getElementById("chat-header")
    const sendBtn = document.getElementById("send-button");
    let isSelected = false;
    const requestBody = {
        input: searchUser.value,
        index: 0
    }
    let ws;
    let messageDisplay = document.getElementById("messages");
    const defaultListOfUsers = `
    <li data-user="John Doe">John Doe</li>
    <li data-user="Jane Smith">Jane Smith</li>
    <li data-user="Michael Brown">Michael Brown</li>`;

    function attachUserListeners() {
        const usersInChatBox = document.querySelectorAll("#chat-list > li");
        usersInChatBox.forEach(element => {
            element.removeEventListener('click', selectChat);
            element.addEventListener('click', selectChat);
        });
    }

    chatList.innerHTML = defaultListOfUsers;
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
            requestBody.index++
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
        const selectedUser = e.target.dataset.user;
        isSelected = true
        chatHeader.innerHTML = selectedUser
        document.getElementById('message').removeAttribute('readonly');
        // loadingChat(selectedUser)
        console.log("Selected user:", selectedUser);
    }

    function displaySearchBox() {
        searchBox.classList.add('visible');
    }

    function hideSearchBox() {
        searchBox.classList.remove('visible');
        chatList.innerHTML = defaultListOfUsers;
        attachUserListeners();
    }

    function connect() {
        const wsUrl = `ws://${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log("Connected to WebSocket server");
        ws.onmessage = (event) => {
            messageDisplay.innerHTML += `<p>${event.data}</p>`;
        };
        ws.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
            setTimeout(connect, 1000);
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    function sendMessage() {
        let input = document.getElementById("message");
        let message = input.value;
        if (isSelected) {
            ws.send(message);
            input.value = "";
        }
    }

    const debouncedPrint = debounce(userSearch, 500);

    window.appRegistry.registerEventListener(searchIcon, 'click', searchIcon.addEventListener('click', displaySearchBox));
    window.appRegistry.registerEventListener(removeIcon, 'click', removeIcon.addEventListener('click', hideSearchBox));
    window.appRegistry.registerEventListener(searchUser, 'click', searchUser.addEventListener('input', debouncedPrint));
    window.appRegistry.registerEventListener(sendBtn, 'click', sendBtn.addEventListener('click', sendMessage));

    connect();
})()