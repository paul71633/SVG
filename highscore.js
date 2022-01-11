//
// A score record JavaScript class to store the name and the score of a player
//
function ScoreRecord(name, score) {
    this.name = name;
    this.score = score;
}
//
// This function reads the high score table from the cookies
//
function getHighScoreTable() {
    var table = new Array();

    for (var i = 0; i < 5; i++) {
        // Contruct the cookie name
        var name = "player" + i;

        // Get the cookie value using the cookie name
        var value = getCookie(name);

        // If the cookie does not exist exit from the for loop
        if (value == null)
            break;

        // Extract the name and score of the player from the cookie value
        var record = value.split("~");

        // Add a new score record at the end of the array
        table.push(new ScoreRecord(record[0], parseInt(record[1])));
    }

    return table;
}  
//
// This function stores the high score table to the cookies
//
function setHighScoreTable(table) {
    for (var i = 0; i < 5; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Contruct the cookie name
        var name = "player" + i;

        // Store the ith record as a cookie using the cookie name
        setCookie(name, table[i].name + "~" + table[i].score);
    }
}
//
// Clear the high score table, delete all the cookies
//
function clearHighScoreTable() {
    var highScoreTable = getHighScoreTable();
    for (var i = 0; i < highScoreTable.length; i++) {
        var name = "player" + i;
        deleteCookie(name);
    }
}
//
// This function adds a high score entry to the text node
//
function addHighScore(record, node, top5_score = false) {
    // Create the name text span
    var name = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    name.setAttribute("x", 100);
    name.setAttribute("dy", 40);
    if(top5_score == true){
        name.setAttribute("fill", "rgb(97, 139, 255)")
    }else{
        name.setAttribute("fill", "black")
    }
    name.appendChild(document.createTextNode(record.name));
    // Add the name to the text node
    node.appendChild(name);

    // Create the score text span
    var score = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    score.setAttribute("x", 400);
    score.appendChild(document.createTextNode(record.score));
    if(top5_score == true){
        score.setAttribute("fill", "rgb(97, 139, 255)")
    }else{
        score.setAttribute("fill", "rgb(0, 20, 51)")
    }
    // Add the name to the text node
    node.appendChild(score);
}
//
// This function shows the high score table to SVG 
//
function showHighScoreTable(table, top5, index) {
    // Show the table
    var node = document.getElementById("high_score_table");
    node.style.setProperty("visibility", "visible", null);

    // Get the high score text node
    var node = document.getElementById("high_score_text");
    
    for (var i = 0; i < 5; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        if(top5 == true && i == index){
            // Add the record at the end of the text node
            addHighScore(table[i], node, top5);
        }else{
            // Add the record at the end of the text node
            addHighScore(table[i], node);
        }
    }
}
//
// The following functions are used to handle HTML cookies
//

//
// Set a cookie
//
function setCookie(name, value, expires, path, domain, secure) {
    var currentCookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = currentCookie;
}
//
// Get a cookie
//
function getCookie(name) {
    var document_cookie = document.cookie;
    var prefix = name + "=";
    var begin = document_cookie.indexOf("; " + prefix);
    if (begin == -1) {
        begin = document_cookie.indexOf(prefix);
        if (begin != 0) return null;
    } else
        begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
        end = document_cookie.length;
    return unescape(document_cookie.substring(begin + prefix.length, end));
}
//
// Delete a cookie
//
function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
        document.cookie = name + "=" + 
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}
