import { navigateTo } from "/static/js/loadHtmlElems.js";

document.addEventListener('submit', async (event) => {
    if (event.target.id === 'registerForm') {
        event.preventDefault();

        const nickname = document.getElementById('nickname').value;
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        document.getElementById('nicknameError').innerText = '';
        document.getElementById('ageError').innerText = '';
        document.getElementById('genderError').innerText = '';
        document.getElementById('firstNameError').innerText = '';
        document.getElementById('lastNameError').innerText = '';
        document.getElementById('emailError').innerText = '';
        document.getElementById('passwordError').innerText = '';

        let isValid = true;

        const nameRegex = /^[A-Za-z0-9._-]{2,15}$/;
        if (!nameRegex.test(nickname)) {
            document.getElementById('nicknameError').innerText = 'Invalid nickname';
            isValid = false;
        }

        const firstNameRegex = /^[A-Za-z-\s]{6,30}$/;
        if (!firstNameRegex.test(firstName)) {
            document.getElementById('firstNameError').innerText = 'Invalid First Name';
            isValid = false;
        }

        const lastNameRegex = /^[A-Za-z-\s]{6,30}$/;
        if (!lastNameRegex.test(lastName)) {
            document.getElementById('lastNameError').innerText = 'Invalid Last Name';
            isValid = false;
        }
        
        if (gender != "male" && gender != "female") {
            document.getElementById('genderError').innerText = 'Invalid Gender';
            isValid = false;
        }

        if (age < 16 || age > 120) {
            document.getElementById('ageError').innerText = 'Invalid Age';
            isValid = false;
        }

        const emailRegex = /^(\w+@\w+\.[a-zA-Z]+)$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').innerText = 'Invalid email';
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.+[@$!-_%*?&])[a-zA-Z\d@$!-_%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            document.getElementById('passwordError').innerText = 'your password needs to have a minimum of 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character 😅';
            isValid = false;
        }


        if (isValid) {
            console.log('Submitting form...');


            await fetch("/register", {
                method: 'POST',
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ 'name': nickname, 'age': age, 'gender': gender, 'firstName': firstName, 'lastName': lastName, 'email': email, 'password': password })
            })

                .then(response => {
                    if (response.ok) {
                        response.json();
                        navigateTo("/login");
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
                    console.error('Failed to fetch page: ', error);
                    document.getElementById('Error').innerText = error.message;
                })
        }
    }
});