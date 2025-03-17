// 禁用复制
document.addEventListener('copy', function(e) {
    e.preventDefault(); // 阻止默认复制行为
    alert('复制功能已禁用');
});

// 其他 JavaScript 代码（如任务栏逻辑）
document.getElementById('addTaskBtn').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        addTask(taskText);
        taskInput.value = '';
        saveTasks();
    }
});

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (taskText !== '') {
            addTask(taskText);
            taskInput.value = '';
            saveTasks();
        }
    }
});

function addTask(taskText, isCompleted = false) {
    const taskList = document.getElementById('taskList');

    const li = document.createElement('li');
    li.textContent = taskText;

    if (isCompleted) {
        li.classList.add('completed');
    }

    // 短按：标记任务为完成（划线效果）或移动到最前面
    // 左滑或右滑：删除任务
    let isClick = true; // 默认是点击事件
    let touchStartX = 0;
    let touchStartY = 0;

    li.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isClick = true; // 标记为点击事件
        li.classList.remove('swiped', 'swiped-right'); // 移除滑动状态
    });

    li.addEventListener('touchend', function(e) {
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        // 计算滑动距离
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // 如果滑动距离较大，则认为是滑动操作，不是点击
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            isClick = false; // 标记为滑动事件

            // 判断是左滑还是右滑
            if (diffX > 0) {
                // 右滑
                li.classList.add('swiped-right'); // 添加右滑状态
                setTimeout(() => deleteTask(li), 300); // 延迟删除任务，等待动画完成
            } else {
                // 左滑
                li.classList.add('swiped'); // 添加左滑状态
                setTimeout(() => deleteTask(li), 300); // 延迟删除任务，等待动画完成
            }
        }

        // 如果是点击事件，切换任务完成状态
        if (isClick) {
            li.classList.toggle('completed');
            if (li.classList.contains('completed')) {
                taskList.appendChild(li); // 完成任务移动到列表底部
            } else {
                taskList.insertBefore(li, taskList.firstChild); // 未完成任务移动到列表顶部
            }
            saveTasks();
        }
    });

    // 将新任务插入到列表的最前面
    taskList.insertBefore(li, taskList.firstChild);
}

// 删除任务
function deleteTask(li) {
    const taskList = document.getElementById('taskList');
    taskList.removeChild(li);
    saveTasks();
}

// 保存任务到 LocalStorage
function saveTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        tasks.push({
            text: li.textContent,
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 从 LocalStorage 加载任务
function loadTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    // 按保存时的顺序添加任务
    tasks.reverse().forEach(task => {
        addTask(task.text, task.completed);
    });
}

// 页面加载时加载任务
window.addEventListener('load', loadTasks);
