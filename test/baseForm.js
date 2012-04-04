//Create necessary globals
var multipost = require("../lib/multipost.js");

var postFields = [
        {
            name: "field1", //Required
            value: "thisisfield1" //Required
        },
        {
            name: "field2",
            value: "thisisfield2"
        }
    ];

var req = new multipost("http://www.wegnerdesign.com/testFiles.php", postFields);

req.post(function(res) {
    console.log(res.data); 
});