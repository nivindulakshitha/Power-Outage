var exec = require('child_process').execFile;
const fs = require('fs');


function fadeOutEffect(fadeTarget) {
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            fadeTarget.classList.add('d-none');
            clearInterval(fadeEffect);
        }
    }, 20);
}

const runExe = function () {
    if (navigator.onLine) {
        exec('webscrapper.exe', function (err, data) {
            if (err != null) {
                document.getElementById("loading-panel").classList.add('finished');
                document.querySelector("#loading-panel > div.section").innerText = "Something went wrong, try reinstalling the application.";
                preLoading = false;
                return false
            }
            if (preLoading) {
                fadeOutEffect(document.getElementById("loading-panel"));
            }
        });
    } else {
        document.getElementById("loading-panel").classList.add('finished');
        document.querySelector("#loading-panel > div.section").innerHTML = "For a more productive experience, keep your internet connection turned on next time." + "<br><br>" + `<a href='#' onclick=location.reload()>Retry</a> <a href='#' onclick="if (preLoading === true) fadeOutEffect(document.getElementById('loading-panel'))" style='padding-left: 10px;'>Continue</a>`;
        return false
    }
}

document.addEventListener('DOMContentLoaded', () => {
    runExe();
});