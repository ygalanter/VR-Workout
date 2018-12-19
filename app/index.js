import document from "document";
import exercise from "exercise";
import { user } from "user-profile";
import { me } from "appbit";
import { vibration } from "haptics";

// Various screens
const svgSelect = document.getElementById("svgSelect");
const svgStart = document.getElementById("svgStart");
const svgEnd = document.getElementById("svgEnd");
const svgRun = document.getElementById("svgRun");
const svgConfirm = document.getElementById("svgConfirm");

// runnding data 
const txtCalories = svgRun.getElementById("txtCalories");
const txtHeartrate = svgRun.getElementById("txtHeartrate");
const txtZone = svgRun.getElementById("txtZone");
const txtActiveTime = svgRun.getElementById("txtActiveTime");

// final data
const txtTotalCalories = svgEnd.getElementById("txtTotalCalories");
const txtHeartRateAvg = svgEnd.getElementById("txtHeartRateAvg");
const txtHeartRateMax = svgEnd.getElementById("txtHeartRateMax");
const txtTotalTime = svgEnd.getElementById("txtTotalTime");

let interval;
let workoutName;

// selecting excersize type 
svgSelect.getElementById("my-list").getElementsByClassName("tile-list-item").forEach((element, index) => {
   
    let touchMe = element.getElementById("touch-me");

    if (touchMe) {

        touchMe.onclick = function() {
           
            svgStart.getElementById("img").href = `background/${index}.png`;
            svgEnd.getElementById("img").href = `background/${index}.png`;
            svgRun.getElementById("img").href = `background/${index}.png`;

            workoutName = this.parent.getElementById("text").text;

            svgSelect.style.display = "none";
            svgStart.style.display = "inline";
    
        }
    
    }


})


// changing excersize
svgStart.getElementById("btnChange").onclick = () =>{
    svgSelect.style.display = "inline";
    svgStart.style.display = "none";
}

// starting excersize
svgStart.getElementById("btnStart").onclick = () =>{
    exercise.start(workoutName, {gps: false});
    interval = setInterval(displayCurrentData, 1000);

    svgStart.style.display = "none"
    svgRun.style.display = "inline"
    
}

// Exiting app 
svgEnd.getElementById("btn").onclick = () =>{
    me.exit();
}

// Pause button is clicked
svgRun.getElementById("btnPauseResume").onclick = pauseResumeExercise;

// Stop button is clicked - bringing confirmation screen
svgRun.getElementById("btnStop").onclick = () => {
    if (exercise.state !== "paused") {
        pauseResumeExercise();
    }

    svgConfirm.style.display = "inline";
    vibration.start("confirmation");
}


// Confirmation popup: Resume button clicked
svgConfirm.getElementById("btnLeft").onclick = function(evt) {
    pauseResumeExercise();
    svgConfirm.style.display = "none";
}
  
// Confirmation popup: Resume stop clicked - show final screen
svgConfirm.getElementById("btnRight").onclick = function(evt) {

    txtTotalCalories.text =  `Total Calories:  ${formatCalories(exercise.stats.calories)}`;
    txtHeartRateAvg.text = `BPM Avg:  ${exercise.stats.heartRate.average}`;
    txtHeartRateMax.text = `BPM Peak:  ${exercise.stats.heartRate.max}`;
    txtTotalTime.text = `Total Time:  ${formatActiveTime(exercise.stats.activeTime)}`;

    svgEnd.style.display = "inline";
    svgRun.style.display = "none"

    vibration.start("confirmation-max");
    svgConfirm.style.display = "none";
}

// on app unloading stopping excersize
me.onunload = () =>{
    if (exercise.state !== "stopped") {
        exercise.stop();
    }
}

// Pauses or resumes excersize depending on state
function pauseResumeExercise(){

    if (exercise.state === "started") {
        svgRun.getElementById("btnPauseResume").getElementById("text").text = "Resume";
        exercise.pause();
        clearInterval(interval);
    } else {
        svgRun.getElementById("btnPauseResume").getElementById("text").text = "Pause";
        exercise.resume();
        interval = setInterval(displayCurrentData, 1000);
    }

    vibration.start("bump");
}




function formatCalories(calories) {
    return calories.toLocaleString();
};

function getZone(heartRate) {
    return user.heartRateZone(heartRate || 0);
};

function zeroPad(num) {
    if (num < 10) {
      num = "0" + num;
    }
    return num;
}

function formatActiveTime(activeTime) {
    let seconds = (activeTime / 1000).toFixed(0);
    let minutes = Math.floor(seconds / 60);
    let hours;
    if (minutes > 59) {
      hours = Math.floor(minutes / 60);
      hours = zeroPad(hours);
      minutes = minutes - hours * 60;
      minutes = zeroPad(minutes);
    }
    seconds = Math.floor(seconds % 60);
    seconds = zeroPad(seconds);
    if (hours) {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

// show running data
function displayCurrentData() {
    txtCalories.text =  `Calories:  ${formatCalories(exercise.stats.calories)}`;
    txtHeartrate.text = `Heart Rate:  ${exercise.stats.heartRate.current || 0} BPM`;
    txtZone.text = `Zone:  ${getZone(exercise.stats.heartRate.current)}`;
    txtActiveTime.text = `Active Time:  ${formatActiveTime(exercise.stats.activeTime)}`;
}




