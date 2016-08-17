"use strict";

let path = require("path");
let shell = require("shelljs");
let fileUrl = require("file-url");
let Nightmare = require("nightmare");

// Get list of names to process
let names = [];
if (process.argv.length == 2) {
    // Default to all Elm files
    names = shell.ls("*.elm").map(function(filename) {
        return path.basename(filename, ".elm");
    });
} else {
    // Otherwise, use specified names
    names = process.argv.slice(2);
}

// Install any needed Elm packages
if (shell.exec("elm package install --yes").code != 0) {
    shell.echo("Elm package installation failed");
    process.exit(1);
}

// Create output directory if necessary
if (!shell.test("-d", "output")) {
    shell.mkdir("output");
}

// Loop through each input
names.forEach(function(name) {
    let elmFilename = name + ".elm";
    let htmlFilename = "output/" + name + ".html";
    let pngFilename = "output/" + name + ".png";

    // Compile Elm file to HTML
    let elmMakeCommand = "elm make --yes --output " + htmlFilename + " " + elmFilename;
    if (shell.exec(elmMakeCommand).code != 0)  {
        shell.echo("Elm compilation failed");
        process.exit(1);
    }

    // Render HTML to PNG
    let nightmare = Nightmare({show: false}).viewport(1024, 768);
    let dimensions = {x: 0, y: 0, width: 240, height : 240};
    nightmare.goto(fileUrl(htmlFilename)).screenshot(pngFilename, dimensions).end().then(function (result) {
        console.log("Rendered " + pngFilename);
    }).catch(function (error) {
        console.error("Render failed:", error);
    });
})
