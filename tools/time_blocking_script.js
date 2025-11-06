document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "timeBlockingTasks";
    let tasks = [];

    // --- Get Elements ---
    const taskForm = document.getElementById("task-form");
    const taskNameInput = document.getElementById("task-name");
    const startTimeInput = document.getElementById("start-time");
    const endTimeInput = document.getElementById("end-time");
    const taskTypeInput = document.getElementById("task-type");
    const taskList = document.getElementById("task-list");
    const clearAllBtn = document.getElementById("clear-all-btn");

    // --- Core Functions ---

    function loadTasks() {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function renderTasks() {
        // Clear current list
        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = `<p style="color: var(--gray-400); text-align: center;">Your schedule is empty. Add a task to begin.</p>`;
            clearAllBtn.style.display = "none";
            return;
        }

        clearAllBtn.style.display = "inline-flex";

        // Sort tasks by start time
        const sortedTasks = tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Re-draw list
        sortedTasks.forEach(task => {
            const taskItem = document.createElement("div");
            taskItem.className = `task-item task-item--${task.type}`;
            
            taskItem.innerHTML = `
                <div class="task-time">${task.startTime} - ${task.endTime}</div>
                <div class="task-details">
                    <strong>${task.name}</strong>
                    <span class="task-tag task-tag--${task.type}">${task.type}</span>
                </div>
                <button class="delete-task-btn" data-id="${task.id}">&times;</button>
            `;
            taskList.appendChild(taskItem);
        });
    }

    function handleAddTask(e) {
        e.preventDefault();

        const newTask = {
            id: Date.now(),
            name: taskNameInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            type: taskTypeInput.value
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        // Clear form
        taskForm.reset();
    }

    function handleDeleteTask(e) {
        if (e.target.classList.contains("delete-task-btn")) {
            const idToDelete = parseInt(e.target.dataset.id);
            tasks = tasks.filter(task => task.id !== idToDelete);
            saveTasks();
            renderTasks();
        }
    }

    function handleClearAll() {
        if (confirm("Are you sure you want to clear all tasks?")) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    }

    // --- Event Listeners ---
    taskForm.addEventListener("submit", handleAddTask);
    taskList.addEventListener("click", handleDeleteTask);
    clearAllBtn.addEventListener("click", handleClearAll);

    // --- Initial Load ---
    loadTasks();
});