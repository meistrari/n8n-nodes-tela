const path = require("path");
const { task, src, dest } = require("gulp");

task("build:icons", copyIcons);

function copyIcons() {
  const nodeSource = path.resolve("assets", "**", "*.{png,svg}");
  const nodeDestination = path.resolve("dist", "nodes");
  const credentialDestination = path.resolve("dist", "credentials");

  return src(nodeSource, { encoding: false })
    .pipe(dest(nodeDestination))
    .pipe(dest(credentialDestination));
}
