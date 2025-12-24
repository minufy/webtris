let inputDas = document.getElementById("input-das")
let inputArr = document.getElementById("input-arr")
let inputSoftdrop = document.getElementById("input-softdrop")

let buttons = {
    "hold": document.getElementById("button-hold"),
    "cw": document.getElementById("button-cw"),
    "ccw": document.getElementById("button-ccw"),
    "180": document.getElementById("button-180"),
    "left": document.getElementById("button-left"),
    "right": document.getElementById("button-right"),
    "harddrop": document.getElementById("button-harddrop"),
    "softdrop": document.getElementById("button-softdrop"),
    "restart": document.getElementById("button-restart"),
}

let popup = document.getElementById("popup")

function init(){
    inputDas.value = localStorage.getItem("handling-das");
    inputArr.value = localStorage.getItem("handling-arr");
    inputSoftdrop.value = localStorage.getItem("handling-softdrop");
    for (let key in buttons){
        buttons[key].innerText = localStorage.getItem(key);
    }
}

let setting = null;
function set(name){
    setting = name;
    popup.innerText = "input key for " + name;
    popup.style.display = "block";
}

inputDas.addEventListener("change", function (e){
    localStorage.setItem("handling-das", parseInt(e.target.valwue));
});
inputArr.addEventListener("change", function (e){
    localStorage.setItem("handling-arr", parseInt(e.target.value));
});
inputSoftdrop.addEventListener("change", function (e){
    localStorage.setItem("handling-softdrop", parseInt(e.target.value));
});

document.addEventListener("keydown", function (e){
    if (setting != null){ 
        localStorage.setItem(setting, e.key.toLowerCase());
        buttons[setting].innerText = localStorage.getItem(setting);
        setting = null;
        popup.style.display = "none";
    }
});

init();