const http = require("http");
const express = require("express");
const simpleGit = require("simple-git");
const Config = require("./config");

const PORT = process.env.PORT || 3000;
const git = simpleGit();
const app = express();

// Express API - Update Check Endpoint
app.get("/updates", async (req, res) => {
    try {
        await git.fetch();
        let commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);

        if (commits.total === 0) {
            return res.json({ update: false, message: "Already on the latest version" });
        } else {
            let updates = commits.all.map(commit => ({
                date: commit.date.substring(0, 10),
                message: commit.message,
                author: commit.author_name
            }));

            return res.json({ update: true, changes: updates });
        }
    } catch (error) {
        return res.status(500).json({ error: "Failed to check updates", details: error.message });
    }
});

// Start Express server for API endpoints
app.listen(8080, () => {
    console.log("Express server running on port 8080");
});

// HTTP Server for Health Check
const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Keep alive!");
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
