const KEYS = {
    tasks: "noloshaada_tasks",
    theme: "noloshaada_theme",
    eval: "noloshaada_daily_evaluation",
    history: "noloshaada_daily_evaluation_history",
    notes: "noloshaada_notes",
    check: "noloshaada_checklists",
    schedule: "noloshaada_schedules",
    events: "noloshaada_calendar_events"
};


const defaultTasks = [
    ["Qur'aan & Ducada Subax", "05:30 - 06:30", true],
    ["Salaadda Subax", "06:30 - 07:00", true],
    ["Akhris Qur'aan", "07:00 - 08:00", true],
    ["Waxbarasho / Barashada Koorsada", "08:00 - 11:00", false],
    ["Nasasho", "11:00 - 11:30", false],
    ["Shaqo / Hawlaha Gaarka ah", "11:30 - 02:00", false],
    ["Salaadda Duhur", "02:00 - 02:30", false],
    ["Cunto & Nasasho", "02:30 - 04:00", false],
    ["Waxbarasho / Akhris", "04:00 - 06:00", false],
    ["Jimicsi / Ciyaar", "06:00 - 07:00", false],
    ["Salaadda Maqrib", "07:00 - 07:30", false],
    ["Qur'aan & Xusuusin", "07:30 - 08:30", false]
].map(function(item) {

    return {
        name: item[0],
        time: item[1],
        completed: item[2]
    };

});


let tasks = read(KEYS.tasks, defaultTasks);

let calendarDate = new Date();


function read(key, fallback) {

    try {

        const saved = localStorage.getItem(key);

        return saved
            ? JSON.parse(saved)
            : fallback;

    } catch (error) {

        return fallback;

    }

}


function write(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}


function todayKey() {

    return new Date()
        .toISOString()
        .slice(0, 10);

}


/* ================================
   TASKS
================================ */

function renderTasks() {

    const list =
        document.getElementById("taskList");

    if (!list) {
        return;
    }

    list.innerHTML = "";


    tasks.forEach(function(task, index) {

        const row =
            document.createElement("div");

        row.className =
            "task" +
            (task.completed ? " completed" : "");

        row.dataset.index = index;


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;


        const info =
            document.createElement("div");

        info.className = "task-info";


        const name =
            document.createElement("strong");

        name.textContent = task.name;


        const time =
            document.createElement("span");

        time.textContent = task.time;


        info.append(name, time);


        const actions =
            document.createElement("div");

        actions.className = "task-actions";


        const edit =
            document.createElement("button");

        edit.className = "edit";
        edit.type = "button";
        edit.textContent = "✎";
        edit.title = "Wax ka beddel";


        const del =
            document.createElement("button");

        del.className = "delete";
        del.type = "button";
        del.textContent = "🗑";
        del.title = "Tirtir";


        actions.append(edit, del);


        row.append(
            checkbox,
            info,
            actions
        );


        checkbox.onchange = function() {

            tasks[index].completed =
                checkbox.checked;

            write(KEYS.tasks, tasks);

            renderTasks();

        };


        edit.onclick = function() {

            editTask(index);

        };


        del.onclick = function() {

            if (
                confirm(
                    "Ma hubtaa inaad tirtirayso hawshan?"
                )
            ) {

                tasks.splice(index, 1);

                write(KEYS.tasks, tasks);

                renderTasks();

            }

        };


        list.appendChild(row);

    });


    updateProgress();
    updateOverview();

}


function addTask() {

    const input =
        document.getElementById("taskInput");

    if (!input) {
        return;
    }


    const name =
        input.value.trim();


    if (!name) {

        alert("Fadlan qor hawsha.");

        input.focus();

        return;

    }


    const time =
        prompt(
            "Geli waqtiga hawsha. Tusaale: 08:00 - 09:00"
        );


    if (
        time === null ||
        !time.trim()
    ) {
        return;
    }


    tasks.push({
        name: name,
        time: time.trim(),
        completed: false
    });


    write(KEYS.tasks, tasks);


    input.value = "";


    renderTasks();

    input.focus();

}


function editTask(index) {

    const name =
        prompt(
            "Wax ka beddel magaca hawsha:",
            tasks[index].name
        );


    if (
        name === null ||
        !name.trim()
    ) {
        return;
    }


    const time =
        prompt(
            "Wax ka beddel waqtiga:",
            tasks[index].time
        );


    if (
        time === null ||
        !time.trim()
    ) {
        return;
    }


    tasks[index].name =
        name.trim();

    tasks[index].time =
        time.trim();


    write(KEYS.tasks, tasks);

    renderTasks();

}


function updateProgress() {

    const circle =
        document.querySelector(
            ".progress-circle"
        );

    const paragraphs =
        document.querySelectorAll(
            ".progress-box p"
        );


    if (!circle) {
        return;
    }


    const completed =
        tasks.filter(function(task) {
            return task.completed;
        }).length;


    const total =
        tasks.length;


    const percent =
        total
            ? Math.round(
                completed / total * 100
            )
            : 0;


    circle.textContent =
        percent + "%";


    if (paragraphs[0]) {

        paragraphs[0].textContent =
            "Hawlahaan dhammeeyay";

    }


    if (paragraphs[1]) {

        paragraphs[1].textContent =
            completed + " / " + total;

    }

}


/* ================================
   EVALUATION
================================ */

function getHistory() {

    return read(
        KEYS.history,
        []
    );

}


function saveEvaluation() {

    const wrapper =
        document.getElementById(
            "dailyEvaluation"
        );


    const selected =
        wrapper
            ? wrapper.querySelector(
                "button.selected"
            )
            : null;


    const rating =
        selected
            ? Number(
                selected.dataset.rating
            )
            : 0;


    if (!rating) {

        alert(
            "Fadlan dooro qiimeyn 1 ilaa 5."
        );

        return;

    }


    const note =
        document
            .getElementById("evaluationNote")
            ?.value
            .trim() || "";


    const entry = {
        date: todayKey(),
        rating: rating,
        note: note
    };


    write(
        KEYS.eval,
        entry
    );


    const history =
        getHistory().filter(function(item) {

            return item.date !== entry.date;

        });


    history.push(entry);


    write(
        KEYS.history,
        history
    );


    updateOverview();


    alert(
        "Qiimeynta maanta waa la kaydiyay."
    );

}


function setupEvaluation() {

    const box =
        document.querySelector(
            ".progress-box"
        );


    if (
        !box ||
        document.getElementById(
            "dailyEvaluation"
        )
    ) {
        return;
    }


    const saved =
        read(KEYS.eval, {});


    const wrapper =
        document.createElement("div");


    wrapper.id =
        "dailyEvaluation";


    wrapper.className =
        "daily-evaluation";


    wrapper.innerHTML = `
        <div class="evaluation-title">
            Qiimeynta Shaqada Maanta
        </div>

        <div class="evaluation-rating">

            <button type="button" data-rating="1">
                1
            </button>

            <button type="button" data-rating="2">
                2
            </button>

            <button type="button" data-rating="3">
                3
            </button>

            <button type="button" data-rating="4">
                4
            </button>

            <button type="button" data-rating="5">
                5
            </button>

        </div>

        <textarea
            id="evaluationNote"
            placeholder="Maxaad maanta qabatay? Maxaa kuu haray?"
        ></textarea>

        <button
            type="button"
            id="saveEvaluation"
            class="save-btn"
        >
            Kaydi Qiimeynta
        </button>
    `;


    box.appendChild(wrapper);


    wrapper
        .querySelectorAll("[data-rating]")
        .forEach(function(button) {

            if (
                Number(saved.rating) ===
                Number(button.dataset.rating)
            ) {

                button.classList.add(
                    "selected"
                );

            }


            button.onclick =
                function() {

                    wrapper
                        .querySelectorAll(
                            "[data-rating]"
                        )
                        .forEach(function(item) {

                            item.classList.remove(
                                "selected"
                            );

                        });


                    button.classList.add(
                        "selected"
                    );

                };

        });


    if (saved.note) {

        document.getElementById(
            "evaluationNote"
        ).value = saved.note;

    }


    document.getElementById(
        "saveEvaluation"
    ).onclick = saveEvaluation;

}


/* ================================
   DASHBOARD OVERVIEW
================================ */

function updateOverview() {

    const todayCount =
        document.getElementById(
            "overviewTodayCount"
        );

    const todayText =
        document.getElementById(
            "overviewTodayText"
        );

    const weekCount =
        document.getElementById(
            "overviewWeekCount"
        );

    const weekText =
        document.getElementById(
            "overviewWeekText"
        );

    const monthPercent =
        document.getElementById(
            "overviewMonthPercent"
        );

    const monthText =
        document.getElementById(
            "overviewMonthText"
        );


    if (!todayCount) {
        return;
    }


    const completed =
        tasks.filter(function(task) {
            return task.completed;
        }).length;


    const total =
        tasks.length;


    const percent =
        total
            ? Math.round(
                completed / total * 100
            )
            : 0;


    const todayEvaluation =
        read(
            KEYS.eval,
            {}
        );


    todayCount.textContent =
        completed +
        " / " +
        total;


    todayText.textContent =
        todayEvaluation.rating
            ? "Qiimeyn: " +
              todayEvaluation.rating +
              "/5 • " +
              percent +
              "% hawlo la qabtay"

            : percent +
              "% hawlo la qabtay • Qiimeyn lama kaydin";


    const history =
        getHistory();


    const now =
        new Date();


    const monday =
        new Date(now);


    const day =
        monday.getDay();


    monday.setDate(
        monday.getDate() +
        (day === 0 ? -6 : 1 - day)
    );


    monday.setHours(
        0,
        0,
        0,
        0
    );


    const nextWeek =
        new Date(monday);


    nextWeek.setDate(
        nextWeek.getDate() + 7
    );


    const weekHistory =
        history.filter(function(item) {

            const date =
                new Date(
                    item.date +
                    "T00:00:00"
                );

            return (
                date >= monday &&
                date < nextWeek
            );

        });


    const weekAverage =
        weekHistory.length
            ? Math.round(
                weekHistory.reduce(
                    function(sum, item) {

                        return (
                            sum +
                            Number(
                                item.rating || 0
                            )
                        );

                    },
                    0
                ) /
                weekHistory.length *
                20
            )
            : 0;


    weekCount.textContent =
        weekAverage + "%";


    weekText.textContent =
        weekHistory.length
            ? weekHistory.length +
              " maalmood ayaa la qiimeeyay isbuucan"

            : "Weli qiimeyn isbuucan lama kaydin";


    const monthKey =
        now.toISOString()
            .slice(0, 7);


    const monthHistory =
        history.filter(function(item) {

            return (
                item.date?.slice(0, 7) ===
                monthKey
            );

        });


    const monthAverage =
        monthHistory.length
            ? Math.round(
                monthHistory.reduce(
                    function(sum, item) {

                        return (
                            sum +
                            Number(
                                item.rating || 0
                            )
                        );

                    },
                    0
                ) /
                monthHistory.length *
                20
            )
            : 0;


    monthPercent.textContent =
        monthAverage + "%";


    monthText.textContent =
        monthHistory.length
            ? monthHistory.length +
              " maalmood ayaa la qiimeeyay bishan"

            : "Weli qiimeyn bishan lama kaydin";

}


function setupOverview() {

    const hero =
        document.querySelector(
            ".hero"
        );


    if (
        !hero ||
        document.getElementById(
            "dashboardOverview"
        )
    ) {
        return;
    }


    const overview =
        document.createElement(
            "section"
        );


    overview.id =
        "dashboardOverview";


    overview.className =
        "dashboard-overview";


    overview.innerHTML = `

        <div class="overview-card">

            <div class="overview-icon">
                📅
            </div>

            <div class="overview-content">

                <span class="overview-label">
                    Shaqada Maanta
                </span>

                <strong id="overviewTodayCount">
                    0 / 0
                </strong>

                <small id="overviewTodayText">
                    Hawlo la qorsheeyay
                </small>

            </div>

        </div>


        <div class="overview-card">

            <div class="overview-icon">
                🗓️
            </div>

            <div class="overview-content">

                <span class="overview-label">
                    Qiimeynta Isbuuca
                </span>

                <strong id="overviewWeekCount">
                    0%
                </strong>

                <small id="overviewWeekText">
                    Weli lama qiimeyn
                </small>

            </div>

        </div>


        <div class="overview-card">

            <div class="overview-icon">
                📊
            </div>

            <div class="overview-content">

                <span class="overview-label">
                    Qiimeynta Bisha
                </span>

                <strong id="overviewMonthPercent">
                    0%
                </strong>

                <small id="overviewMonthText">
                    Weli lama qiimeyn
                </small>

            </div>

        </div>

    `;


    hero.insertAdjacentElement(
        "afterend",
        overview
    );


    updateOverview();

}


/* ================================
   DARK / LIGHT MODE
================================ */

function theme() {

    const button =
        document.getElementById(
            "themeToggle"
        );


    if (!button) {
        return;
    }


    function applyTheme(selectedTheme) {

        const light =
            selectedTheme === "light";


        document.body.classList.toggle(
            "light-mode",
            light
        );


        button.textContent =
            light
                ? "🌙"
                : "☀️";


        button.title =
            light
                ? "Dark Mode"
                : "Light Mode";


        localStorage.setItem(
            KEYS.theme,
            selectedTheme
        );

    }


    applyTheme(
        localStorage.getItem(
            KEYS.theme
        ) || "dark"
    );


    button.onclick =
        function() {

            applyTheme(
                document.body.classList.contains(
                    "light-mode"
                )
                    ? "dark"
                    : "light"
            );

        };

}


/* ================================
   CHECKLISTS
================================ */

function keyFor(card) {

    return (
        card.querySelector(
            ".card-header span"
        )?.textContent ||
        "card"
    )
        .trim()
        .toLowerCase();

}


function setupChecklists() {

    document
        .querySelectorAll(".card")
        .forEach(function(card) {

            const list =
                card.querySelector(
                    ".check-list"
                );


            if (!list) {
                return;
            }


            const key =
                keyFor(card);


            const saved =
                read(
                    KEYS.check,
                    {}
                );


            if (
                Array.isArray(
                    saved[key]
                )
            ) {

                list.innerHTML = "";


                saved[key].forEach(
                    function(item) {

                        addCheckRow(
                            list,
                            item.text,
                            item.done
                        );

                    }
                );

            } else {

                Array
                    .from(list.children)
                    .forEach(function(li) {

                        const text =
                            li.textContent.trim();


                        const done =
                            li.classList.contains(
                                "done"
                            );


                        li.textContent = "";


                        addCheckControls(
                            li,
                            text,
                            done
                        );

                    });

            }

        });

}


function addCheckRow(
    list,
    text,
    done = false
) {

    const li =
        document.createElement(
            "li"
        );


    li.textContent = "";


    addCheckControls(
        li,
        text,
        done
    );


    list.appendChild(li);

}


function addCheckControls(
    li,
    text,
    done
) {

    li.classList.toggle(
        "done",
        done
    );


    const label =
        document.createElement(
            "span"
        );


    label.className =
        "check-item-text";


    label.textContent =
        text;


    const actions =
        document.createElement(
            "span"
        );


    actions.className =
        "row-actions";


    const edit =
        document.createElement(
            "button"
        );


    const del =
        document.createElement(
            "button"
        );


    edit.className =
        "row-edit";


    del.className =
        "row-delete";


    edit.type =
        "button";


    del.type =
        "button";


    edit.textContent =
        "✎";


    del.textContent =
        "×";


    actions.append(
        edit,
        del
    );


    li.append(
        label,
        actions
    );


    function save() {

        const card =
            li.closest(".card");


        const list =
            card.querySelector(
                ".check-list"
            );


        const data =
            read(
                KEYS.check,
                {}
            );


        data[keyFor(card)] =
            Array
                .from(list.children)
                .map(function(item) {

                    return {
                        text:
                            item.querySelector(
                                ".check-item-text"
                            )?.textContent || "",

                        done:
                            item.classList.contains(
                                "done"
                            )
                    };

                });


        write(
            KEYS.check,
            data
        );

    }


    li.onclick =
        function(event) {

            if (
                event.target === edit ||
                event.target === del
            ) {
                return;
            }


            li.classList.toggle(
                "done"
            );


            save();

        };


    edit.onclick =
        function() {

            const newText =
                prompt(
                    "Wax ka beddel:",
                    label.textContent
                );


            if (
                newText?.trim()
            ) {

                label.textContent =
                    newText.trim();

                save();

            }

        };


    del.onclick =
        function() {

            if (
                confirm(
                    "Ma tirtirtaa qodobkan?"
                )
            ) {

                li.remove();

                save();

            }

        };

}


/* ================================
   ADD BUTTONS
================================ */

function setupAddButtons() {

    document
        .querySelectorAll(".add-task")
        .forEach(function(button) {

            button.onclick =
                function() {

                    const card =
                        button.closest(
                            ".card"
                        );


                    if (
                        card?.querySelector(
                            "#taskInput"
                        )
                    ) {

                        addTask();

                        return;

                    }


                    const list =
                        card?.querySelector(
                            ".check-list"
                        );


                    if (list) {

                        const value =
                            prompt(
                                "Qor qodobka cusub:"
                            );


                        if (
                            value?.trim()
                        ) {

                            addCheckRow(
                                list,
                                value.trim()
                            );


                            const data =
                                read(
                                    KEYS.check,
                                    {}
                                );


                            data[keyFor(card)] =
                                Array
                                    .from(
                                        list.children
                                    )
                                    .map(function(item) {

                                        return {
                                            text:
                                                item.querySelector(
                                                    ".check-item-text"
                                                )?.textContent || "",

                                            done:
                                                item.classList.contains(
                                                    "done"
                                                )
                                        };

                                    });


                            write(
                                KEYS.check,
                                data
                            );

                        }

                    }

                };

        });


    document
        .querySelectorAll(".add-btn")
        .forEach(function(button) {

            button.onclick =
                function() {

                    const card =
                        button.closest(
                            ".card"
                        );


                    if (!card) {
                        return;
                    }


                    const list =
                        card.querySelector(
                            ".check-list"
                        );


                    if (list) {

                        const value =
                            prompt(
                                "Qor qodobka cusub:"
                            );


                        if (
                            value?.trim()
                        ) {

                            addCheckRow(
                                list,
                                value.trim()
                            );


                            const data =
                                read(
                                    KEYS.check,
                                    {}
                                );


                            data[keyFor(card)] =
                                Array
                                    .from(
                                        list.children
                                    )
                                    .map(function(item) {

                                        return {
                                            text:
                                                item.querySelector(
                                                    ".check-item-text"
                                                )?.textContent || "",

                                            done:
                                                item.classList.contains(
                                                    "done"
                                                )
                                        };

                                    });


                            write(
                                KEYS.check,
                                data
                            );

                        }

                        return;

                    }


                    const study =
                        card.querySelector(
                            ".study-list"
                        );


                    if (study) {

                        const subject =
                            prompt(
                                "Maaddada:"
                            );


                        if (
                            !subject?.trim()
                        ) {
                            return;
                        }


                        const time =
                            prompt(
                                "Waqtiga:"
                            );


                        if (
                            !time?.trim()
                        ) {
                            return;
                        }


                        addStudy(
                            study,
                            subject.trim(),
                            time.trim()
                        );


                        return;

                    }


                    const week =
                        card.querySelector(
                            ".week-row"
                        );


                    if (week) {

                        const day =
                            prompt(
                                "Maalinta:"
                            );


                        if (
                            !day?.trim()
                        ) {
                            return;
                        }


                        const plan =
                            prompt(
                                "Qorshaha:"
                            );


                        if (
                            !plan?.trim()
                        ) {
                            return;
                        }


                        addWeek(
                            card,
                            day.trim(),
                            plan.trim()
                        );


                        return;

                    }


                    if (
                        card.querySelector(
                            ".calendar"
                        )
                    ) {

                        addEvent();

                        return;

                    }


                    card
                        .querySelector("input")
                        ?.focus();

                };

        });

}


/* ================================
   STUDY SCHEDULE
================================ */

function addStudy(
    list,
    subject,
    time
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "study-item";


    item.innerHTML = `
        <span></span>

        <strong></strong>

        <span class="row-actions">

            <button
                class="row-edit"
                type="button"
            >
                ✎
            </button>

            <button
                class="row-delete"
                type="button"
            >
                ×
            </button>

        </span>
    `;


    item.children[0].textContent =
        subject;


    item.children[1].textContent =
        time;


    list.appendChild(item);


    item.querySelector(
        ".row-edit"
    ).onclick =
        function() {

            const newSubject =
                prompt(
                    "Maaddada:",
                    item.children[0].textContent
                );


            const newTime =
                prompt(
                    "Waqtiga:",
                    item.children[1].textContent
                );


            if (
                newSubject?.trim()
            ) {

                item.children[0].textContent =
                    newSubject.trim();

            }


            if (
                newTime?.trim()
            ) {

                item.children[1].textContent =
                    newTime.trim();

            }


            saveSchedule(
                item.closest(".card")
            );

        };


    item.querySelector(
        ".row-delete"
    ).onclick =
        function() {

            if (
                confirm(
                    "Ma tirtirtaa?"
                )
            ) {

                item.remove();

                saveSchedule(
                    item.closest(".card")
                );

            }

        };


    saveSchedule(
        list.closest(".card")
    );

}


/* ================================
   WEEK SCHEDULE
================================ */

function addWeek(
    card,
    day,
    plan
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "week-row";


    row.innerHTML = `
        <span class="day"></span>

        <span class="schedule-text"></span>

        <span class="row-actions">

            <button
                class="row-edit"
                type="button"
            >
                ✎
            </button>

            <button
                class="row-delete"
                type="button"
            >
                ×
            </button>

        </span>
    `;


    row.children[0].textContent =
        day;


    row.children[1].textContent =
        plan;


    card
        .querySelector(".card-body")
        .appendChild(row);


    bindWeek(
        row,
        card
    );


    saveSchedule(card);

}


function bindWeek(
    row,
    card
) {

    row.querySelector(
        ".row-edit"
    ).onclick =
        function() {

            const day =
                prompt(
                    "Maalinta:",
                    row
                        .querySelector(".day")
                        .textContent
                );


            const plan =
                prompt(
                    "Qorshaha:",
                    row
                        .querySelector(
                            ".schedule-text"
                        )
                        .textContent
                );


            if (
                day?.trim()
            ) {

                row
                    .querySelector(".day")
                    .textContent =
                    day.trim();

            }


            if (
                plan?.trim()
            ) {

                row
                    .querySelector(
                        ".schedule-text"
                    )
                    .textContent =
                    plan.trim();

            }


            saveSchedule(card);

        };


    row.querySelector(
        ".row-delete"
    ).onclick =
        function() {

            if (
                confirm(
                    "Ma tirtirtaa?"
                )
            ) {

                row.remove();

                saveSchedule(card);

            }

        };

}


function saveSchedule(card) {

    const data =
        read(
            KEYS.schedule,
            {}
        );


    const key =
        keyFor(card);


    if (
        card.querySelector(
            ".week-row"
        )
    ) {

        data[key] =
            Array
                .from(
                    card.querySelectorAll(
                        ".week-row"
                    )
                )
                .map(function(row) {

                    return {
                        day:
                            row.querySelector(
                                ".day"
                            )?.textContent || "",

                        plan:
                            row.querySelector(
                                ".schedule-text"
                            )?.textContent || ""
                    };

                });

    } else if (
        card.querySelector(
            ".study-list"
        )
    ) {

        data[key] =
            Array
                .from(
                    card.querySelectorAll(
                        ".study-item"
                    )
                )
                .map(function(item) {

                    return {
                        subject:
                            item.children[0]
                                ?.textContent || "",

                        time:
                            item.children[1]
                                ?.textContent || ""
                    };

                });

    }


    write(
        KEYS.schedule,
        data
    );

}


function setupSchedules() {

    document
        .querySelectorAll(".card")
        .forEach(function(card) {

            const data =
                read(
                    KEYS.schedule,
                    {}
                );


            const key =
                keyFor(card);


            const saved =
                data[key];


            if (
                card.querySelector(
                    ".week-row"
                )
            ) {

                if (
                    Array.isArray(saved)
                ) {

                    const body =
                        card.querySelector(
                            ".card-body"
                        );


                    body
                        .querySelectorAll(
                            ".week-row"
                        )
                        .forEach(function(row) {

                            row.remove();

                        });


                    saved.forEach(
                        function(item) {

                            addWeek(
                                card,
                                item.day,
                                item.plan
                            );

                        }
                    );

                } else {

                    card
                        .querySelectorAll(
                            ".week-row"
                        )
                        .forEach(function(row) {

                            bindWeek(
                                row,
                                card
                            );

                        });

                }

            } else {

                const list =
                    card.querySelector(
                        ".study-list"
                    );


                if (!list) {
                    return;
                }


                if (
                    Array.isArray(saved)
                ) {

                    list.innerHTML = "";


                    saved.forEach(
                        function(item) {

                            addStudy(
                                list,
                                item.subject,
                                item.time
                            );

                        }
                    );

                } else {

                    list
                        .querySelectorAll(
                            ".study-item"
                        )
                        .forEach(function(item) {

                            const actions =
                                document.createElement(
                                    "span"
                                );


                            actions.className =
                                "row-actions";


                            actions.innerHTML = `
                                <button
                                    class="row-edit"
                                    type="button"
                                >
                                    ✎
                                </button>

                                <button
                                    class="row-delete"
                                    type="button"
                                >
                                    ×
                                </button>
                            `;


                            item.appendChild(
                                actions
                            );


                            actions.querySelector(
                                ".row-edit"
                            ).onclick =
                                function() {

                                    const subject =
                                        prompt(
                                            "Maaddada:",
                                            item.children[0]
                                                .textContent
                                        );


                                    const time =
                                        prompt(
                                            "Waqtiga:",
                                            item.children[1]
                                                .textContent
                                        );


                                    if (
                                        subject?.trim()
                                    ) {

                                        item.children[0]
                                            .textContent =
                                            subject.trim();

                                    }


                                    if (
                                        time?.trim()
                                    ) {

                                        item.children[1]
                                            .textContent =
                                            time.trim();

                                    }


                                    saveSchedule(
                                        item.closest(
                                            ".card"
                                        )
                                    );

                                };


                            actions.querySelector(
                                ".row-delete"
                            ).onclick =
                                function() {

                                    if (
                                        confirm(
                                            "Ma tirtirtaa?"
                                        )
                                    ) {

                                        item.remove();

                                        saveSchedule(
                                            item.closest(
                                                ".card"
                                            )
                                        );

                                    }

                                };

                        });

                }

            }

        });

}


/* ================================
   NOTES
================================ */

function setupNotes() {

    document
        .querySelectorAll(".card")
        .forEach(function(card) {

            const area =
                card.querySelector(
                    ".note-input"
                );


            const saveButton =
                card.querySelector(
                    ".save-btn"
                );


            if (
                !area ||
                !saveButton
            ) {
                return;
            }


            const key =
                keyFor(card);


            const data =
                read(
                    KEYS.notes,
                    {}
                );


            area.value =
                data[key] || "";


            saveButton.onclick =
                function() {

                    const saved =
                        read(
                            KEYS.notes,
                            {}
                        );


                    saved[key] =
                        area.value.trim();


                    write(
                        KEYS.notes,
                        saved
                    );


                    alert(
                        "Xogta waa la kaydiyay."
                    );

                };


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "save-btn note-delete";


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "Tirtir";


            saveButton.after(
                deleteButton
            );


            deleteButton.onclick =
                function() {

                    const saved =
                        read(
                            KEYS.notes,
                            {}
                        );


                    delete saved[key];


                    write(
                        KEYS.notes,
                        saved
                    );


                    area.value = "";

                };

        });

}


/* ================================
   SIDEBAR NAVIGATION
================================ */

function findCard(text) {

    const map = [
        ["maalinle", "jadwal maalinle"],
        ["isbuucle", "jadwal isbuucle"],
        ["bile", "jadwal bile"],
        ["diin", "qayb diin"],
        ["dhaqaale", "qayb dhaqaale"],
        ["isbaro", "waxyaabaha isbaro"],
        ["qaladaad", "qaladaadkeyga"],
        ["sheekeysiga", "alla & sheekeysiga"],
        ["waxbarasho", "jadwalka waxbarasho"]
    ];


    const value =
        text.toLowerCase();


    for (
        const pair of map
    ) {

        if (
            value.includes(
                pair[0]
            )
        ) {

            return [
                ...document.querySelectorAll(
                    ".dashboard-grid .card"
                )
            ].find(function(card) {

                return card.textContent
                    .toLowerCase()
                    .includes(
                        pair[1]
                    );

            });

        }

    }


    return null;

}


function dashboard() {

    const grid =
        document.querySelector(
            ".dashboard-grid"
        );


    if (!grid) {
        return;
    }


    document
        .querySelector(".hero")
        .style.display = "";


    document
        .getElementById(
            "noloshaadaSettingsPage"
        )
        ?.remove();


    grid
        .querySelectorAll(".column")
        .forEach(function(column) {

            column.style.display =
                "flex";


            column
                .querySelectorAll(".card")
                .forEach(function(card) {

                    card.style.display =
                        "";

                });

        });


    grid.style.gridTemplateColumns =
        "";


    grid.style.justifyContent =
        "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function page(card) {

    const grid =
        document.querySelector(
            ".dashboard-grid"
        );


    if (
        !grid ||
        !card
    ) {
        return;
    }


    document
        .querySelector(".hero")
        .style.display =
        "none";


    document
        .getElementById(
            "noloshaadaSettingsPage"
        )
        ?.remove();


    grid
        .querySelectorAll(".column")
        .forEach(function(column) {

            column.style.display =
                "none";


            column
                .querySelectorAll(".card")
                .forEach(function(item) {

                    item.style.display =
                        "none";

                });

        });


    const column =
        card.closest(
            ".column"
        );


    if (column) {

        column.style.display =
            "flex";

    }


    card.style.display =
        "";


    grid.style.gridTemplateColumns =
        "minmax(0, 900px)";


    grid.style.justifyContent =
        "center";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ================================
   SETTINGS
================================ */

function settings() {

    const grid =
        document.querySelector(
            ".dashboard-grid"
        );


    if (!grid) {
        return;
    }


    document
        .querySelector(".hero")
        .style.display =
        "none";


    grid
        .querySelectorAll(".column")
        .forEach(function(column) {

            column.style.display =
                "none";

        });


    document
        .getElementById(
            "noloshaadaSettingsPage"
        )
        ?.remove();


    const settingsPage =
        document.createElement(
            "div"
        );


    settingsPage.id =
        "noloshaadaSettingsPage";


    settingsPage.className =
        "card";


    settingsPage.innerHTML = `

        <div class="card-header">

            <h3>
                Settings
            </h3>

        </div>


        <div style="padding:20px">

            <p style="margin-bottom:15px">
                Halkan waxaad ka maamuli kartaa
                theme-ka, notifications-ka
                iyo xogta tasks-ka.
            </p>


            <button
                id="notifyBtn"
                class="save-btn"
                type="button"
            >
                Daar Notifications
            </button>


            <button
                id="resetBtn"
                class="save-btn"
                type="button"
                style="margin-left:10px"
            >
                Dib u Bilow Tasks
            </button>


            <button
                id="lightBtn"
                class="save-btn"
                type="button"
                style="margin-left:10px"
            >
                Dark / Light
            </button>

        </div>

    `;


    grid.appendChild(
        settingsPage
    );


    grid.style.gridTemplateColumns =
        "minmax(0, 900px)";


    grid.style.justifyContent =
        "center";


    settingsPage
        .querySelector(
            "#notifyBtn"
        )
        .onclick =
        function() {

            if (
                "Notification" in window
            ) {

                Notification
                    .requestPermission()
                    .then(function(permission) {

                        alert(
                            permission === "granted"
                                ? "Notifications waa la daaray."
                                : "Notifications lama oggolaan."
                        );

                    });

            } else {

                alert(
                    "Browser-kan ma taageerayo Notifications."
                );

            }

        };


    settingsPage
        .querySelector(
            "#resetBtn"
        )
        .onclick =
        function() {

            if (
                confirm(
                    "Ma hubtaa inaad tirtirayso tasks-ka kaydsan?"
                )
            ) {

                localStorage.removeItem(
                    KEYS.tasks
                );


                tasks =
                    JSON.parse(
                        JSON.stringify(
                            defaultTasks
                        )
                    );


                renderTasks();


                alert(
                    "Tasks-ka dib ayaa loo bilaabay."
                );

            }

        };


    settingsPage
        .querySelector(
            "#lightBtn"
        )
        .onclick =
        function() {

            document
                .getElementById(
                    "themeToggle"
                )
                ?.click();

        };


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function setupSidebar() {

    document
        .querySelectorAll(
            ".menu button"
        )
        .forEach(function(button) {

            button.onclick =
                function() {

                    document
                        .querySelectorAll(
                            ".menu button"
                        )
                        .forEach(function(item) {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    const text =
                        button.textContent
                            .trim()
                            .toLowerCase();


                    if (
                        text.includes(
                            "dashboard"
                        )
                    ) {

                        dashboard();

                    } else if (
                        text.includes(
                            "settings"
                        )
                    ) {

                        settings();

                    } else {

                        const card =
                            findCard(text);


                        if (card) {

                            page(card);

                        }

                    }

                };

        });

}


/* ================================
   HERO BUTTONS
================================ */

function setupHero() {

    document
        .querySelectorAll(
            ".hero-btn"
        )
        .forEach(function(button) {

            button.onclick =
                function() {

                    const text =
                        button.textContent
                            .toLowerCase();


                    if (
                        text.includes(
                            "diin"
                        )
                    ) {

                        page(
                            findCard("diin")
                        );

                    } else if (
                        text.includes(
                            "dhaqaale"
                        )
                    ) {

                        page(
                            findCard("dhaqaale")
                        );

                    } else if (
                        text.includes(
                            "waxbarasho"
                        )
                    ) {

                        page(
                            findCard("waxbarasho")
                        );

                    } else {

                        dashboard();

                    }

                };

        });

}


/* ================================
   SEARCH
================================ */

function setupSearch() {

    const search =
        document.querySelector(
            ".search"
        );


    if (!search) {
        return;
    }


    search.oninput =
        function() {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".card, .hero, .dashboard-overview"
                )
                .forEach(function(element) {

                    if (!query) {

                        element.style.display =
                            "";

                        return;

                    }


                    element.style.display =
                        element.textContent
                            .toLowerCase()
                            .includes(query)
                            ? ""
                            : "none";

                });

        };

}


/* ================================
   CALENDAR
================================ */

function calendarEvents() {

    return read(
        KEYS.events,
        {}
    );

}


function renderCalendars() {

    document
        .querySelectorAll(".calendar")
        .forEach(function(calendar) {

            const header =
                calendar.previousElementSibling;


            if (!header) {
                return;
            }


            const title =
                header.querySelector(
                    "strong"
                );


            const arrows =
                header.querySelectorAll(
                    "span"
                );


            if (
                arrows.length >= 2
            ) {

                arrows[0].onclick =
                    function() {

                        calendarDate.setMonth(
                            calendarDate.getMonth() - 1
                        );

                        renderCalendars();

                    };


                arrows[1].onclick =
                    function() {

                        calendarDate.setMonth(
                            calendarDate.getMonth() + 1
                        );

                        renderCalendars();

                    };

            }


            const year =
                calendarDate.getFullYear();


            const month =
                calendarDate.getMonth();


            const days = [
                "In",
                "T",
                "Ar",
                "Kh",
                "Jim",
                "Sab",
                "Ax"
            ];


            calendar.innerHTML = "";


            days.forEach(
                function(day) {

                    const element =
                        document.createElement(
                            "div"
                        );


                    element.textContent =
                        day;


                    calendar.appendChild(
                        element
                    );

                }
            );


            const firstDay =
                new Date(
                    year,
                    month,
                    1
                ).getDay();


            for (
                let i = 0;
                i < firstDay;
                i++
            ) {

                calendar.appendChild(
                    document.createElement(
                        "div"
                    )
                );

            }


            const events =
                calendarEvents();


            const totalDays =
                new Date(
                    year,
                    month + 1,
                    0
                ).getDate();


            for (
                let day = 1;
                day <= totalDays;
                day++
            ) {

                const element =
                    document.createElement(
                        "div"
                    );


                const dateKey =
                    year +
                    "-" +
                    String(
                        month + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(day).padStart(
                        2,
                        "0"
                    );


                element.textContent =
                    day;


                if (
                    dateKey ===
                    todayKey()
                ) {

                    element.classList.add(
                        "today"
                    );

                }


                if (
                    events[dateKey]?.length
                ) {

                    element.classList.add(
                        "has-event"
                    );


                    element.title =
                        events[dateKey].join(
                            "\n"
                        );

                }


                element.onclick =
                    function() {

                        calendarEvent(
                            dateKey
                        );

                    };


                calendar.appendChild(
                    element
                );

            }


            if (title) {

                const months = [
                    "Janaayo",
                    "Febraayo",
                    "Maarso",
                    "Abriil",
                    "Maajo",
                    "Juun",
                    "Luulyo",
                    "Agoosto",
                    "Sebtembar",
                    "Oktoobar",
                    "Nofeembar",
                    "Diseembar"
                ];


                title.textContent =
                    months[month] +
                    " " +
                    year;

            }

        });

}


function calendarEvent(dateKey) {

    const events =
        calendarEvents();


    const old =
        (events[dateKey] || [])
            .join(", ");


    const value =
        prompt(
            "Qor dhacdada taariikhdan:",
            old
        );


    if (
        value === null
    ) {
        return;
    }


    if (
        !value.trim()
    ) {

        delete events[dateKey];

    } else {

        events[dateKey] =
            value
                .split(",")
                .map(function(item) {

                    return item.trim();

                })
                .filter(Boolean);

    }


    write(
        KEYS.events,
        events
    );


    renderCalendars();

}


function addEvent() {

    const date =
        prompt(
            "Geli taariikhda (YYYY-MM-DD):",
            todayKey()
        );


    if (!date) {
        return;
    }


    calendarEvent(date);

}


/* ================================
   CLOCK
================================ */

function clock() {

    const now =
        new Date();


    let hours =
        now.getHours() % 12;


    if (
        hours === 0
    ) {

        hours = 12;

    }


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const period =
        now.getHours() >= 12
            ? "PM"
            : "AM";


    const clockElement =
        document.getElementById(
            "clock"
        );


    const dateElement =
        document.getElementById(
            "date"
        );


    if (clockElement) {

        clockElement.textContent =
            hours +
            ":" +
            minutes +
            " " +
            period;

    }


    if (dateElement) {

        const days = [
            "Axad",
            "Isniin",
            "Talaado",
            "Arbaco",
            "Khamiis",
            "Jimco",
            "Sabti"
        ];


        const months = [
            "Janaayo",
            "Febraayo",
            "Maarso",
            "Abriil",
            "Maajo",
            "Juun",
            "Luulyo",
            "Agoosto",
            "Sebtembar",
            "Oktoobar",
            "Nofeembar",
            "Diseembar"
        ];


        dateElement.textContent =
            days[now.getDay()] +
            ", " +
            now.getDate() +
            " " +
            months[now.getMonth()] +
            " " +
            now.getFullYear();

    }

}


/* ================================
   START
================================ */

function init() {

    setupOverview();

    renderTasks();

    setupEvaluation();

    theme();

    setupSidebar();

    setupHero();

    setupSearch();

    setupChecklists();

    setupNotes();

    setupAddButtons();

    setupSchedules();

    renderCalendars();

    clock();


    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (taskInput) {

        taskInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    addTask();

                }

            }
        );

    }


    const addTaskButton =
        document.querySelector(
            ".add-task"
        );


    if (addTaskButton) {

        addTaskButton.addEventListener(
            "click",
            addTask
        );

    }


    setInterval(
        clock,
        1000
    );

}


init();