#!/usr/bin/env node
// site/content.yaml と site/template.html から public/index.html を作る
// 使い方: node site/build.js   （js-yaml が必要: npm install js-yaml@4.1.0）
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { render } = require('./render.js');

const dir = __dirname;
const content = yaml.load(fs.readFileSync(path.join(dir, 'content.yaml'), 'utf8'));
const template = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');
const out = path.join(dir, '..', 'public', 'index.html');
fs.writeFileSync(out, render(template, content));
console.log('wrote ' + path.relative(process.cwd(), out));
