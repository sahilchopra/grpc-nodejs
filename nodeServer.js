const http = require("http");
const client = require("./client");

const host = "localhost";
const port = 8001;

const requestListener = function (req, res) {
    console.log(req.url);
    console.log(req.method);
    const url = req.url.split("/");
    const method = req.method;

    // Set response header
    res.setHeader("Content-Type", "application/json");

    if (url[1] === "news") {
        switch (method) {
            case "GET":
                if (url.length > 2 && url[2]) {
                    client.getNews(
                        { id: url[2] },
                        (error, news) => {
                            if (error) {
                                res.statusCode = 500;
                                return res.end(JSON.stringify({ error: error.message }));
                            }
                            res.end(JSON.stringify(news));
                        }
                    );
                } else {
                    client.getAllNews({}, (error, news) => {
                        if (error) {
                            res.statusCode = 500;
                            return res.end(JSON.stringify({ error: error.message }));
                        }
                        res.end(JSON.stringify(news));
                    });
                }
                break;

            case "POST":
                let body = "";
                req.on("data", chunk => { body += chunk; });
                req.on("end", () => {
                    const parsedBody = JSON.parse(body);
                    client.addNews(
                        {
                            body: parsedBody.body,
                            postImage: parsedBody.postImage,
                            title: parsedBody.title,
                        },
                        (error, news) => {
                            if (error) {
                                res.statusCode = 500;
                                return res.end(JSON.stringify({ error: error.message }));
                            }
                            res.end(JSON.stringify({ data: news, msg: "Successfully created a news item." }));
                        }
                    );
                });
                break;

            case "PUT":
                let putBody = "";
                req.on("data", chunk => { putBody += chunk; });
                req.on("end", () => {
                    const parsedBody = JSON.parse(putBody);
                    client.editNews(
                        {
                            id: url[2],
                            body: parsedBody.body,
                            postImage: parsedBody.postImage,
                            title: parsedBody.title,
                        },
                        (error, news) => {
                            if (error) {
                                res.statusCode = 500;
                                return res.end(JSON.stringify({ error: error.message }));
                            }
                            res.end(JSON.stringify(news));
                        }
                    );
                });
                break;

            case "DELETE":
                client.deleteNews(
                    { id: url[2] },
                    (error) => {
                        if (error) {
                            res.statusCode = 500;
                            return res.end(JSON.stringify({ error: error.message }));
                        }
                        res.end(JSON.stringify({ msg: "Successfully deleted a news item." }));
                    }
                );
                break;

            default:
                res.statusCode = 405;
                res.end(JSON.stringify({ error: "Method Not Allowed" }));
                break;
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
