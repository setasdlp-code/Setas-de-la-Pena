'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const files=['.','firebase'].flatMap(dir=>fs.readdirSync(path.join(root,dir))
  .filter(name=>name.endsWith('.test.js')&&!name.endsWith('-criterio-gate.test.js'))
  .sort().map(name=>path.join(dir,name)));
const result=spawnSync(process.execPath,['--test',...files],{cwd:root,stdio:'inherit'});
if(result.error) console.error(result.error);
process.exitCode=result.status??1;
