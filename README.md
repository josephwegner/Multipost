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

Contributors
------------  
[Joe Wegner](https://twitter.com/Joe_Wegner) via [WegnerDesign](http://www.wegnerdesign.com)  

Thanks
------
Huge thanks to [onteria_](http://www.twitter.com/onteria_) for the wonderful information found in [this post](http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/).
