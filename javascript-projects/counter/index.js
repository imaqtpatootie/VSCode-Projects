// let days = 6
// console.log(days)


// my age to dog years

// let myAge = 24
// let humanDogRatio = 7
// let myDogAge = myAge * humanDogRatio
// console.log(myDogAge + " dog years")

// function countdown(){
//     console.log(5)
//     console.log(4)
//     console.log(3)
//     console.log(2)
//     console.log(1)
// }
// countdown()

// function whatsmyname(){
//     console.log("Joseph Emmanuel Calvo")
// }
// whatsmyname()

// let lap1 = 32
// let lap2 = 41
// let lap3 = 57
// function totalLaps(){
//     let laps = lap1 + lap2 + lap3
//     console.log(laps)
// }
// totalLaps()

// let value = 0
// function add(){
//     value = value + 1
// }
// add()
// add()
// add()
// console.log(value);

// let greetings = "Hi, my name is "
// let name = "Joseph Emmanuel N. Calvo."

// let myGreetings = greetings + name
// console.log(myGreetings)

let count = 0
let counterMessage = " days"
let dayCount = document.getElementById('day-count')
let entries = document.getElementById('entries')
function increment() {
    count += 1
    dayCount.textContent = count
}

function save(){
    let countStr = count + counterMessage + ", "
    entries.textContent += countStr
    count = 0
    dayCount.textContent = count
}