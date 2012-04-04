//Create necessary globals
var multipost = require("../");
var fs = require('fs');

//Create a read stream for piping the file
var stream = fs.createReadStream(__dirname + "/testfile.txt", {encoding: 'utf8'});
//Get the file size, so you have an accurate Content-Length
var size = fs.statSync(__dirname + "/testfile.txt").size;

var fileOpts = {
    name: "file", //Required
    pipe: stream, //Required
    filename: "testfile.txt", //Required
    contentType: "text", //Optional (but suggested)
    value: "" //Required
};

var postFields = [
        {
            name: "field1", //Required
            value: "thisisfield1" //Required
        },
        {
            name: "field2",
            value: "thisisfield2"
        },
        fileOpts
    ];

var options = {
    pipeLength: size  //Optional, but suggested if you are piping data
};

var req = new multipost("http://www.wegnerdesign.com/testFiles.php", postFields, options);

req.post(function(res) {
    console.log(res.data); 
});