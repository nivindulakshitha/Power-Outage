const fs = require('fs');

function fileExists(path) {
    try {
        if (fs.existsSync(path)) {
            return true
        } else {
            preLoading = false;
            document.getElementById("loading-panel").classList.add('d-flex');
            document.getElementById("loading-panel").classList.add('finished');
            document.querySelector("#loading-panel > div.section").innerText = "Something went wrong, try again reopening or re-installing the application.";
            return false
        }
    } catch (err) {
        preLoading = false;
        document.getElementById("loading-panel").classList.add('d-flex');
        document.getElementById("loading-panel").classList.add('finished');
        document.querySelector("#loading-panel > div.section").innerText = "Something went wrong, try again reopening or re-installing the application.";
        return false
    }
}

function fetchData(path) {
    return fs.readFileSync(path, 'utf8')
}

function writeData(path, data) {
    fs.writeFileSync(path, data)
}

const fetchAreas = () => {
    if (fileExists('./configs.json')) {
        let data = JSON.parse(fetchData('./configs.json'))
        return data.AREAS
    } else {
        return false
    }
}

const fetchSettings = () => {
    if (fileExists('./configs.json')) {
        let data = JSON.parse(fetchData('./configs.json'))
        return data.CONFIGS
    } else {
        return false
    }
}

const writeSettings = () => {
    if (fileExists('./configs.json')) {
        let data = JSON.parse(fetchData('./configs.json'))
        data.CONFIGS.notifications = settings.notifications
        data.CONFIGS.group = settings.group
        data.CONFIGS.area = settings.area
        writeData('./configs.json', JSON.stringify(data))
        return true
    } else {
        return false
    }
}

const fetchTimes = () => {
    if (fileExists('./schedules.json')) {
        let data = JSON.parse(fetchData('./schedules.json'))
        return data
    } else {
        return false
    }
}

export default { fetchAreas, fetchSettings, fetchTimes, writeSettings }