
     let tasks = {
            notStarted: [],
            inProgress: [],
            completed: []
        };

        // Get all task lists
        const taskLists = document.querySelectorAll('.task-list');

        // Add drag and drop event listeners to all task lists
        taskLists.forEach(taskList => {
            taskList.addEventListener('dragover', handleDragOver);
            taskList.addEventListener('drop', handleDrop);
            taskList.addEventListener('dragenter', handleDragEnter);
            taskList.addEventListener('dragleave', handleDragLeave);
        });

        function updateStats() {
            const totalTasks = Object.values(tasks).flat().length;
            const completedTasks = tasks.completed.length;
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('completedTasks').textContent = completedTasks;
        }

        function createTaskElement(task) {
            const taskEl = document.createElement('div');
            taskEl.className = `task priority-${task.priority}`;
            taskEl.draggable = true;
            taskEl.id = task.id;
            taskEl.innerHTML = `
                <div>${task.description}</div>
                <div class="actions">
                    <button class="delete" onclick="deleteTask('${task.id}')">Delete</button>
                    <button class="edit" onclick="editTask('${task.id}')">Edit</button>
                </div>
            `;
            taskEl.addEventListener('dragstart', handleDragStart);
            taskEl.addEventListener('dragend', handleDragEnd);
            return taskEl;
        }

        function renderTasks() {
            Object.keys(tasks).forEach(status => {
                const container = document.querySelector(`[data-status="${status}"]`);
                container.innerHTML = '';
                tasks[status].forEach(task => {
                    container.appendChild(createTaskElement(task));
                });
            });
            updateStats();
        }

        function addTask() {
            const input = document.getElementById('taskInput');
            const description = input.value.trim();
            const errorElement = document.getElementById('errorMessage');

            if (!description) {
                errorElement.textContent = 'Task description cannot be empty';
                return;
            }

            const taskExists = Object.values(tasks).flat().some(task => 
                task.description.toLowerCase() === description.toLowerCase()
            );

            if (taskExists) {
                errorElement.textContent = 'Task already exists';
                return;
            }

            const newTask = {
                id: Date.now().toString(),
                description,
                priority: 'medium',
                created: new Date().toISOString()
            };

            tasks.notStarted.push(newTask);
            input.value = '';
            errorElement.textContent = '';
            renderTasks();
        }

        function deleteTask(taskId) {
            Object.keys(tasks).forEach(status => {
                tasks[status] = tasks[status].filter(task => task.id !== taskId);
            });
            renderTasks();
        }

        function editTask(taskId) {
            const task = Object.values(tasks).flat().find(task => task.id === taskId);
            if (!task) return;

            const newDescription = prompt('Edit task:', task.description);
            if (!newDescription || newDescription.trim() === '') return;

            Object.keys(tasks).forEach(status => {
                tasks[status] = tasks[status].map(t => 
                    t.id === taskId ? { ...t, description: newDescription.trim() } : t
                );
            });
            renderTasks();
        }

        function handleDragStart(e) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.id);
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDragEnter(e) {
            e.preventDefault();
            if (e.target.classList.contains('task-list')) {
                e.target.classList.add('drag-over');
            }
        }

        function handleDragLeave(e) {
            if (e.target.classList.contains('task-list')) {
                e.target.classList.remove('drag-over');
            }
        }

        function handleDrop(e) {
            e.preventDefault();
            const taskList = e.target.closest('.task-list');
            if (!taskList) return;

            taskList.classList.remove('drag-over');
            const taskId = e.dataTransfer.getData('text/plain');
            const targetStatus = taskList.dataset.status;
            let taskObj;

            // Find and remove task from its current status
            Object.keys(tasks).forEach(status => {
                const taskIndex = tasks[status].findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    taskObj = tasks[status][taskIndex];
                    tasks[status].splice(taskIndex, 1);
                }
            });

            if (taskObj) {
                tasks[targetStatus].push(taskObj);
                renderTasks();
            }
        }

        // Event Listeners
        document.getElementById('addTask').addEventListener('click', addTask);
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        // Initial render
        renderTasks();
