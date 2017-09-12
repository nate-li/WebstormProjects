function doStuff() {
    // talk to web browser
    // window.

    // DOM - Document Object Mode
    // document.getElementById("firstdiv").style.color = "red";
    // document.getElementById("firstdiv").style.backgroundColor = "white";

    // Here is a better way:
    // document.getElementById("firstdiv").classList.add("big");

    // Even better way:
    var firstDivElement = document.getElementById("firstdiv")
    // debugger;
    firstDivElement.classList.toggle("big");
    firstDivElement.classList.toggle("underline");

}