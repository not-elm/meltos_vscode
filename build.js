const {execSync} = require("node:child_process");


console.log("build discussion");
execSync("npm i", {
    cwd: "ui/discussion"
});
execSync("npm run build", {
    cwd: "ui/discussion"
});

console.log("build source control");
execSync("npm i", {
    cwd: "ui/tvc_history"
});
execSync("npm run build", {
    cwd: "ui/tvc_history"
});

console.log("build source control");
execSync("npm i", {
    cwd: "ui/tvc_scm"
});
execSync("npm run build", {
    cwd: "ui/tvc_scm"
});

execSync("npm i");
execSync("npm run compile");