/* =========================================
   STUDY SPACE - MAIN JAVASCRIPT
========================================= */


/* =========================================
   TASKS
========================================= */

function loadTasks() {

    const taskList = document.getElementById("taskList");

    if (!taskList) return;

    const tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📝</div>
                <p>No tasks yet.</p>
                <small>Add your first task to get started.</small>
            </div>
        `;

    } else {

        tasks.forEach((task, index) => {

            const item = document.createElement("div");

            item.className = "task-item";

            item.innerHTML = `
                <input
                    type="checkbox"
                    class="task-check"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${index})"
                >

                <div class="task-info">

                    <div class="task-title ${task.completed ? "completed" : ""}">
                        ${escapeHTML(task.title)}
                    </div>

                    <div class="task-meta">
                        ${task.date || "No date"}
                    </div>

                </div>

                <span class="priority ${task.priority.toLowerCase()}">
                    ${task.priority}
                </span>

                <button
                    class="delete-task"
                    onclick="deleteTask(${index})"
                    title="Delete task">
                    🗑️
                </button>
            `;

            taskList.appendChild(item);
        });
    }

    updateTaskStats(tasks);
}


function addTask() {

    const title = document.getElementById("taskTitle").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const date = document.getElementById("taskDate").value;

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    const tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    tasks.push({
        title: title,
        priority: priority,
        date: date,
        completed: false
    });

    localStorage.setItem("studyTasks", JSON.stringify(tasks));

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDate").value = "";

    loadTasks();
}


function toggleTask(index) {

    const tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    tasks[index].completed = !tasks[index].completed;

    localStorage.setItem("studyTasks", JSON.stringify(tasks));

    loadTasks();
}


function deleteTask(index) {

    const tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    if (confirm("Delete this task?")) {

        tasks.splice(index, 1);

        localStorage.setItem("studyTasks", JSON.stringify(tasks));

        loadTasks();
    }
}


function clearCompletedTasks() {

    let tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    tasks = tasks.filter(task => !task.completed);

    localStorage.setItem("studyTasks", JSON.stringify(tasks));

    loadTasks();
}


function updateTaskStats(tasks) {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const remaining = total - completed;

    const totalEl = document.getElementById("totalTasks");
    const completedEl = document.getElementById("completedTasks");
    const remainingEl = document.getElementById("remainingTasks");

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (remainingEl) remainingEl.textContent = remaining;
}


/* =========================================
   EVENTS
========================================= */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();


function loadCalendar() {

    const calendar = document.getElementById("calendar");

    if (!calendar) return;

    const date = new Date(currentYear, currentMonth, 1);

    const monthName = date.toLocaleString("default", {
        month: "long"
    });

    const year = currentYear;

    document.getElementById("calendarTitle").textContent =
        `${monthName} ${year}`;

    calendar.innerHTML = "";

    const firstDay = date.getDay();

    const daysInMonth =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    const previousMonthDays =
        new Date(currentYear, currentMonth, 0).getDate();

    const events =
        JSON.parse(localStorage.getItem("studyEvents") || "[]");

    /* Previous month */

    for (let i = firstDay - 1; i >= 0; i--) {

        const day = document.createElement("div");

        day.className = "day muted";

        day.innerHTML = `
            <div class="day-number">
                ${previousMonthDays - i}
            </div>
        `;

        calendar.appendChild(day);
    }


    /* Current month */

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {

        const cell = document.createElement("div");

        cell.className = "day";

        const today = new Date();

        if (
            dayNumber === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {
            cell.classList.add("today");
        }

        const eventDate =
            `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

        const dayEvents =
            events.filter(event => event.date === eventDate);

        let eventHTML = "";

        dayEvents.slice(0, 2).forEach(event => {

            eventHTML += `
                <div class="event-dot">
                    • ${escapeHTML(event.title)}
                </div>
            `;
        });

        cell.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            ${eventHTML}
        `;

        calendar.appendChild(cell);
    }


    /* Remaining cells */

    const totalCells = firstDay + daysInMonth;

    const remaining = 42 - totalCells;

    for (let i = 1; i <= remaining; i++) {

        const day = document.createElement("div");

        day.className = "day muted";

        day.innerHTML = `
            <div class="day-number">${i}</div>
        `;

        calendar.appendChild(day);
    }

    loadEvents();
}


function previousMonth() {

    currentMonth--;

    if (currentMonth < 0) {

        currentMonth = 11;
        currentYear--;

    }

    loadCalendar();
}


function nextMonth() {

    currentMonth++;

    if (currentMonth > 11) {

        currentMonth = 0;
        currentYear++;

    }

    loadCalendar();
}


function addEvent() {

    const title =
        document.getElementById("eventTitle").value.trim();

    const date =
        document.getElementById("eventDate").value;

    const time =
        document.getElementById("eventTime").value;

    const description =
        document.getElementById("eventDescription").value.trim();

    if (!title || !date) {

        alert("Please enter event title and date.");

        return;
    }

    const events =
        JSON.parse(localStorage.getItem("studyEvents") || "[]");

    events.push({
        title,
        date,
        time,
        description
    });

    localStorage.setItem(
        "studyEvents",
        JSON.stringify(events)
    );

    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventDescription").value = "";

    loadCalendar();
}


function loadEvents() {

    const eventList = document.getElementById("eventList");

    if (!eventList) return;

    const events =
        JSON.parse(localStorage.getItem("studyEvents") || "[]");

    eventList.innerHTML = "";

    if (events.length === 0) {

        eventList.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📅</div>
                <p>No events added.</p>
            </div>
        `;

        return;
    }

    events.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    events.forEach((event, index) => {

        const item = document.createElement("div");

        item.className = "event-item";

        item.innerHTML = `
            <button
                class="delete-event"
                onclick="deleteEvent(${index})">
                🗑️
            </button>

            <strong>${escapeHTML(event.title)}</strong>

            <small>
                📅 ${event.date}
                ${event.time ? " • ⏰ " + event.time : ""}
            </small>

            ${
                event.description
                ? `<p style="margin-top:8px;color:#aaa;">
                    ${escapeHTML(event.description)}
                   </p>`
                : ""
            }
        `;

        eventList.appendChild(item);
    });
}


function deleteEvent(index) {

    const events =
        JSON.parse(localStorage.getItem("studyEvents") || "[]");

    if (confirm("Delete this event?")) {

        events.splice(index, 1);

        localStorage.setItem(
            "studyEvents",
            JSON.stringify(events)
        );

        loadCalendar();
    }
}


/* =========================================
   STUDY PLANNER
========================================= */

function loadPlanner() {

    const list = document.getElementById("scheduleList");

    if (!list) return;

    const schedules =
        JSON.parse(localStorage.getItem("studySchedules") || "[]");

    list.innerHTML = "";

    if (schedules.length === 0) {

        list.innerHTML = `
            <div class="empty">
                <div class="empty-icon">⏰</div>
                <p>No study sessions yet.</p>
                <small>Create your first study schedule.</small>
            </div>
        `;

        return;
    }

    schedules.forEach((schedule, index) => {

        const item = document.createElement("div");

        item.className = "schedule-item";

        item.innerHTML = `

            <div class="schedule-time">
                ${schedule.start} - ${schedule.end}
            </div>

            <div>

                <div class="schedule-subject">
                    ${escapeHTML(schedule.subject)}
                </div>

                <div class="schedule-type">
                    ${escapeHTML(schedule.type)}
                </div>

            </div>

            <button
                class="delete-schedule"
                onclick="deleteSchedule(${index})">
                Delete
            </button>
        `;

        list.appendChild(item);
    });
}


function addSchedule() {

    const subject =
        document.getElementById("subject").value.trim();

    const start =
        document.getElementById("startTime").value;

    const end =
        document.getElementById("endTime").value;

    const type =
        document.getElementById("studyType").value;

    if (!subject || !start || !end) {

        alert("Please fill all schedule details.");

        return;
    }

    const schedules =
        JSON.parse(localStorage.getItem("studySchedules") || "[]");

    schedules.push({
        subject,
        start,
        end,
        type
    });

    localStorage.setItem(
        "studySchedules",
        JSON.stringify(schedules)
    );

    document.getElementById("subject").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    loadPlanner();
}


function deleteSchedule(index) {

    const schedules =
        JSON.parse(localStorage.getItem("studySchedules") || "[]");

    if (confirm("Delete this study session?")) {

        schedules.splice(index, 1);

        localStorage.setItem(
            "studySchedules",
            JSON.stringify(schedules)
        );

        loadPlanner();
    }
}


/* =========================================
   SECURITY HELPER
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadTasks();
    loadCalendar();
    loadPlanner();

});
