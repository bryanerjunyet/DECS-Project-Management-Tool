// Global task storage
let tasks = [];

// Event listener to add new task
document.querySelector('.new-task').addEventListener('click', function () {
    window.location.href = 'new-task.html';
});

// Function to render tasks in the Product Backlog
function renderTasks() {
    const taskBoard = document.querySelector('.task-board');
    taskBoard.innerHTML = '';

    tasks.forEach(task => {
        const newTaskCard = document.createElement('div');
        newTaskCard.className = `task-card ${task.priority.toLowerCase()}`;

        const taskTitle = document.createElement('h3');
        taskTitle.textContent = task.name;
        newTaskCard.appendChild(taskTitle);

        const userImg = document.createElement('img');
        userImg.src = task.userImg; // Example image; replace with actual path
        userImg.alt = 'User';
        newTaskCard.appendChild(userImg);

        const taskDetail = document.createElement('p');
        taskDetail.textContent = `${task.tag}: ${task.description}`;
        newTaskCard.appendChild(taskDetail);

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = task.priority.toUpperCase();
        newTaskCard.appendChild(tag);

        newTaskCard.addEventListener('click', () => {
            editTask(task.id);
        });

        taskBoard.appendChild(newTaskCard);
    });
}

// Function to save a new task
function saveTask(task) {
    tasks.push(task);
    window.location.href = 'index.html';
}

// Function to edit a task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Fill in the form with task data
        document.querySelector('#taskName').value = task.name;
        document.querySelector('#description').value = task.description;
        // And other fields...
        window.location.href = 'edit-task.html';
    }
}

// Load tasks when the page loads
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('index.html')) {
        renderTasks();
    }
});

// Task form submission
document.querySelector('#taskForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const taskName = document.querySelector('#taskName').value;
    const description = document.querySelector('#description').value;
    const tag = document.querySelector('#tag').value;
    const priority = document.querySelector('#priority').value;

    const newTask = {
        id: Date.now(),
        name: taskName,
        description: description,
        tag: tag,
        priority: priority,
        userImg: 'user2.jpg' // Example image path
    };

    saveTask(newTask);
});


document.addEventListener('DOMContentLoaded', function() {
    const choices = new Choices('#tag', {
        removeItemButton: true, // Allows removing selected items
        maxItemCount: 5,        // Limits the maximum number of selections (if needed)
        searchResultLimit: 5,   // Limits the number of search results
        renderChoiceLimit: -1   // Render all choices by default
    });
});
