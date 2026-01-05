const inputedtask = document.querySelector(".searchbar");
const addbutton = document.querySelector(".add_button");
const taskslist = document.querySelector(".tasks_list");
const emptystate = document.querySelector(".tasks_empty");

const prioritybuttons = document.querySelectorAll(".pill");
const categoryselection = document.querySelector(".category_select");

const statTotal = document.querySelector(".stat_total");
const statActive = document.querySelector(".stat_active");
const statCompleted = document.querySelector(".stat_completed");
const statPercent = document.querySelector(".stat_percent");


let tasks = [];

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks(){
    const data = localStorage.getItem("tasks");
    tasks = data ? JSON.parse(data): [];
}

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

function toggleCompleted(id){
  for (let i = 0; i < tasks.length; i++){
    if (tasks[i].id === id){
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }
  saveTasks();
  render();
}

function deleteTask(id){
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function updateStats(){
    const total = tasks.length;
    const completed = tasks.filterilter(t => t.completed).length;
    const active = totall - completed;
    const percent = total === 0 ? 0: Math.round((completed/total)*100);

    statTotal.textContent = total;
    statActive.textContent = active;

    statCompleted.childNodes[0].textContent = completed + "";
    statPercent.textContent = "(" + percent + "%)";
}


function render(){
    taskslist.innerHTML = "";

    if (tasks.length === 0){
        emptystate.style.display = "grid";
        return;
    }

    emptystate.style.display = "none";

    for (let i = 0; i < tasks.length; i++){
        const task = tasks[i];
        const row = document.createElement("div");

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = task.completed;

        const text = document.createElement("span");
        text.textContent = task.text + " - " + task.priority + " - " + task.category;

        if (task.completed){
        text.style.textDecoration = "line-through";
        text.style.opacity = "0.6";
        }

        const del = document.createElement("button");
        del.textContent = "Delete";

        check.addEventListener("change", () => toggleCompleted(task.id));
        del.addEventListener("click", () => deleteTask(task.id));

        row.appendChild(check);
        row.appendChild(text);
        row.appendChild(del);

        taskslist.appendChild(row);
        updateStats();
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
    saveTasks();
    inputedtask.value = "";
    render();
});


loadTasks();
render();