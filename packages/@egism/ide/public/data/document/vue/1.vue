#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { stringify } = require('querystring')
const root = process.env.WORKSPACE || (process.env.INIT_CWD || process.env.PWD || '')
const folderPath = path.join(root, 'public/data/document')

let folder = {}

const readFolder = (folder, folderPath) => {
  const files = fs.readdirSync(folderPath)
  Object.assign(folder, {
    key: randomString(5),
    title: path.basename(folderPath),
    name: path.basename(folderPath),
    extName: path.extname(folderPath),
    path: resolvePath(folderPath),
    class: 'files-tree-item',
    slots: {
      icon: 'fileIcon',
    },
    iconClass: fileClass(path.extname(folderPath)),
    idDir: true,
    children: []
  })
  files.forEach(file => {
    let _folder = {}
    const _path = path.join(folderPath, file)
    const stat = fs.lstatSync(_path)
    if (stat.isDirectory()) {
      readFolder(_folder, _path)
    } else {
      Object.assign(_folder, {
        key: randomString(5),
        title: path.basename(_path),
        name: path.basename(_path),
        extName: path.extname(_path),
        path: resolvePath(_path),
        class: 'files-tree-item',
        slots: {
          icon: 'fileIcon',
        },
        iconClass: fileClass(path.extname(_path)),
        isDir: false
      })
    }
    folder.children.push(_folder)
  })
}

const resolvePath = (_path) => {
  return _path.replace(path.join(root, 'public'), '')
}
const randomString = (len) => {
  len = len || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
  for (i = 0; i < len; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}
const fileClass = (extName) => {
  if (!extName || extName === '') {
    return '#icon-yellowFolder'
  }
  const icon = {
    '.vue': 'icon-vue',
    '.js': 'icon-javascript',
    '.jsx': 'icon-react',
    '.ts': 'icon-typescript',
    '.json': 'icon-json',
    '.html': 'icon-html',
    '.md': 'icon-markdown'
  }
  return icon[extName] ? `#${icon[extName]}` : '#icon-yellowFolder'
}
readFolder(folder, folderPath)

fs.writeFileSync(path.join(root, 'public/config/folder.json'), JSON.stringify(folder), { encoding: 'utf8', flag: 'w+' })
