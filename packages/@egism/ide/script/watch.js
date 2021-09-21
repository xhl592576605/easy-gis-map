#!/usr/bin/env node

const shell = require("shelljs");     //执行shell
const watch = require('watch');       //监测目录变化
const path = require('path')
const root = process.env.WORKSPACE || (process.env.INIT_CWD || process.env.PWD || '')
const folderPath = path.join(root, 'public/data/document')
watch.watchTree(folderPath, function (f, curr, prev) {
  shell.exec("node  script/folder.js");
});