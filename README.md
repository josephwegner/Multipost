Multipost: An easy interface for the multipart/form-data protocol
==================================================================================  

Install
-------
Multipost is easily installable via npm.  Just run the following command:  

```
$ npm install multipost
```

Or, if you'd like to install Multipost at the global level, at the global flag

```
$ npm install multipost -g
```

Quick Start
-----------
There are quick start examples found in the test directory.  Here's a basic usage for uploading a standard form:

```javascript
var multipost = require("multipost");

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
```

License
-------
This module is released under the [GPL](http://www.gnu.org/copyleft/gpl.html).