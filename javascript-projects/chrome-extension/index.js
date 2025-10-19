
let myLeads = []
const inputBtn = document.getElementById("input-btn")
const inputEl = document.getElementById("input-el")
const unorderedEl = document.getElementById("ul-el")

inputBtn.addEventListener("click", function(){
    myLeads.push(inputEl.value)
    renderLead()
    inputEl.value = ""
})

// function renderLeads() {
//     let listItems = ""
    
//     for(let i = 0; i < myLeads.length; i++) {
//         // unorderedEl.innerHTML += "<li>" + myLeads[i] + "</li>"
//         // const li = document.createElement("li")
//         // li.textContent = myLeads[i]
//         // unorderedEl.append()
//         listItems += "<li>" + myLeads[i] + "</li>"
//     }
//     unorderedEl.innerHTML = listItems
// }

function renderLead(){
    let listItem = "<li>" + "<a href=\"" + inputEl.value + "\">" + inputEl.value+ "</a>" + "</li>"
    unorderedEl.innerHTML += listItem
}