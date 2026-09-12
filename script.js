/* =========================================================
   STUDY SPACE - COMMON JAVASCRIPT
   Tasks + Events + Planner
   Uses localStorage
   ========================================================= */


/* ================= NAVIGATION ================= */

function setupNavigation() {

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-links a").forEach(link => {

        const linkPage = link.getAttribute("href").split("/").pop();

        if (linkPage === currentPage) {
            link.classList.add("active");
        }

    });
}


/* ================= TASKS ================= */

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];


function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}


function addTask() {

    const input = document.getElementById("taskInput");
    const priority = document.getElementById("taskPriority");

    if (!input) return;

    const text = input.value.trim();

    if (!text) {
        alert("Please enter a task.");
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        priority: priority ? priority.value : "Medium",
        completed: false
    };

    tasks.push(task);

    saveTasks();

    input.value = "";

    renderTasks();
}


function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;

    });

    saveTasks();

    renderTasks();
}


function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}


function clearCompletedTasks() {

    tasks = tasks.filter(task => !task.completed);

    saveTasks();

    renderTasks();
}


function renderTasks() {

    const list = document.getElementById("taskList");

    if (!list) return;

    const total = tasks.length;

    const completed = tasks.filter(t => t.completed).length;

    const remaining = total - completed;

    const totalElement = document.getElementById("totalTasks");
    const completedElement = document.getElementById("completedTasks");
    const remainingElement = document.getElementById("remainingTasks");

    if (totalElement) totalElement.textContent = total;
    if (completedElement) completedElement.textContent = completed;
    if (remainingElement) remainingElement.textContent = remaining;


    if (tasks.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No tasks yet</h3>
                <p>Add your first task above.</p>
            </div>
        `;

        return;
    }


    list.innerHTML = tasks.map(task => {

        const priorityClass =
            task.priority.toLowerCase() === "high"
                ? "priority-high"
                : task.priority.toLowerCase() === "low"
                    ? "priority-low"
                    : "priority-medium";

        return `
            <div class="task-item ${task.completed ? "completed" : ""}">

                <input
                    class="task-check"
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <span class="task-text">
                    ${escapeHTML(task.text)}
                </span>

                <span class="priority ${priorityClass}">
                    ${task.priority}
                </span>

                <button
                    class="task-delete"
                    onclick="deleteTask(${task.id})"
                    title="Delete task"
                >
                    🗑️
                </button>

            </div>
        `;

    }).join("");
}


/* ================= EVENTS ================= */

let events = JSON.parse(localStorage.getItem("studyEvents")) || [];

let currentCalendarDate = new Date();

let selectedDate =
    new Date().toISOString().split("T")[0];


function saveEvents() {

    localStorage.setItem(
        "studyEvents",
        JSON.stringify(events)
    );
}


function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function renderCalendar() {

    const calendar = document.getElementById("calendarGrid");

    if (!calendar) return;

    const monthTitle =
        document.getElementById("calendarMonth");

    const year = currentCalendarDate.getFullYear();

    const month = currentCalendarDate.getMonth();

    const monthName =
        currentCalendarDate.toLocaleString(
            "default",
            { month: "long" }
        );

    if (monthTitle) {
        monthTitle.textContent =
            `${monthName} ${year}`;
    }


    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    calendar.innerHTML = "";


    // Empty spaces
    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");

        empty.className = "empty-day";

        calendar.appendChild(empty);
    }


    // Days
    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            new Date(year, month, day);

        const dateString =
            formatDate(date);

        const button =
            document.createElement("button");

        button.className = "calendar-day";

        button.textContent = day;

        if (
            dateString ===
            new Date().toISOString().split("T")[0]
        ) {
            button.classList.add("today");
        }

        if (dateString === selectedDate) {
            button.classList.add("selected");
        }

        if (
            events.some(
                event => event.date === dateString
            )
        ) {
            button.classList.add("has-event");
        }


        button.addEventListener(
            "click",
            () => selectCalendarDate(dateString)
        );

        calendar.appendChild(button);
    }
}


function selectCalendarDate(date) {

    selectedDate = date;

    const dateInput =
        document.getElementById("eventDate");

    if (dateInput) {
        dateInput.value = date;
    }

    renderCalendar();

    renderEvents();
}


function changeMonth(direction) {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() + direction
    );

    renderCalendar();
}


function addEvent() {

    const titleInput =
        document.getElementById("eventTitle");

    const dateInput =
        document.getElementById("eventDate");

    const timeInput =
        document.getElementById("eventTime");

    const descriptionInput =
        document.getElementById("eventDescription");


    if (!titleInput || !dateInput) return;


    const title =
        titleInput.value.trim();

    const date =
        dateInput.value;

    const time =
        timeInput ? timeInput.value : "";

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    if (!title || !date) {

        alert(
            "Please enter event title and date."
        );

        return;
    }


    events.push({

        id: Date.now(),

        title: title,

        date: date,

        time: time,

        description: description

    });


    saveEvents();


    titleInput.value = "";

    if (timeInput) {
        timeInput.value = "";
    }

    if (descriptionInput) {
        descriptionInput.value = "";
    }


    selectedDate = date;


    renderCalendar();

    renderEvents();
}


function deleteEvent(id) {

    events =
        events.filter(
            event => event.id !== id
        );

    saveEvents();

    renderCalendar();

    renderEvents();
}


function renderEvents() {

    const list =
        document.getElementById("eventList");

    if (!list) return;


    const selectedEvents =
        events
            .filter(event => event.date === selectedDate)
            .sort((a, b) =>
                (a.time || "").localeCompare(
                    b.time || ""
                )
            );


    if (selectedEvents.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No events</h3>
                <p>No events scheduled for ${selectedDate}.</p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        selectedEvents.map(event => `

            <div class="event-item">

                <div class="event-info">

                    <strong>
                        ${escapeHTML(event.title)}
                    </strong>

                    <small>
                        ${event.date}
                        ${event.time ? " • " + event.time : ""}
                    </small>

                    ${
                        event.description
                        ? `
                            <p style="margin-top:6px;">
                                ${escapeHTML(event.description)}
                            </p>
                        `
                        : ""
                    }

                </div>

                <button
                    class="btn btn-danger"
                    onclick="deleteEvent(${event.id})"
                >
                    Delete
                </button>

            </div>

        `).join("");
}


/* ================= PLANNER ================= */

let schedules =
    JSON.parse(
        localStorage.getItem("studySchedules")
    ) || [];


function saveSchedules() {

    localStorage.setItem(
        "studySchedules",
        JSON.stringify(schedules)
    );
}


function addSchedule() {

    const subject =
        document.getElementById("subjectInput");

    const start =
        document.getElementById("startTime");

    const end =
        document.getElementById("endTime");

    const type =
        document.getElementById("scheduleType");


    if (!subject || !start || !end || !type) {
        return;
    }


    if (
        !subject.value.trim() ||
        !start.value ||
        !end.value
    ) {

        alert(
            "Please fill Subject, Start Time and End Time."
        );

        return;
    }


    if (start.value >= end.value) {

        alert(
            "End time must be after start time."
        );

        return;
    }


    schedules.push({

        id: Date.now(),

        subject: subject.value.trim(),

        start: start.value,

        end: end.value,

        type: type.value

    });


    schedules.sort(
        (a, b) =>
            a.start.localeCompare(b.start)
    );


    saveSchedules();


    subject.value = "";

    start.value = "";

    end.value = "";

    renderSchedules();
}


function deleteSchedule(id) {

    schedules =
        schedules.filter(
            item => item.id !== id
        );

    saveSchedules();

    renderSchedules();
}


function clearSchedules() {

    if (schedules.length === 0) {
        return;
    }

    if (
        confirm(
            "Are you sure you want to clear all schedules?"
        )
    ) {

        schedules = [];

        saveSchedules();

        renderSchedules();
    }
}


function renderSchedules() {

    const list =
        document.getElementById("scheduleList");

    if (!list) return;


    if (schedules.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⏰</div>
                <h3>No study sessions</h3>
                <p>Create your first study schedule above.</p>
            </div>
        `;

        return;
    }


    list.innerHTML =
        schedules.map(item => `

            <div class="schedule-item">

                <div class="schedule-time">

                    ${item.start}
                    <br>
                    ↓
                    <br>
                    ${item.end}

                </div>

                <div>

                    <div class="schedule-subject">
                        ${escapeHTML(item.subject)}
                    </div>

                    <span class="schedule-type">
                        ${escapeHTML(item.type)}
                    </span>

                </div>

                <button
                    class="btn btn-danger"
                    onclick="deleteSchedule(${item.id})"
                >
                    Delete
                </button>

            </div>

        `).join("");
}


/* ================= SECURITY HELPER ================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ================= INITIALIZE ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        renderTasks();

        renderCalendar();

        renderEvents();

        renderSchedules();

    }
);
