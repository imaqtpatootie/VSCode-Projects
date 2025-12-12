const userInput = document.getElementById("username");
const enterBtn = document.getElementById("enterBtn");
const alert = document.querySelector(".alert");

let isLogged = JSON.parse(localStorage.getItem("isLogged")) || false;
let user = JSON.parse(localStorage.getItem("user")) || {
    name: '',
    win: 0,
    lose: 0,
    tie: 0,
    money: 0
}

if (isLogged === true) {
    window.location.href = './main.html';
}

function userLog() {
    if (userInput.value === '' || userInput.value === null) {
        // alert.style.display = 'flex';
    } else {
        user.name = userInput.value;
        isLogged = true;
        localStorage.setItem('isLogged', JSON.stringify(isLogged));
        localStorage.setItem('user', JSON.stringify(user));
        console.log(user.name);
        window.location.href = './main.html';
    }
}

enterBtn.addEventListener("click", userLog);
userInput.addEventListener("keydown", function(type){
    if (type.key === 'Enter'){
        userLog();
    }
});
// localStorage.clear();