var azureURL =
    "http://localhost:52082/api/characters";
    // "http://webprogrammingassignment3.azurewebsites.net/api/favoriteCharacters";
var length;
var randInt;

function displayResult(data){
    length = data.length;
    clear();
    document.getElementById("results").innerHTML = JSON.stringify(data);
}

function displayError(data){
    clear();
    document.getElementById("error").innerHTML = JSON.stringify(data);
}

function forcePush(){
    document.getElementById("error").innerHTML = "";

    $.ajax(azureURL,
        {
            method: "POST",
            success: displayResult,
            error: displayError,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(
                {
                    firstName: document.getElementById("firstBox").value,
                    lastName: document.getElementById("lastBox").value,
                    character:  document.getElementById("favBox").value
                })
        });
}

function forcePull(){
    $.ajax(azureURL,
        {
            method: "GET",
            success: displayResult,
            error: displayError
        });
}

function forceRead(){
    randInt = Math.floor(Math.random() * length);

    $.ajax(azureURL + "/" + randInt,
        {
            method: "GET",
            success: parseResult,
            error: displayError
        });
}

function parseResult(data){
    // if(data.firstName !== undefined) {
        var name = data.firstName;
        var lastName = data.lastName;
        var character = data.character;
        document.getElementById("results").innerHTML = "Name: " + name + " " + lastName + "<br/> Favorite Character: " + character;
    // } else{
    //
    // }
}

function forceInsight(){
    $.ajax(azureURL + "/" + randInt + "/views",
        {
            method: "GET",
            success: displayResult,
            error: displayError
        });
}

function watchMovies(){
    $.ajax(azureURL + "/" + randInt + "/views",
        {
            method: "POST",
            success: displayResult,
            error: displayError,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(
                {
                    ViewDate: document.getElementById("viewDate").value

                })
        });
}

function clear(){
    document.getElementById("error").innerHTML = "";
    document.getElementById("results").innerHTML = "";
}