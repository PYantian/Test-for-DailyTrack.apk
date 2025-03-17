let lastTime = null;

// 获取当前日期（格式：YYYY-MM-DD）
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 从 localStorage 加载记录
function loadActivities(date) {
    const activities = JSON.parse(localStorage.getItem(date)) || [];
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = ''; // 清空当前列表

    activities.forEach((activity, index) => {
        const li = createEditableListItem(activity, index);
        activityList.appendChild(li);
    });

    // 设置 lastTime 为最后一条记录的时间
    if (activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        const lastActivityTime = lastActivity.split(' - ')[1].split(':')[0]; // 提取结束时间
        lastTime = new Date(`1970-01-01T${lastActivityTime}:00`); // 转换为 Date 对象
    }
}

// 保存记录到 localStorage
function saveActivity(date, activityText) {
    const activities = JSON.parse(localStorage.getItem(date)) || [];
    activities.push(activityText);
    localStorage.setItem(date, JSON.stringify(activities));
}

// 添加活动
function addActivity(currentTime, activity) {
    const activityList = document.getElementById('activityList');

    // 获取最后一个活动的结束时间
    const lastActivity = activityList.lastChild;
    let lastEndTime = null;
    if (lastActivity) {
        const lastActivityText = lastActivity.textContent;
        lastEndTime = lastActivityText.split(' - ')[1].split(':')[0]; // 提取结束时间
    }

    // 格式化时间
    const formattedTime = formatTime(currentTime);

    // 如果存在最后一个活动，则使用其结束时间作为新活动的开始时间
    if (lastEndTime) {
        const li = createEditableListItem(`${lastEndTime} - ${formattedTime}: ${activity}`, activityList.children.length);
        activityList.appendChild(li);
    } else {
        // 否则只显示当前时间
        const li = createEditableListItem(`${formattedTime} - ${activity}`, 0);
        activityList.appendChild(li);
    }

    const currentDate = getCurrentDate();
    saveActivity(currentDate, activityList.lastChild.textContent); // 保存记录
    lastTime = currentTime;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 加载历史记录日期选项
function loadDateSelector() {
    const dateSelector = document.getElementById('dateSelector');
    dateSelector.innerHTML = '<option value="">选择日期</option>'; // 清空选项

    // 获取所有存储的日期
    const dates = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dates.push(key);
        }
    }

    // 按日期排序并添加到选择器中
    dates.sort().reverse().forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateSelector.appendChild(option);
    });
}

// 加载历史记录
function loadHistory(date) {
    const activities = JSON.parse(localStorage.getItem(date)) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = ''; // 清空历史记录

    activities.forEach((activity, index) => {
        const li = createEditableListItem(activity, index);
        historyList.appendChild(li);
    });
}

// 创建可编辑的列表项
function createEditableListItem(text, index) {
    const li = document.createElement('li');
    li.textContent = text;

    // 单击事件：将文字替换为输入框
    li.addEventListener('click', () => {
        // 如果已经处于编辑状态，则直接返回
        if (li.querySelector('input')) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = li.textContent;
        li.textContent = '';
        li.appendChild(input);
        input.focus();

        // 按下回车键或失去焦点时保存修改
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEditedText(li, input, index);
            }
        });

        input.addEventListener('blur', () => {
            saveEditedText(li, input, index);
        });
    });

    return li;
}

// 保存编辑后的文字
function saveEditedText(li, input, index) {
    const newText = input.value.trim();
    if (newText) {
        li.textContent = newText; // 更新文本内容
        updateLocalStorage();
        updateNextTaskTime(index);
    } else {
        li.textContent = input.value || li.textContent; // 恢复原始文本
    }
}

// 更新 localStorage
function updateLocalStorage() {
    const currentDate = getCurrentDate();
    const activityList = document.getElementById('activityList');
    const activities = [];

    activityList.querySelectorAll('li').forEach(li => {
        activities.push(li.textContent);
    });

    localStorage.setItem(currentDate, JSON.stringify(activities));
}

// 更新下一个任务的时间
function updateNextTaskTime(index) {
    const activityList = document.getElementById('activityList');
    const tasks = activityList.querySelectorAll('li');

    if (index < tasks.length - 1) {
        const currentTaskText = tasks[index].textContent;
        const nextTaskText = tasks[index + 1].textContent;

        const currentEndTime = currentTaskText.split(' - ')[1].split(':')[0];
        const nextStartTime = nextTaskText.split(' - ')[0];

        if (currentEndTime !== nextStartTime) {
            const updatedNextTaskText = nextTaskText.replace(nextStartTime, currentEndTime);
            tasks[index + 1].textContent = updatedNextTaskText;
            updateLocalStorage();
        }
    }
}

// 表单提交事件
document.getElementById('activityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const activity = document.getElementById('activity').value;
    const currentTime = new Date();

    if (activity) {
        addActivity(currentTime, activity);
        document.getElementById('activityForm').reset();
    }
});

// 日期选择器事件
document.getElementById('dateSelector').addEventListener('change', function(event) {
    const selectedDate = event.target.value;
    const historyList = document.getElementById('historyList');

    if (selectedDate) {
        loadHistory(selectedDate); // 加载历史记录
    } else {
        historyList.innerHTML = ''; // 清空历史记录
    }
});

// 页面加载时初始化
window.onload = function() {
    const currentDate = getCurrentDate();
    loadActivities(currentDate); // 加载今日记录
    loadDateSelector(); // 加载历史记录日期选项
};
