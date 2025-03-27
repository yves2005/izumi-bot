const fs = require("fs");
const path = require("path");

const libPath = path.join(__dirname);
const databasePath = path.join(libPath, "database");
const exportedModules = {};

function readDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && path.extname(file) === ".js") {
      const moduleName = path.basename(file, ".js");
      const requiredModule = require(filePath);

      if (typeof requiredModule === "object") {
        for (const functionName in requiredModule) {
          exportedModules[functionName] = requiredModule[functionName];
        }
      } else {
        exportedModules[moduleName] = requiredModule;
      }
    } else if (stats.isDirectory()) {
      readDirectory(filePath);
    }
  });
}

readDirectory(libPath);
readDirectory(databasePath);

module.exports = exportedModules;