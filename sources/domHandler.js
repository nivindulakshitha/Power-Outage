import funcs from "./fileHandler.js";

document.addEventListener('DOMContentLoaded', () => {
    let interval = setInterval(() => {
        if (document.querySelector("#loading-panel").classList.contains("d-none") && preLoading) {
            clearInterval(interval);
            areas = funcs.fetchAreas();
            settings = funcs.fetchSettings();
            allSchedules = funcs.fetchTimes();

            Object.keys(areas).forEach(ele => {
                if (Object.keys(allSchedules).includes(ele.toUpperCase())) {
                    areas[ele].forEach(value => {
                        let checked = false;
                        if (value == settings.area) {
                            checked = true;
                        }
                        document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(5) > table > tbody").appendChild(createAreasTable(ele, value, checked));

                    });
                }
            });
            document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(1) > label > input[type=checkbox]").checked = settings.notifications;
        }
    }, 500)
})

const areaChangeEvent = async (element) => {
    element.select = true;
    const group = element.id.split("||")[0];
    const area = element.id.split("||")[1];
    document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(3) > span:nth-child(2)").innerText = area;
    document.querySelector("#headder > span:nth-child(2)").innerText = area; root.style.setProperty('--active', getComputedStyle(root).getPropertyValue('--' + group));
    document.querySelector("#headder > div:nth-child(3)").setAttribute('value', group);
    document.querySelector("#headder > div:nth-child(3)").innerText = group; document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(2) > div:nth-child(2)").setAttribute('value', group);
    document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(2) > div:nth-child(2)").innerText = group;
    if (setUpSettings(group)) {
        setUiChanges();
        startCounting();
        fadeOutEffect(document.getElementById("loading-panel"));
    } else {
        document.getElementById("loading-panel").classList.add('finished', 'd-flex');
        document.getElementById("loading-panel").classList.remove('d-none');
        document.getElementById("loading-panel").style.opacity = 1;
        document.querySelector("#loading-panel > div.section").innerText = "Something went wrong, try reopenening the application.";
        preLoading = false;
    }
    settings.group = group;
    settings.area = area;
    funcs.writeSettings();
}

const createAreasTable = (group, area, checked) => {
    var tr = document.createElement('tr');
    var td_1 = document.createElement('td');
    tr.appendChild(td_1);

    var div_1 = document.createElement('div');
    div_1.classList.add('form-check')
    td_1.appendChild(div_1)

    var input = document.createElement('input');
    input.classList.add('form-check-input')
    input.setAttribute('type', 'radio')
    input.setAttribute('name', 'areaSelect')
    input.id = group + "||" + area;
    input.addEventListener('click', () => { areaChangeEvent(input) })
    if (checked) {
        input.click()
    }
    div_1.appendChild(input);

    var td_2 = document.createElement('td');
    td_2.innerText = area;
    tr.appendChild(td_2);

    var td_3 = document.createElement('td');
    tr.appendChild(td_3);

    var div_2 = document.createElement('div');
    div_2.setAttribute('label', 'group-code');
    div_2.setAttribute('value', group)
    div_2.innerText = group;
    td_3.appendChild(div_2)

    return tr
}

const setUpSettings = (group) => {
    let timesArray = allSchedules[group];
    let activeRange = {};
    if (timesArray !== undefined) {
        timesArray.forEach((time, index) => {
            activeRange[index] = makeDateTime(timeFomatter(time))
        })
        let wellArrangedRanges = {}
        const objectLength = Object.keys(activeRange).length;
        for (let index = 0; index < objectLength; index++) {
            if (Object.keys(activeRange).length != 1) {
                let least = getLeastEvent(activeRange);
                wellArrangedRanges[index] = activeRange[least[0]];
                delete activeRange[least[0]];
            } else {
                wellArrangedRanges[objectLength - 1] = activeRange[Object.keys(activeRange)[0]];
            }
        }
        todaySchedule = wellArrangedRanges;
        return true
    } else {
        if (document.getElementsByName("areaSelect").length > 10) {
            areaChangeEvent(document.getElementsByName("areaSelect")[Number.parseInt(Math.random(10) * 10)])
        }
        return false
    }
}

function getLeastEvent(activeRange) {
    let max, maxValue = undefined;
    Object.keys(activeRange).forEach((range, index) => {
        if (max === undefined) {
            max = Object.keys(activeRange)[index];
            maxValue = activeRange[range].start
        } else {
            if (new Date(maxValue) > new Date(activeRange[range].start)) {
                max = Object.keys(activeRange)[index];
                maxValue = activeRange[range].start
            }
        }
    })
    return [max, maxValue]
}

async function setUiChanges() {
    document.querySelector("#footer > table > tbody").innerHTML = "";
    Object.keys(todaySchedule).forEach(index => {
        document.querySelector("#footer > table > tbody").appendChild(createScheduleTable(index));
    })
}

const createScheduleTable = (index) => {
    const start = new Date(todaySchedule[index].start);
    const end = new Date(todaySchedule[index].end);

    let tr = document.createElement('tr');
    tr.id = index;

    let th = document.createElement('th');
    th.setAttribute('scope', 'row');
    th.innerText = ('0' + (Number.parseInt(index) + 1)).slice(-2);

    let td_1 = document.createElement('td');
    td_1.innerText = start.toLocaleTimeString('it-IT');

    let td_2 = document.createElement('td');
    td_2.innerText = end.toLocaleTimeString('it-IT');

    let td_3 = document.createElement('td');
    td_3.innerText = new Date((end - start) / 1000 * 1000).toISOString().substr(11, 8);

    let td_4 = document.createElement('td');
    let span = document.createElement('span');

    if (end <= new Date()) {
        span.classList.add('badge', 'bg-secondary');
        span.innerText = "ENDED";
    } else if (end >= new Date()) {
        if (start <= new Date()) {
            span.classList.add('badge', 'bg-danger');
            span.innerText = "ACTIVE";
        } else {
            span.classList.add('badge', 'bg-warning');
            span.innerText = "PENDING";
        }
    }
    td_4.appendChild(span);

    tr.appendChild(th);
    tr.appendChild(td_1);
    tr.appendChild(td_2);
    tr.appendChild(td_3);
    tr.appendChild(td_4);

    return tr
}

async function startCounting() {
    let activeId = undefined;
    let activeState = undefined;
    const counter = setInterval(async () => {
        await setUiChanges();
        const schedules = Object.keys(todaySchedule);
        for (var schedule = 0; schedule < schedules.length; schedule++) {
            if (todaySchedule[schedule].end <= new Date()) {
                activeId = undefined;
                activeState = undefined;
            } else if (todaySchedule[schedule].end >= new Date()) {
                if (todaySchedule[schedule].start <= new Date()) {
                    activeId = schedule;
                    activeState = 'active';
                    break
                } else {
                    activeId = schedule;
                    activeState = 'pending';
                    break
                }
            }
        }
        if (activeId !== undefined) {
            let different = undefined;
            let percentage = undefined;
            if (activeState == 'active') {
                different = getTimeDifferent(new Date(), todaySchedule[schedule].end);
                let totalDifferent = rollBack(getTimeDifferent(todaySchedule[schedule].start, todaySchedule[schedule].end));
                let calc = totalDifferent - (totalDifferent - rollBack(different))
                percentage = 100 - (calc / totalDifferent) * 100
                document.querySelector("#time-circle").style.background = `conic-gradient(var(--active) ${360 - (360 / 100) * percentage}deg, #ededed 0deg)`

                if (different == "00:15:05") {
                    notify("The power cut ends in about 15 minutes")
                } else if (different == "00:05:00") {
                    notify("Power is about to restore in 05 minutes")
                } else if (different == "00:00:00") {
                    if (todaySchedule[activeId + 1] !== undefined) {
                        notify(`Your area might be released from power cuts since now. The next scheduled power cut will occur at around ${new Date(todaySchedule[0].start).toLocaleTimeString()}`)
                    } else {
                        let event = new Date(todaySchedule[0].start)
                        event.setDate(event.getDate() + 1)
                        notify(`Your area might be released from power cuts since now. The next scheduled power cut will occur on ${new Date(event).toLocaleDateString('fr')} at about ${new Date(event).toLocaleTimeString()}`)
                    }
                }

                document.querySelector("#time-circle > p > span.badge").classList.add('bg-danger');
                document.querySelector("#time-circle > p > span.badge").classList.remove('bg-warning');
                document.querySelector("#time-circle > p > span.badge").innerText = "ACTIVE";

            } else {
                different = getTimeDifferent(new Date(), todaySchedule[schedule].start);
                document.querySelector("#time-circle").style.background = `conic-gradient(var(--active) 0deg, #ededed 0deg)`;

                if (different == "00:15:00") {
                    notify("Power cut may occur in 15 minutes")
                } else if (different == "00:05:00") {
                    notify("Power is about to cut in 05 minutes")
                } else if (different == "00:00:00") {
                    notify(`You may be experiencing a power cut by now for ${getTimeDifferent(todaySchedule[schedule].start, todaySchedule[schedule].end)} hours`)
                }

                document.querySelector("#time-circle > p > span.badge").classList.add('bg-warning');
                document.querySelector("#time-circle > p > span.badge").classList.remove('bg-danger');
                document.querySelector("#time-circle > p > span.badge").innerText = "PENDING";
            }
            document.querySelector("#time-circle > p > span").innerText = different;
        } else {
            document.querySelector("#time-circle > p > span.badge").classList.remove('bg-warning', 'bg-danger');
            document.querySelector("#time-circle > p > span.badge").innerText = "";
        }
    }, 1000)
}

const getTimeDifferent = (start, end) => {
    const diff = Math.max(start, end) - Math.min(start, end);
    const SEC = 1000, MIN = 60 * SEC, HRS = 60 * MIN

    const hrs = Math.floor(diff / HRS).toLocaleString('en-US', { minimumIntegerDigits: 2 })
    const min = Math.floor((diff % HRS) / MIN).toLocaleString('en-US', { minimumIntegerDigits: 2 })
    const sec = Math.floor((diff % MIN) / SEC).toLocaleString('en-US', { minimumIntegerDigits: 2 })

    return `${hrs}:${min}:${sec}`
}

const rollBack = (string) => {
    const splited = string.split(':');
    const hrs = Number.parseInt(splited[0]) * 3600;
    const mins = Number.parseInt(splited[1]) * 60;
    const seconds = Number.parseInt(splited[2]);

    return seconds + mins + hrs

}

document.querySelector("#offcanvasRight > div.offcanvas-body > div:nth-child(1) > label > input[type=checkbox]").addEventListener('click', (e) => {
    settings.notifications = e.target.checked;
    funcs.writeSettings();
})