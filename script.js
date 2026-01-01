const STORAGE_KEY = "task_manager_tasks_v1";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


let tasks = loadTasks();


const tasksList = document.querySelector(".tasks_list");
const emptyState = document.querySelector(".tasks_empty");
const taskInput = document.querySelector(".searchbar");
const addBtn = document.querySelector(".add_button");

const totalEl = document.querySelector(".stat_total");
const activeEl = document.querySelector(".stat_active");
const completedEl = document.querySelector(".stat_completed");
const percentEl = document.querySelector(".stat_percent");

const tabs = document.querySelectorAll(".tab");
const clearCompletedBtn = document.querySelector(".clear_completed");
const filterInput = document.querySelector(".filter_input");

const priorityPills = document.querySelectorAll(".pill");
const categorySelect = document.querySelector(".category_select");

if (!tasksList || !emptyState || !taskInput || !addBtn) {
  throw new Error("Missing core UI elements (.tasks_list, .tasks_empty, .searchbar, .add_button)");
}
if (!totalEl || !activeEl || !completedEl || !percentEl) {
  throw new Error("Missing stat elements (.stat_total, .stat_active, .stat_completed, .stat_percent)");
}
if (!clearCompletedBtn || !filterInput || tabs.length === 0) {
  throw new Error("Missing filter UI (.clear_completed, .filter_input, .tab)");
}
if (!categorySelect || priorityPills.length === 0) {
  throw new Error("Missing priority/category controls (.pill, .category_select)");
}


let currentTab = "all";   
let searchQuery = "";
let editingId = null;
let draftEditText = "";


let selectedPriority = "Medium"; 

function setActivePriority(priorityText) {
  selectedPriority = priorityText;
  priorityPills.forEach((p) => p.classList.toggle("active", p.textContent === priorityText));
}

priorityPills.forEach((pill) => {
  pill.addEventListener("click", () => setActivePriority(pill.textContent));
});


function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalEl.textContent = total;
  activeEl.textContent = active;

  completedEl.childNodes[0].textContent = `${completed} `;
  percentEl.textContent = `(${percent}%)`;
}

function getVisibleTasks() {
  const q = searchQuery;
  return tasks
    .filter((t) => {
      if (currentTab === "active") return !t.completed;
      if (currentTab === "completed") return t.completed;
      return true;
    })
    .filter((t) => {
      if (!q) return true;
      return t.text.toLowerCase().includes(q);
    });
}

function setActiveTab(tabName) {
  currentTab = tabName;
  tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabName));
}


function renderTasks() {
  tasksList.innerHTML = "";

  const visible = getVisibleTasks();

  if (visible.length === 0) {
    emptyState.style.display = "grid";
    updateStats();
    return;
  }
  emptyState.style.display = "none";

  visible.forEach((task) => {
    const row = document.createElement("div");
    row.className = "task_row";
    row.dataset.id = task.id;

    // Toggle
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "task_toggle toggle_btn";
    toggleBtn.textContent = task.completed ? "✓" : "◯";
    row.appendChild(toggleBtn);

    // Content
    const content = document.createElement("div");
    content.className = "task_content";

    if (editingId === task.id) {
      const editInput = document.createElement("input");
      editInput.className = "edit_input";
      editInput.value = draftEditText;

      const saveBtn = document.createElement("button");
      saveBtn.className = "task_btn save_btn";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "task_btn cancel_btn";
      cancelBtn.textContent = "Cancel";

      content.appendChild(editInput);
      content.appendChild(saveBtn);
      content.appendChild(cancelBtn);
    } else {
      const textEl = document.createElement("span");
      textEl.className = "task_text";
      textEl.textContent = task.text;
      if (task.completed) textEl.classList.add("completed");

      const badges = document.createElement("div");
      badges.className = "task_badges";

      const priorityBadge = document.createElement("span");
      const pri = (task.priority || "Medium").toLowerCase();
      priorityBadge.className = `badge priority-${pri}`;
      priorityBadge.textContent = task.priority || "Medium";

      const categoryBadge = document.createElement("span");
      categoryBadge.className = "badge";
      categoryBadge.textContent = task.category || "General";

      badges.appendChild(priorityBadge);
      badges.appendChild(categoryBadge);

      const editBtn = document.createElement("button");
      editBtn.className = "task_btn edit_btn";
      editBtn.textContent = "Edit";

      content.appendChild(textEl);
      content.appendChild(badges);
      content.appendChild(editBtn);
    }

    row.appendChild(content);

    // Delete
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task_btn danger delete_btn";
    deleteBtn.textContent = "Delete";
    row.appendChild(deleteBtn);

    tasksList.appendChild(row);
  });

  updateStats();
}


function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    priority: selectedPriority,
    category: categorySelect.value,
  };

  tasks.push(newTask);
  saveTasks();
  taskInput.value = "";
  renderTasks();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});


tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.tab);
    editingId = null;
    draftEditText = "";
    renderTasks();
  });
});


filterInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  editingId = null;
  draftEditText = "";
  renderTasks();
});


clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  editingId = null;
  draftEditText = "";
  renderTasks();
});


tasksList.addEventListener("click", (e) => {
  const row = e.target.closest("[data-id]");
  if (!row) return;

  const id = Number(row.dataset.id);

  // DELETE
  if (e.target.classList.contains("delete_btn")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    if (editingId === id) {
      editingId = null;
      draftEditText = "";
    }
    renderTasks();
    return;
  }

 
  if (e.target.classList.contains("toggle_btn")) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    return;
  }

  
  if (e.target.classList.contains("edit_btn")) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    editingId = id;
    draftEditText = task.text;
    renderTasks();
    return;
  }


  if (e.target.classList.contains("save_btn")) {
    const inputEl = row.querySelector(".edit_input");
    if (!inputEl) return;

    const newText = inputEl.value.trim();
    if (newText === "") return;

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    task.text = newText;
    saveTasks();
    editingId = null;
    draftEditText = "";
    renderTasks();
    return;
  }

 
  if (e.target.classList.contains("cancel_btn")) {
    editingId = null;
    draftEditText = "";
    renderTasks();
  }
});


tasksList.addEventListener("input", (e) => {
  if (!e.target.classList.contains("edit_input")) return;
  const row = e.target.closest("[data-id]");
  if (!row) return;
  const id = Number(row.dataset.id);
  if (editingId !== id) return;
  draftEditText = e.target.value;
});

tasksList.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("edit_input")) return;
  const row = e.target.closest("[data-id]");
  if (!row) return;

  if (e.key === "Enter") row.querySelector(".save_btn")?.click();
  if (e.key === "Escape") row.querySelector(".cancel_btn")?.click();
});


setActiveTab("all");

setActivePriority(selectedPriority);
renderTasks();
