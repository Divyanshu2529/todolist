const inputedtask = document.querySelector(".searchbar");
const addbutton = document.querySelector(".add_button");
const taskslist = document.querySelector(".tasks_list");
const emptystate = document.querySelector(".tasks_empty");

const prioritybuttons = document.querySelectorAll(".pill");
const categoryselection = document.querySelector(".category_select");

let tasks = [];

prioritybuttons.forEach((btn)=>{
    btn.addEventListener("click", () =>{
        prioritybuttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

function getPriority(){
    const current = document.querySelector(".pill.active");
    if (!current){
        return null;
    }
    return current.textContent.trim();
}

function render(){
    taskslist.innerHTML = "";

    if (tasks.length === 0){
        
    }
}

addbutton.addEventListener("click", () =>{
    const priority = getPriority()
    if (!priority){
        alert("Please select a priority");
    return;
    }
    
    const text = inputedtask.value.trim();
    const category = categoryselection.value;

    if (!text){
        alert("Please enter a task");
        return;
    }
    const task ={
        id: Date.now(),
        text: text,
        priority: priority,
        category: category,
        completed: false
    };

    tasks.push(task)
    
    taskInput.value = "";
    
    render();
});



