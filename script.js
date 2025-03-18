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

    activities.forEach(activity => {
        const li = createEditableListItem(activity);
        activityList.appendChild(li);
    });

    // 设置 lastTime 为最后一条记录的结束时间
    if (activities.length > 0) {
        const lastActivity = activities[activities.length - 1]; // "11:30 - 12:00: 午餐"
        const lastActivityTime = lastActivity.split(' - ')[1].split(':')[0] + ":" + lastActivity.split(' - ')[1].split(':')[1]; // "12:00"
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
    const li = document.createElement('li');

    // 格式化时间
    const formattedTime = formatTime(currentTime);
    const currentDate = getCurrentDate();
    loadActivities(currentDate);

    // 如果是第一次记录，只显示当前时间
    if (!lastTime) {
        li.textContent = `${formattedTime} - ${formattedTime}: ${activity}`;
    } else {
        // 否则显示时间段
        const formattedLastTime = formatTime(lastTime);
        li.textContent = `${formattedLastTime} - ${formattedTime}: ${activity}`;
    }

    const editableLi = createEditableListItem(li.textContent);
    activityList.appendChild(editableLi);
    saveActivity(currentDate, editableLi.textContent); // 保存记录
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

    activities.forEach(activity => {
        const li = createEditableListItem(activity);
        historyList.appendChild(li);
    });
}

// 创建可编辑的列表项
function createEditableListItem(text) {
    const li = document.createElement('li');
    li.textContent = text;

    // 单击事件：将文字替换为输入框
    li.addEventListener('click', () => {
        // 如果已经存在输入框，直接返回
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
                saveEditedText(li, input);
            }
        });

        input.addEventListener('blur', () => {
            saveEditedText(li, input);
        });
    });

    // 添加滑动删除功能
    addSwipeToDelete(li);

    return li;
}

function saveEditedText(li, input) {
    const newText = input.value.trim();
    if (newText) {
        li.textContent = newText;
        updateLocalStorage();
    } else {
        li.textContent = input.value; // 保留原内容
    }

    // 移除输入框
    input.remove();
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

// 添加滑动删除功能
function addSwipeToDelete(li) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    const swipeThreshold = 150; // 滑动阈值，单位：像素

    li.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false; // 初始状态为未滑动
    });

    li.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        // 计算滑动距离
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // 如果滑动距离超过阈值，则认为是滑动事件
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
            isSwiping = true; // 标记为滑动事件
            e.preventDefault(); // 防止页面滚动
        }
    });

    li.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        // 计算滑动距离
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // 如果是滑动事件，则执行删除操作
        if (isSwiping) {
            // 判断是左滑还是右滑
            if (diffX > 0) {
                // 右滑：删除记录
                li.classList.add('swiped'); // 添加滑动状态
                setTimeout(() => deleteActivity(li), 300); // 延迟删除任务，等待动画完成
            } else {
                // 左滑：删除记录
                li.classList.add('swiped'); // 添加滑动状态
                setTimeout(() => deleteActivity(li), 300); // 延迟删除任务，等待动画完成
            }
        }
    });
}

// 删除记录
function deleteActivity(li) {
    li.remove();
    updateLocalStorage();   
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
