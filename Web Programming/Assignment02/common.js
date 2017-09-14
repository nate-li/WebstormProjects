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
                    if (typeof(arrayElement) === "string") {
                        var button = document.createElement("button");
                        button.appendChild(document.createTextNode(arrayElement));
                        ul.appendChild(button);
                    } else {
                        displayError("\"" + arrayElement + "\" was not a string");
                    }

                });
            } else {
                displayError("buttons was not an array.");
            }
        }
    }

    if (userInput.hasOwnProperty('fields')) {
        if (userInput.fields) {
            if (Array.isArray(userInput.fields)) {
                userInput.fields.forEach(function (arrayElement) {
                    var entry = document.createElement("div");
                    var textbox = document.createElement("input");
                    var label;
                    if (typeof arrayElement === "object") {
                        entry = document.createElement("div");
                        textbox = document.createElement("input");
                        textbox.appendChild(document.createTextNode(arrayElement.default));
                        label = document.createTextNode(arrayElement.name);
                        if(!arrayElement.name){
                            displayError("no name field was given.");
                        }
                        entry.appendChild(label);
                        entry.appendChild(textbox);
                        ul.appendChild(entry);
                    } else {
                        if (typeof arrayElement === "string") {
                                entry = document.createElement("div");
                            textbox = document.createElement("input");
                            label = document.createTextNode(arrayElement);
                            entry.appendChild(label);
                            entry.appendChild(textbox);
                            ul.appendChild(entry);
                        } else {
                            displayError(arrayElement + " was not a string or object.");
                        }
                    }
                });
            } else {
                displayError("fields was not an array.");
            }
        }
    }

    function displayError(errorString) {
        var errorDiv = document.getElementById("error");
        errorDiv.innerHTML = errorString;
    }
}