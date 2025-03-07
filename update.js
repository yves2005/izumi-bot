const express = require("express");
const simpleGit = require("simple-git");
const Config = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;
const git = simpleGit();

// Update Check Endpoint
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

// Start Express server for updates
app.listen(PORT, () => {
    console.log(`Update server is running on port ${PORT}`);
});
