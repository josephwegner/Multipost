/* Requires */
var url = require('url');
var http = require('http');

/* Public Class */
var Multipost = function(path, fields, options) {
    if(typeof(path) !== "string") {
        console.log("Multipost: First argument (url) must be a string");
        return false;
    }

    //Check if fields is an array
    if(typeof(fields) !== "object" || typeof(fields.length) !== "number") {
        console.log("Multipost: Second argument (fields) must be an array");
        return false;
    }

    if(typeof(options) == "undefined") {
        options = {};
    }

    this._url = url.parse(path);
    this._fields = fields;
    this._options = options;

    this._boundary = "-------------------------" + Math.random();
    this._boundary = this._boundary.replace(".", "");
};

/* Public Class Functions */
Multipost.prototype.post = function(callback) {
    var post_data = "";

    for(var i=0,max=this._fields.length; i<max; i++) {
        var field = this._fields[i];

        if(typeof(field.filename) == "undefined") {
            //No filename was set, so assme it's not a file
            if(typeof(field.name) === "undefined" || typeof(field.value) === "undefined") {
                console.log("Multipost: Field " + i + " does not have the correct parameters");
                continue;
            }

            post_data += encodeField(this._boundary, field.name, field.value);
        } else {
            if(typeof(field.name) === "undefined" || typeof(field.value) === "undefined") {
                console.log("Multipost: Field " + i + " does not have the correct parameters");
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
            console.log("Multipost: No content length defined for piped data.  Attempting to POST without a content length");
            console.log("Multipost: !Note! This action is not supported by most hosts!");
        } else {
            // We end with "\r\n--" + boundary + "--", so boundary.length + 6
            contentLength = Buffer.byteLength(post_data) + this._options.pipeLength + Buffer.byteLength(this._boundary) + 6;
        }
    } else {
        post_data += "--" + this._boundary + "--";
        contentLength = Buffer.byteLength(post_data);
    }

    var headers;

    if(typeof(contentLength) !== "undefined") {
        headers = {
            "Content-Type": "multipart/form-data; boundary=" + this._boundary,
            "Content-Length": contentLength,
            "connection": "keep-alive"
        };
    } else {
        headers = {
            "Content-Type": "multipart/form-data; boundary=" + this._boundary,
            "Connection": "keep-alive"
        };
    }

    var post_options = {
           host: this._url.hostname,
           port: this._url.port || this._options.port || 80,
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
            if(typeof(callback) == "function") {
                callback(res);
            }
        });

        res.on('error', function(err) {
            console.log("Multipost: Error on http response: ");
            console.log(err);
        });
    });

    request.on('error', function(err) {
        console.log("Multipost: Error on http request: ");
        console.log(err);
    });

    request.write(post_data);

    if(this._pipe) {
        this._pipe.pipe(request, { end: false });

        this._pipe.on('error', function(e) {
            console.log("Multipost: Error while piping data: ");
            console.log(e);
        });

        var boundary = this._boundary;

        this._pipe.on('end', function() {
            request.end("\r\n--" + boundary + "--");
        });
    } else {
        request.end();
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

    if(typeof(mimeType) == "undefined") {
        // If the user specified something that looks like a MIME type, use that:
        if ( (contentType.indexOf("/") >= 0) &&
             (contentType.indexOf("/") == contentType.lastIndexOf("/")) ) {
            mimeType = contentType;
        } else {
            // The content type provided doesn't exist, so our best guess is to just send text
            mimeType = mimeTypes.text;
        }
    }

    var ret = "--" + boundary + "\r\n";
    ret += "Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + fileName + "\"\r\n";
    ret += "Content-Type: " + mimeType + "\r\n\r\n";

    if(value !== "") {
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

/* Exports */
module.exports = Multipost;

