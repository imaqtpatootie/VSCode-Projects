
let myLeads = []
const inputBtn = document.getElementById("input-btn")
const inputEl = document.getElementById("input-el")
const unorderedEl = document.getElementById("ul-el")

inputBtn.addEventListener("click", function(){
    myLeads.push(inputEl.value)
    inputEl.value = ""
    renderLeads()
})

function renderLeads() {
    unorderedEl.textContent = ""
    
    for(let i = 0; i < myLeads.length; i++) {
        unorderedEl.innerHTML += "<li>" + myLeads[i] + "</li>"
    }
}