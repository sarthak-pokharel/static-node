const fs = require('fs');
let mime = require('./web-confs/mime')
let njsMap = require('./web-confs/njs-map');

let { log } = console;
let njsRequires = {};
log('Processing NJS files')
Object.keys(njsMap).forEach(alias => {
    log("requiring %s", njsMap[alias]);
    njsRequires[alias] = require(njsMap[alias]);
});
log('All njs files processed')

let errorDocument = Object.create(null);
errorDocument[404] = getErrorDoc(404);
class HandleServer {
    constructor(req, res, conf) {
        this.request = req;
        this.response = res;
        this.webConf = conf;
    }
    handleRequest() {
        let rpath = this.request.url;
        rpath = rpath.split("?");
        this.queryData = rpath[1];
        this.accPath = rpath[0];
        rpath = rpath[0];
        for (let alias in njsMap) {
            if (alias.endsWith("*")) {
                let alias_true = alias.substr(0, alias.length - 2);
                if ("/" + rpath.split('/')[1] == (alias_true)) {
                    try {
                        return njsRequires[alias].call(this);
                    } catch (err) {
                        log(err);
                        return this.qErrorPage();
                    }
                }
            }
            if (rpath == alias) {
                try {
                    return njsRequires[alias].call(this);
                } catch (err) {
                    log(err);
                    return this.qErrorPage();
                }
            }
        }
        let file = this.readFile(rpath);
        this.response.writeHead(file.statusCode, {
            ...file.fileHeaders
        });
        this.response.write(file.content);
        this.response.end();
    }
    readFile(fileName) {
        let returnObj = {
            statusCode: 404,
            content: errorDocument[404],
            fileHeaders: {
            }
        };
        try {
            let cont = fs.readFileSync(this.webConf['document-root'] + fileName);
            returnObj.statusCode = 200;
            returnObj.content = cont;
            let ext = this.getFileExtention(fileName);
            if (mime[ext] != undefined) {
                returnObj.fileHeaders['Content-type'] = mime[ext];
            }
        } catch (err) {
            try {
                for (let each of this.webConf['index-file']) {
                    let findex = this.webConf['document-root'] + fileName + each;
                    if (this.fileExists(findex)) {
                        returnObj.content = this.cleanRead(findex);
                        returnObj.statusCode = 200;
                        let ext = this.getFileExtention(findex);
                        if(mime[ext] != undefined) {
                            returnObj.fileHeaders['Content-type'] = mime[ext];
                        }
                        break;
                    }
                };
            } catch (err2) {
                returnObj.fileHeaders['Content-type'] = "text/html";
                log(err);
                log(err2)
            }
        }
        return returnObj;
    }
    getFileExtention(path) {
        let fileName = path.split("/").pop();
        fileName = fileName.split(".").pop();
        return fileName;
    }
    fileExists(fname) {
        try {
            fs.readFileSync(fname);
            return true;
        } catch (err) {
            return false;
        }
    }
    cleanRead(fname) {
        try {
            return fs.readFileSync(fname);
        } catch (err) {
            log(err)
            return false;
        }
    }
    qErrorPage(cont, scode, headers) {
        this.response.writeHead(scode || 404, {
            'Content-type': 'text/html',
            ...(headers || {})
        });
        this.response.write(cont || errorDocument[404]);
        this.response.end();
    }
}

function getErrorDoc(statusCode) {
    let file = fs.readFileSync('./error-docs/' + statusCode + '.html');
    return file.toString();
}

module.exports = HandleServer;
