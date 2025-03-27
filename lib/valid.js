
const fs = require('fs');
const path = require('path');

const iCheck = () => {
	return;
    let isValid = true;

    try {
        const dockerfilePath = path.join(__dirname, '../Dockerfile');
        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
        const isValidCloneLine = dockerfileContent.split('\n')[1] === 'RUN git clone https://github.com/sataniceypz/Izumi-md /root/bot/';
        const dockerfileStats = fs.statSync(dockerfilePath);

        if (dockerfileStats.size !== 183 || !isValidCloneLine) {
            isValid = false;
        }
    } catch (error) {
        isValid = false;
    }

    if (!isValid) {
        console.log('!INVALID GIT!! USE ORIGINAL VERSION ONLY');
        process.exit(0);
    }
};

iCheck();
