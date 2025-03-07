const http = require("http");
const simpleGit = require("simple-git");
const Config = require("./config");

const PORT = process.env.PORT;
const git = simpleGit();

const server = http.createServer(async (req, res) => {
    if (req.url === "/updates" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        
        try {
            await git.fetch();
            let commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);

            if (commits.total === 0) {
                res.end(JSON.stringify({ update: false, message: "Already on the latest version" }));
            } else {
                let updates = commits.all.map(commit => ({
                    date: commit.date.substring(0, 10),
                    message: commit.message,
                    author: commit.author_name
                }));

                res.end(JSON.stringify({ update: true, changes: updates }));
            }
        } catch (error) {
            res.end(JSON.stringify({ error: "Failed to check updates", details: error.message }));
        }
    } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Keep alive!");
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
