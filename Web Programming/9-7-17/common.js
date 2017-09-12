function parseJSON() {
    var resultsDiv = document.getElementsById("results");
    resultsDiv.innerHTML = "";
    //
    // var resultsText = document.createTextNode("here are my results");
    // resultsDiv.appendChild(resultsText);

    var ol = document.createElement("ol");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode("A list item"));

    ol.appendChild(li);

    resultsDiv.appendChild(ol);
}