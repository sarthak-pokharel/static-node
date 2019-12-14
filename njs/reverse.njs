
let { log } = console;

function handler({ request, response }) {
    response.writeHead(200, {
        'Content-type': 'text/html;charset=utf-8'
    });
    url = request.url;
    url = decodeURI(url);
    data = url.substr(1).split('/');
    if (data.length == 1) {
        response.write(reverse_page());
    } else {
        data = data.slice(1).join('/');
        data = reverse(data);
        response.write(data);
    }
    response.end();
}

function reverse(data) {
    return [...data].reverse().join('');
}

function trier() {
    try {
        handler(this);
    } catch (err) {
        log(err);
        return this.qErrorPage(err.stack + "", 404, {
            'Content-type': 'text/plain'
        });
    }
}
function reverse_page() {
    let txt =
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    Enter the text to reverse it... 
    <br/>
    <form method="GET" action="">
        <textarea rows="10" cols="10" name="text" >Data To Reverse</textarea>
        <br/>
        <br/>
        <button>Reverse</button>
    </form>
    <script>
    document.forms[0].onsubmit = function(e) {
        e.preventDefault();
        this.action = location.href +"/"+ this['text'].value;
        this.submit();
    }
    </script>
</body>
</html>`
    return txt;
}
module.exports = trier;