const username = document.getElementById('username');

let isLogged = JSON.parse(localStorage.getItem("isLogged")) || false;

if (isLogged === false) {
    window.location.href = './index.html';
}

let user = JSON.parse(localStorage.getItem("user")) || {
    name: '',
    win: 0,
    lose: 0,
    tie: 0,
    money: 0
}
const {name, win, lose, tie, money} = user;

// localStorage.clear();

username.innerHTML = `
    <p class="greetings">Welcome back, <span class="user">${name}</span>!</p>
`;
