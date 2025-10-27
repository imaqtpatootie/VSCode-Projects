let count = 0
let entry = JSON.parse(localStorage.getItem("Days Coded")) || [];
const dayCount = document.getElementById('day-count');
const entries = document.getElementById('entries');

displayCount();
function increment() {
    count += 1
    dayCount.textContent = count
}

function save(){
    entry.push(count);
    let localSave = localStorage.setItem("Days Coded", JSON.stringify(entry));
    console.log(entry);

    entries.textContent = ''
    displayCount();
}

function displayCount() {
    for (let i = 0; i < entry.length; i++) {
        entries.textContent += entry[i] + 'days, ';
    }
}