var azureURL = "http://webprogrammingassignment3.azurewebsites.net/api/favoriteCharacters";

function displayResult(data){
    document.getElementById("results") = JSON.stringify(data);
}