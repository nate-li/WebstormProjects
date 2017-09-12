function changecolor() {
    var firstDivElement = document.getElementById("div1");
    var secondDivElement = document.getElementById("div2");

    firstDivElement.classList.toggle("maroon");
    secondDivElement.classList.toggle("red");

}

function spiceitup() {
    var firstDivElement = document.getElementById("div1");
    var secondDivElement = document.getElementById("div2");

    var split = Math.floor(Math.random() * 100) + 1;
    var othersplit = 100 - split;

    firstDivElement.style.width = split + '%';
    secondDivElement.style.width = othersplit + '%';

}