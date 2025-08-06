const path = require("path");
const { task, src, dest } = require("gulp");

task("build:icons", copyIcons);

function copyIcons() {
  const nodeSource = path.resolve("src", "**", "*.{png,svg}");
  const nodeDestination = path.resolve("dist", "");

  return src(nodeSource, { encoding: false }).pipe(dest(nodeDestination));
}
