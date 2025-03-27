const fs = require('fs');
const path = require('path');
const { File } = require('megajs');

async function MakeSession(sessionId, folderPath) {
    try {
        const decryptedSessionId = sessionId.split("~")[1];
        const fileUrl = `https://mega.nz/file/${decryptedSessionId}`;

        if (typeof File === "undefined") {
            throw new Error("File is not defined. Make sure the necessary library is imported.");
        }

        const filer = File.fromURL(fileUrl);

        filer.download((err, data) => {
            if (err) throw err;

            // Define the path where creds.json should be saved
            const outputPath = path.join(folderPath, "creds.json");

            // Save data to creds.json
            fs.writeFile(outputPath, data, () => {
                console.log(`*Session downloaded successfully as creds.json* [🌟]`);
            });
        });

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

module.exports = { MakeSession };
