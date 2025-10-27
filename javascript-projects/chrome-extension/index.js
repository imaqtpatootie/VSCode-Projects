const myLeads = JSON.parse(localStorage.getItem("leads")) || [];

const inputBtn = document.getElementById("input-btn");
const inputEl = document.getElementById("input-el");
const unorderedEl = document.getElementById("ul-el");

renderLeads();

inputBtn.addEventListener('click', function() {
    myLeads.push(inputEl.value);
    localStorage.setItem("leads", JSON.stringify(myLeads));
    inputEl.value = '';

    renderLeads();
});


function resetLeads() {
    localStorage.removeItem("leads");
    myLeads.length = 0;
    unorderedEl.innerHTML = '';
}

function renderLeads(){
    let items = '';

    for (let i = 0; i < myLeads.length; i++) {
        items += `
            <li>
                <a href='${myLeads[i]}' target='_blank'>
                    ${myLeads[i]}
                </a>
            </li>
        `;
    }
    unorderedEl.innerHTML = items;
}
