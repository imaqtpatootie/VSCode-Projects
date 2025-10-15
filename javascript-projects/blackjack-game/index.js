let isAlive = false
let hasBlackjack = false

let cards = []
let sum = 0

let messageEl = document.querySelector("#message")
let cardsEl = document.querySelector("#cards")
let cardValueEl = document.querySelector("#sum")
let message = ""

let player = {
    name: "Jo",
    chips: 420
}
// let playerName = "Jo"
// let playerChips = 420
let playerStatus = document.querySelector("#player-el")
playerStatus.textContent = player.name + ": $" + player.chips

function getRandomCard() {
    let randomNumber = Math.floor(Math.random() * 13) + 1
    if (randomNumber === 1) {
        return 11
    } else if (randomNumber > 10) {
        return 10
    } else {
        return randomNumber
    }
}

function startGame(){
    isAlive = true
    hasBlackjack = false
    firstCard = getRandomCard()
    secondCard = getRandomCard()
    cards = [firstCard, secondCard]
    sum = firstCard + secondCard
    renderGame()
}

function renderGame(){
    cardsEl.textContent = null
    for (let i = 0; i < cards.length; i++) {
        cardsEl.textContent += cards[i] + " "
    }
    cardValueEl.textContent = "Result: " + sum
    if (sum === 21) {
        message = "You got a blackjack!"
        hasBlackjack = true
        isAlive = false
    } else if (sum < 21) {
        if (!isAlive){
            message = "You lost!"
        } else {
            message = "Wanna draw another card?"
        }
    } else {
        message = "You lost!"
        isAlive = false
    }
    messageEl.textContent = message
}
function drawCard(){
    if (isAlive && !hasBlackjack){
        let thirdCard = getRandomCard()
        sum += thirdCard
        cards.push(thirdCard)
        isAlive = false
        renderGame()
    }
}

// if 21 then blackjack
// if below 21 draw new card
// isAlive
// hasBlackjack
