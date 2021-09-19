#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const root = process.env.WORKSPACE || (process.env.INIT_CWD || process.env.PWD || '')
const folderPath = path.join(root, 'public/data/document')

const folder = {}

const readFolder = (folder, path) => {
  const files = fs.readdirSync(path)
  files.forEach(file => {
  })
}
readFolder(folder, folderPath)
