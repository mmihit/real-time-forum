import { navigateTo } from "/static/js/loadHtmlElems.js";


document.addEventListener('submit', async (event) => {
    if (event.target.id === 'loginForm') {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        document.getElementById('emailError').innerText = '';
        document.getElementById('passwordError').innerText = '';

        await fetch("/login", {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ 'email': email, 'password': password })
        })
            .then(async response => {
                if (response.ok) {
                    response.json().then(data => {
                        window.loggedUser = data.username; console.log("data", data.username)
                        document.getElementById('Name').setAttribute('value', window.loggedUser);
                        document.querySelector('.dropdown-button').innerHTML = `<i class="fa fa-caret-down" aria-hidden="true"></i> ${window.loggedUser}`;
                        console.log(document.getElementById('Name'))
                    })

                    window.WebSocketManager.connect()
                    navigateTo('/')
                } else if (response.status === 409) {
                    return response.json().then(data => {
                        throw new Error(data.message);
                    });
                } else {
                    return response.json().then(data => {
                        window.showAlert(data.message);
                    });
                }
            })

            .catch(error => {
                console.error('Failed to fetch page: ', error)
                document.getElementById('Error').innerText = error.message;
            })
    }

})