
var numberOfDrumButtons = document.querySelectorAll(".drum").length

for (i = 0; i < numberOfDrumButtons; i++) {

//Detecting button press(I think)

    document.querySelectorAll(".drum")[i].addEventListener("click", reaction);

    function reaction(event) {

        var buttoninnerHTML = this.innerHTML;

        makesound(buttoninnerHTML)
        buttonAnimation(buttoninnerHTML)
    }


//Detecting keyboard press(Confirmed)

    document.addEventListener("keydown", function (event) {

        makesound(event.key)
        buttonAnimation(event.key)

    })

}

//function to add sound(This one I know)

function makesound(key) {
    switch (key) {
        case "w":
            var tom1 = new Audio("sounds/tom-1.mp3");
            tom1.play();
            break;
        case "a":
            var tom2 = new Audio("sounds/tom-2.mp3");
            tom2.play();
            break;
        case "s":
            var tom3 = new Audio("sounds/tom-3.mp3");
            tom3.play();
            break;
        case "d":
            var tom4 = new Audio("sounds/tom-4.mp3");
            tom4.play();
            break;
        case "j":
            var kick = new Audio("sounds/kick-bass.mp3");
            kick.play();
            break;
        case "k":
            var crash = new Audio("sounds/crash.mp3");
            crash.play();
            break;
        case "l":
            var snare = new Audio("sounds/snare.mp3");
            snare.play();
            break;
    }
}


function buttonAnimation(currentKey){

   var activeButton = document.querySelector("." + currentKey)
   activeButton.classList.add("pressed")
   setTimeout(function(){activeButton.classList.remove("pressed")}, 100);

}
