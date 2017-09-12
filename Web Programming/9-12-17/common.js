var azureUrl = "http://simpleserver2017.azurewebsites.net/api/values";

/* HttpMethod, HttpVerbs
CRUD
Create, Read, Update, Delete

GET - Read data from server
POST - Send/Create data to server
PUT - Update (cross fingers behind back, sometimes create data on server)
DELETE - Remove/Delete data from the server
*/

function simpleResult(data){
    document.getElementById("data").innerHTML = JSON.stringify(data);
}

function simpleError(data){
    document.getElementById("error").innerHTML = JSON.stringify(data);
}

function runGet(){
    $.ajax(azureUrl,
    {
        method: "GET",
        success: simpleResult

    });
}

function runPost(){
    $.ajax(azureURL,
    {
      method: "POST",
      success: simpleResult,
      contentType: "application/json",
      processData: false,
      data: JSON.stringify(
          {
              Value: document.getElementById("userInput").value()
          }
      )
    } )
}
