// This script runs all the other scripts

const { exec } = require("child_process");

const scripts = [
    "./utils/scripts/add-imgs.js",
    "./utils/scripts/sync-imgs.js",
    "./utils/scripts/add-colors.js",
    "./utils/scripts/add-dimens.js",
    "./utils/scripts/rename-imgs.js",
];

const commands = scripts.map((script, i) => "node " + script);

var process = exec(commands.join(' && '));
process.stdout.on("data", (data) => {
    console.log(data);
});
process.addListener("close", () => {
    console.log("All programs run successfully.")
});
