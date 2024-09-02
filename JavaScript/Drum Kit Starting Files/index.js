for(i = 0; i<document.querySelectorAll(".drum").length; i++)
{
document.querySelectorAll(".drum")[i].addEventListener("click", reaction);
function reaction(){

    var audio = new Audio("/Drum Kit Starting Files/sounds/tom-1.mp3");
    audio.play();

}}