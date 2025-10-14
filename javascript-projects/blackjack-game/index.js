let isAlive = true
let hasBlackjack = false

let firstCard = 7
let secondCard = 10
let cards = [firstCard, secondCard]
let sum = cards[0] + cards[1]

let messageEl = document.querySelector("#message")
let cardsEl = document.querySelector("#cards")
let cardValueEl = document.querySelector("#sum")

function startGame(){
    renderGame()
}
function renderGame(){

    if (sum === 21) {
        messageEl.textContent = "You've got a blackjack!"
        hasBlackjack = true
        isAlive = false
    } else if (sum < 21) {
        messageEl.textContent = "Wanna draw another card?"
    } else {
        messageEl.textContent = "You lost!"
        isAlive = false
    }
    cardsEl.textContent = cards[0] + " " + cards[1] 
    cardValueEl.textContent = "Result: " + sum
}
function drawCard(){
    if (isAlive){
        thirdCard = 3
        cards.push(thirdCard)
        sum += cards[2]
        if (sum === 21) {
            messageEl.textContent = "You've got a blackjack!"
            hasBlackjack = true
            isAlive = false

            renderGame()
        } else {
            messageEl.textContent = "You lost"
            isAlive = false
        }
        cardsEl.textContent = cards[0] + " " + cards[1] + " " + cards[2]
        cardsValueEl.textContent = "Result: " + sum
    } else {
        messageEl.textContent = "You can't draw another card!"
    }
}

// if 21 then blackjack
// if below 21 draw new card
// isAlive
// hasBlackjack
