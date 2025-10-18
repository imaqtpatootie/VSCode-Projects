
let bot = document.querySelector("#bot")
let message = document.querySelector("#message")
let player2 = {
    rock: false,
    paper: false,
    scissors: false
}
let player1 = {
    rock: false,
    paper: false,
    scissors: false
}
let rockHands = "rock"
let paperHands = "paper"
let scissorsHands = "scissors"
function reset() {
    player2 = {
        rock: false,
        paper: false,
        scissors: false
    }
    player1 = {
        rock: false,
        paper: false,
        scissors: false
    }    
}
function rock() {
    reset()
    randomGenerator()
    player1.rock = true
    translation()
    winConditions()
}   
function paper() {
    reset()
    randomGenerator()
    player1.paper = true
    translation()
    winConditions()
}
function scissors() {
    reset()
    randomGenerator()
    player1.scissors = true
    winConditions()
    translation()
}
function translation() {
    if (player2.rock){
        return bot.textContent = rockHands
    } else if (player2.paper){
        return bot.textContent = paperHands
    } else if (player2.scissors) {
        return bot.textContent = scissorsHands
    }
}
function winConditions() {
    if ( player1.rock && player2.rock){
        message.textContent = "Tie!"
    } else if ( player1.rock && player2.paper){
        message.textContent = "You lost!"
    } else if ( player1.rock && player2.scissors){
        message.textContent = "You won!"
    } else if ( player1.paper && player2.rock){
        message.textContent = "You won!"
    } else if ( player1.paper && player2.paper){
        message.textContent = "Tie!"
    } else if ( player1.paper && player2.scissors){
        message.textContent = "You lost!"
    } else if ( player1.scissors && player2.rock){
        message.textContent = "You lost!"
    } else if ( player1.scissors && player2.paper){
        message.textContent = "You won!"
    } else{
        message.textContent = "Tie!"
    }
}
function randomGenerator() {
    let randomNumber = Math.floor( Math.random() * 3) + 1
    if (randomNumber === 1) {
        return player2.rock = true
    } else if (randomNumber === 2) {
        return player2.paper = true
    } else {
        return player2.scissors = true
    }
}