import document from "document";
import exercise from "exercise";
import { user } from "user-profile";
import { me } from "appbit";
import { vibration } from "haptics";

document.onkeypress = function(e) {
    e.preventDefault();
}

// Various screens
const svgSelect = document.getElementById("svgSelect") as ContainerElement;
const svgStart = document.getElementById("svgStart") as ContainerElement;
const svgEnd = document.getElementById("svgEnd") as ContainerElement;
const svgRun = document.getElementById("svgRun") as ContainerElement;
const svgConfirm = document.getElementById("svgConfirm") as ContainerElement;

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
           
            (svgStart.getElementById("img") as ImageElement).href = `background/${index}.png`;
            (svgEnd.getElementById("img") as ImageElement).href = `background/${index}.png`;
            (svgRun.getElementById("img") as ImageElement).href = `background/${index}.png`;

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

    svgRun.style.display = "none";
    svgConfirm.style.display = "inline";
    vibration.start("nudge");
}


// Confirmation popup: Resume button clicked
svgConfirm.getElementById("btnLeft").onclick = function(evt) {
    pauseResumeExercise();
    svgRun.style.display = "inline";
    svgConfirm.style.display = "none";
}
  
// Confirmation popup: Resume stop clicked - show final screen
svgConfirm.getElementById("btnRight").onclick = function(evt) {

    txtTotalCalories.text =  formatCalories(exercise.stats.calories);
    txtHeartRateAvg.text = exercise.stats.heartRate.average.toString();
    txtHeartRateMax.text = exercise.stats.heartRate.max.toString();
    txtTotalTime.text = formatActiveTime(exercise.stats.activeTime);

    svgEnd.style.display = "inline";
    svgRun.style.display = "none"

    vibration.start("nudge-max");
    svgConfirm.style.display = "none";

    exercise.stop();
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

    vibration.start("nudge");
}




function formatCalories(calories) {
    return calories.toLocaleString();
};

function getZone(heartRate) {
    return user.heartRateZone(heartRate || 0).toUpperCase();
};

function zeroPad(num) {
    if (num < 10) {
      num = "0" + num;
    }
    return num;
}

function formatActiveTime(activeTime) {
    let seconds = (activeTime / 1000);
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
    txtCalories.text =  formatCalories(exercise.stats.calories);
    txtHeartrate.text = `${exercise.stats.heartRate.current || 0} BPM`;
    txtZone.text = getZone(exercise.stats.heartRate.current);
    txtActiveTime.text = formatActiveTime(exercise.stats.activeTime);
}




