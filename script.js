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

const filterInput = document.querySelector(".filter_input");

const clearCompletedBtn = document.querySelector(".clear_completed");


if (filterInput) {
  filterInput.addEventListener("input", () => render());
}

const tabs = document.querySelectorAll(".tab");
let activeTab = "all";

tabs.forEach((tab)=> {
    tab.addEventListener("click",()=>{
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        activeTab = tab.dataset.tab;
        render();
    });
});


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

if (clearCompletedBtn) {
  clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  });
}


function updateStats(){
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total === 0 ? 0: Math.round((completed/total)*100);

    statTotal.textContent = total;
    statActive.textContent = active;

    statCompleted.childNodes[0].textContent = completed + " ";
    statPercent.textContent = "(" + percent + "%)";
}


function render(){
    taskslist.innerHTML = "";

    let visibleTasks = tasks;

    if (activeTab === "active") {
        visibleTasks = tasks.filter(t => !t.completed);
    } 
    else if (activeTab === "completed") {
        visibleTasks = tasks.filter(t => t.completed);
    }

    const q = filterInput ? filterInput.value.trim().toLowerCase() : "";
    if (q) {
        visibleTasks = visibleTasks.filter(t =>
            t.text.toLowerCase().includes(q) ||
            t.priority.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
         );
    }


    if (visibleTasks.length === 0){
        emptystate.style.display = "grid";
        updateStats();
        return;
    }

    emptystate.style.display = "none";

    for (let i = 0; i < visibleTasks.length; i++){
        const task = visibleTasks[i];
        const row = document.createElement("div");
        row.classList.add("task_row");

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = task.completed;
        check.classList.add("task_check");
        
        const text = document.createElement("span");
        text.textContent = task.text + " - " + task.priority + " - " + task.category;
        text.classList.add("task_text");

        if (task.completed){
        text.style.textDecoration = "line-through";
        text.style.opacity = "0.6";
        }

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.classList.add("task_delete");

        check.addEventListener("change", () => toggleCompleted(task.id));
        del.addEventListener("click", () => deleteTask(task.id));

        row.appendChild(check);
        row.appendChild(text);
        row.appendChild(del);

        taskslist.appendChild(row);
    }
    updateStats();
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
    activeTab = "all";
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelector('.tab[data-tab="all"]').classList.add("active");
    render();
});


loadTasks();
render();