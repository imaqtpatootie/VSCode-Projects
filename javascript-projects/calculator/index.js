const output = document.getElementById("output");

output.textContent = '';
function saveNumber(number) {
    output.value += number;
}

function reset(){
    output.value = '';
}