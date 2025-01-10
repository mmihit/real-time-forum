const form = document.getElementById('registerForm');


form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    console.log(email, name, password, "<----- js")

    console.log(email, password, name);
    document.getElementById('emailError').innerText = '';
    document.getElementById('passwordError').innerText = '';
    document.getElementById('nameError').innerText = '';

    let isValid = true;

    const nameRegex = /^[A-Za-z0-9_-]{2,15}$/;
    if (!nameRegex.test(name)) {
        document.getElementById('nameError').innerText = 'invalid name';
        isValid = false;
    }

    const emailRegex = /^(\w+@\w+.[a-zA-Z]+)$/;   ////^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.]{2,}$/
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').innerText = 'invalid email';
        isValid = false;
    }

    const passwordRegex = /^[A-Za-z\d@$+-_!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('passwordError').innerText = 'invalid password';
        isValid = false;
    }

    if (isValid) {
        fetch("/register", {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ 'name': name, 'email': email, 'password': password })
        })
            .then(response => {
                console.log(response.status);

                if (response.ok) {
                    response.json();
                } else if (response.status === 409) {
                    return response.json().then(data => {
                        throw new Error(data.message);
                    });
                }
            })

            .then(data => {
                console.log('Inscription valid', data);
                window.location.href = "/login";
            })

            .catch(error => {
                console.error('Failed to fetch page: ', error);
                document.getElementById('emailError').innerText = error.message;
            })
    }
})