document.querySelector('.new-task').addEventListener('click', function() {
    // Function to add a new task card dynamically
    const taskBoard = document.querySelector('.task-board');
    
    const newTaskCard = document.createElement('div');
    newTaskCard.className = 'task-card medium';
    
    const taskTitle = document.createElement('h3');
    taskTitle.textContent = 'New Task';
    newTaskCard.appendChild(taskTitle);

    const userImg = document.createElement('img');
    userImg.src = 'user2.jpg'; // Example image; replace with actual path
    userImg.alt = 'User';
    newTaskCard.appendChild(userImg);

    const taskDetail = document.createElement('p');
    taskDetail.textContent = 'Frontend: UX/UI';
    newTaskCard.appendChild(taskDetail);

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'MEDIUM';
    newTaskCard.appendChild(tag);

    taskBoard.appendChild(newTaskCard);
});
