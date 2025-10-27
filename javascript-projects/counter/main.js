let streak = JSON.parse(localStorage.getItem("Streak")) || 0;
let streakEntries = JSON.parse(localStorage.getItem("Entries")) || [];
let entry = JSON.parse(localStorage.getItem("Days Coded")) || [];
const dayCount = document.getElementById('day-count');
const entries = document.getElementById('entries');

displayStreak();
displayEntries();

function displayEntries() {
    entries.textContent = '';
    for (let i = 0; i < streakEntries.length; i++) {
        entries.textContent += streakEntries[i] + " days, ";
    }
}

function displayStreak() {
    dayCount.textContent = streak;
}
function increment() {
    streak += 1;
    localStorage.setItem("Streak", JSON.stringify(streak));
    displayStreak();
}

function save() {
    if (streak >= 1) {
        streakEntries.push(streak);
        let localStreakEntries = localStorage.setItem("Entries", JSON.stringify(streakEntries));
        streak = 0;
        localStorage.removeItem("Streak");
        displayStreak();
        displayEntries();
    } else {
        alert("Must have 1 or more days to save entry!");
    }
}


// localStorage.clear();