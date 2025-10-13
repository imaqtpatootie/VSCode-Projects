let homePoints = document.getElementById("home-score")
let guestPoints = document.getElementById("guest-score")

let homeCount = 0
let guestCount = 0

function homeOnePoint(){
    homeCount += 1
    homePoints.textContent = homeCount
}
function homeTwoPoints(){
    homeCount += 2
    homePoints.textContent = homeCount
}
function homeThreePoints(){
    homeCount += 3
    homePoints.textContent = homeCount
}
function guestOnePoint(){
    guestCount += 1
    guestPoints.textContent = guestCount
}
function guestTwoPoints(){
    guestCount += 2
    guestPoints.textContent = guestCount
}
function guestThreePoints(){
    guestCount += 3
    guestPoints.textContent = guestCount
}
