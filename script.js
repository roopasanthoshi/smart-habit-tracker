document.addEventListener("DOMContentLoaded", function() {

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let rewardPoints = JSON.parse(localStorage.getItem("points")) || 0;
    let editId = null;

    const form = document.getElementById("taskForm");
    const container = document.getElementById("taskContainer");
    const stats = document.getElementById("stats");
    const pointsDisplay = document.getElementById("points");
    const progressBar = document.getElementById("progressBar");
    const levelDisplay = document.getElementById("level");
    const badgesDisplay = document.getElementById("badges");
    const darkToggle = document.getElementById("darkToggle");

    /* ================= FUNCTIONS FIRST ================= */

    const saveAll = function() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("points", JSON.stringify(rewardPoints));
    };

    const updateStats = function() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percent = total ? ((completed / total) * 100).toFixed(0) : 0;

        stats.innerHTML = `
        <p>Total: ${total}</p>
        <p>Completed: ${completed}</p>
        <p>Completion: ${percent}%</p>
    `;
    };

    const updateProgress = function() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        progressBar.style.width = total ? (completed / total) * 100 + "%" : "0%";
    };

    const updateLevel = function() {
        if (rewardPoints < 50)
            levelDisplay.textContent = "Level: Beginner";
        else if (rewardPoints < 150)
            levelDisplay.textContent = "Level: Intermediate";
        else
            levelDisplay.textContent = "Level: Pro 🔥";

        pointsDisplay.textContent = rewardPoints;
    };

    const updateBadges = function() {
        badgesDisplay.innerHTML = "";
        const completed = tasks.filter(t => t.completed).length;

        if (completed >= 1)
            badgesDisplay.innerHTML += "🎖 First Task Completed<br>";
        if (completed >= 5)
            badgesDisplay.innerHTML += "🏅 5 Tasks Completed<br>";
        if (completed >= 10)
            badgesDisplay.innerHTML += "🏆 10 Tasks Master<br>";
    };

    const toggleComplete = function(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        rewardPoints += task.completed ? 10 : -10;
        rewardPoints = Math.max(0, rewardPoints);

        saveAll();
        render();
    };

    const editTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById("title").value = task.title;
        document.getElementById("description").value = task.description;
        document.getElementById("dueDate").value = task.dueDate;
        editId = id;
    };

    const deleteTask = function(id) {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return;

        if (tasks[index].completed)
            rewardPoints = Math.max(0, rewardPoints - 10);

        tasks.splice(index, 1);
        saveAll();
        render();
    };

    const pinTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        task.pinned = !task.pinned;
        saveAll();
        render();
    };

    const createButton = function(text, callback) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.addEventListener("click", callback);
        return btn;
    };

    const render = function() {
        container.innerHTML = "";

        const sorted = [...tasks].sort((a, b) => b.pinned - a.pinned);

        sorted.forEach(task => {
            const div = document.createElement("div");
            div.className = "task-card";

            if (task.priority === "High") div.classList.add("high");
            if (task.priority === "Medium") div.classList.add("medium");
            if (task.priority === "Low") div.classList.add("low");
            if (task.completed) div.classList.add("completed");
            if (task.pinned) div.classList.add("pinned");

            div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || ""}</p>
            <p>Due: ${task.dueDate || "No Date"}</p>
        `;

            div.append(
                createButton(task.completed ? "Undo" : "Complete", () => toggleComplete(task.id)),
                createButton("Edit", () => editTask(task.id)),
                createButton("Delete", () => deleteTask(task.id)),
                createButton(task.pinned ? "Unpin" : "Pin", () => pinTask(task.id))
            );

            container.appendChild(div);
        });

        updateStats();
        updateProgress();
        updateLevel();
        updateBadges();
    };

    /* ================= EVENTS AFTER ================= */

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value.trim();
        if (!title) return;

        const description = document.getElementById("description").value.trim();
        const dueDate = document.getElementById("dueDate").value;
        const priority = document.querySelector('input[name="priority"]:checked')?.value;
        const category = document.querySelector('input[name="category"]:checked')?.value;

        if (editId !== null) {
            const index = tasks.findIndex(t => t.id === editId);
            if (index !== -1)
                tasks[index] = {
                    ...tasks[index],
                    title,
                    description,
                    dueDate,
                    priority,
                    category
                };
            editId = null;
        } else {
            tasks.push({
                id: Date.now(),
                title,
                description,
                dueDate,
                priority,
                category,
                completed: false,
                pinned: false
            });
        }

        saveAll();
        render();
        form.reset();
    });

    darkToggle?.addEventListener("click", function() {
        document.body.classList.toggle("dark");
    });

    /* ================= INITIAL LOAD ================= */

    pointsDisplay.textContent = rewardPoints;
    render();

});
