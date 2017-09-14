function parseJSON(){
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    var errorDiv = document.getElementById("error");
    errorDiv.innerHTML = "";

    try {
        var userInput = JSON.parse(document.getElementById("textfield").value);
    } catch (error){
        displayError("Your JSON didn't parse.");
        return;
    }

    var ul = document.createElement("ul");

    resultsDiv.appendChild(ul);
    if(userInput.hasOwnProperty('buttons')) {
        if (userInput.buttons) {
            if (Array.isArray(userInput.buttons)) {
                userInput.buttons.forEach(function (arrayElement) {
                    var button = document.createElement("button");
                    button.appendChild(document.createTextNode(arrayElement));
                    ul.appendChild(button);
                });
            } else {
                displayError("buttons was not an array.");
            }
        } else {
            displayError("buttons was not set in your JSON.");
        }
    }

    if(userInput.hasOwnProperty('fields')) {
        var fieldDiv = document.createElement("div");
        if (userInput.fields) {
            if (Array.isArray(userInput.fields)) {
                userInput.fields.forEach(function (arrayElement) {
                        var name = document.createElement("p");
                        name.appendChild(document.createTextNode(arrayElement));
                        var field = document.createElement("div");
                        field.appendChild(document.createTextNode(arrayElement));

                });
            }
        }
    }
}


function displayError(errorString) {
    var errorDiv = document.getElementById("error");
    errorDiv.innerHTML = errorString;
}