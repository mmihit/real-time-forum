const btns = [document.getElementById('Post-Created'), document.getElementById('Likes'), document.getElementById('Create-Post')]

btns.forEach(btn => {
    btn.classList.add('Permission-Denied')
});