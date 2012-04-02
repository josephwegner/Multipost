/* Requires */
var url = require('url');
var http = require('http');

/* Public Class */
var Multipost = function(path, fields, options) {
    if(typeof(url) !== "string") {
        console.log("Multipost: First argument (url) must be a string");
        return false;
    }
    
    //Check if fields is an array
    if(typeof(fields) !== "object" || typeof(fields.length) !== "number") {
        console.log("Multipost: Second argument (fields) must be an array");
        return false;
    }
    
    this._url = url.parse(path);
    this._fields = fields;
    this._options = options;
    
    this._boundary = Math.random();
};

/* Public Class Functions */
Multipost.prototype.post = function() {
    var post_data = "";
    
    for(var i=0,max=this._fields.length; i<max; i++) {
        var field = this._fields[i];
        
        if(typeof(field.filename) == "undefined") {
            //No filename was set, so assme it's not a file
            if(typeof(field.name) === "undefined" || typeof(field.value) === "undefined") {
                console.log("Multipart: Field " + i + " does not have the correct parameters");
                continue;
            }
            
            post_data += encodeField(this._boundary, field.name, field.value);
        } else {
            if(typeof(field.name) === "undefined" || typeof(field.value) === "undefined") {
                console.log("Multipart: Field " + i + " does not have the correct parameters");
                continue;
            }
            
            //No content type was set, so text is our best guess
            if(typeof(field.contentType) === "undefined") {
                field.contentType = "text";   
            }
            
            if(field.pipe) {
                field.value = "";
                this._pipe = field.pipe;
            }
            
            post_data += encodeFileField(this._boundary, field.name, field.value, field.filename, field.contentType);
        }
    }
    
    var contentLength;
    if(this._pipe) {
        if(typeof(this._options.pipeLength) == "undefined") {
            console.log("Multipart: No content length defined for piped data.  Attempting to POST without a content length");
            console.log("Multpiart: !Note! This action is not supported by most hosts!");
        } else {
            contentLength = post_data.length + this._options.pipeLength + this._boundery.length + 4;
        }
    } else {    
        post_data += "--" + this._boundary + "--";
        contentLength = post_data.length;
    }
    
    var headers;
    headers["Content-Type"] = "multipart/form-data; boundary=" + this._boundary;
    
    if(typeof(contentLength) !== "undefined") {
        headers["Content-Length"] = contentLength;   
    }
    
    var post_options = {
           host: this._url.host,
           port: this._options.port || 80,
           path: this._url.pathname,
           method: this._options.method || "POST",
           headers: headers
    };
    
    var request = http.request(post_options, function(res) {
        res.data = "";
        
        res.on('data', function(chunk) {
            res.data += chunk;
        });
        
        res.on('end', function() {
            return res; 
        });
    });
    
    request.write(post_data);
    
    if(this._pipe) {
        this._pipe.pipe(request, { end: false });
        
        this._pipe.on('end', function() {
            request.write("--" + this._boundary + "--" );
        });
    }
    
    
};

/* Private Variables */

var mimeTypes = {
    mpeg_audio: "audio/mpeg",
    ogg_audio: "audio/ogg",
    vorbis: "audio/vorbis",
    wma: "audio/wma",
    wav: "audio/vnd.wave",
    gif: "image/gif",
    jpeg: "image/jpeg",
    png: "image/png",
    tiff: "image/tiff",
    cmd: "text/cmd",
    css: "text/css",
    csv: "text/csv",
    html: "text/html",
    js: "text/javascript",
    text: "text/plain",
    xml: "text/xml",
    vcard: "text/vcard",
    mpeg_video: "video/mpeg",
    mp4: "video/mp4",
    ogg_video: "video/ogg",
    quicktime: "video/quicktime",
    wmv: "video/x-ms-wmv"
};

/* Private Functions */
function encodeFileField(boundary, fieldName, value, fileName, contentType) {
    var mimeType = mimeTypes[contentType];
    
    //The content type provided doesn't exist, so our best guess is to just send text
    if(typeof(mimeType) == "undefined") {
        mimeType = mimeTypes.text;   
    }
    
    var ret = "--" + boundary + "\r\n";
    ret += "Content-Disposition: form-data; name\"" + fieldName + "\"; filename=\"" + fileName + "\"\r\n";
    ret += "Content-Type: " + mimeType + "\r\n\r\n";

    if(field.value !== "") {
        ret += value + "\r\n\r\n";   
    }
    
    return ret;
}

function encodeField(boundary, fieldName, value) {
   var ret = "--" + boundary + "\r\n";
   ret += "Content-Disposition: form-data; name=\"" + fieldName + "\"\r\n\r\n";
   ret += value + "\r\n";
   
   return ret;
}

