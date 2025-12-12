const todoName = document.getElementById("todoInput");
const todoBtn = document.getElementById("todoBtn");
const todoLists = document.getElementById("todoLists");

let todos = [{name: '', dueDate: ''}];
function renderLists() {
    let todoListHTML = '';
    for (let i = 0; i < todos.length; i++) {
        let {name, dueDate} = todos[i];

        const html = `
            <li>
                <span>${name}</span>
                <button onclick="
                    todos.splice(${i}, 1);
                    renderLists();
                ">Delete</button>
            </li>
        `;
        todoListHTML += html;
    }
    todoLists.innerHTML = todoListHTML;
    console.log(todoListHTML);
}

todoBtn.addEventListener('click', function() {
    todos.push({
        name: todoName.value
    });
    todoName.value = '';
    renderLists();
});

todoName.addEventListener('keydown', function(type) {
    if (type.key === 'Enter') {
        todos.push(todoName.value);
        renderLists();
        todoName.value = '';
    }
});

renderLists();













// let todos = JSON.parse(localStorage.getItem('todolist')) || [];
// let trash = JSON.parse(localStorage.getItem('trashList')) || [];

// function renderLists(){
//     let lists = '';
//     for (let i = 0; i < todos.length; i++) {
//        lists += `<li>
//         ${todos[i]}
//         <button class="deleteBtn" 
//             onclick="
//                 todos.splice(${i}, 1);
//                 renderLists();
//             ">
//             Delete
//         </button>
//        </li>`;
//        localStorage.setItem('todolist', newList);
//     }
//     renderLists();
//     todoLists.innerHTML = lists;
// }
// function pushTodos(){
//     todos.push(todoName.value);
//     localStorage.setItem('todolist', JSON.stringify(todos));

//     renderLists();
//     todoName.value = "";
// }

// renderLists();

// todoBtn.addEventListener("click", pushTodos);
// todoName.addEventListener("keydown", function(type){
//     if (type.key === 'Enter'){
//         pushTodos();
//     }
// });
