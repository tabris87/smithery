const fs = require('fs');
const path = require('path');
const md5 = require('md5');

const fileHashMap = {}

function indexing(filePath) {
  if (fs.existsSync(filePath)) {
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      const childs = fs.readdirSync(filePath);
      fileHashMap[filePath] = childs.length;
      watch(filePath);
      childs.forEach(c => indexing(path.join(filePath, c)));
    } else {
      fileHashMap[filePath] = md5(fs.readFileSync(filePath));
    }
  }
}

function watch(filePath) {
  let fsWait = false;
  fs.watch(filePath, { recursive: true }, (event, filename) => {
    if (typeof filename === 'undefined') { return; }
    if (fsWait) return;
    const eventPath = path.join(filePath, filename);
    console.log(`\nEvent: ${event}, File: ${filename}, exists: ${fs.existsSync(eventPath)}, AtMap: ${fileHashMap[eventPath]}`);

    let pathStat;
    //check for delete linux-way
    try {
      pathStat = fs.lstatSync(eventPath);
      if (pathStat.isDirectory()) {
        fs.readdirSync(eventPath);
      } else {
        fs.readFileSync(eventPath);
      }
    } catch (_) {
      if (typeof fileHashMap[eventPath] !== 'undefined') {
        console.log(`File/Folder ${eventPath} deleted;`)
        delete fileHashMap[eventPath];
      }
      return;
    }
    //debouncing
    fsWait = setTimeout(() => {
      fsWait = false;
    }, 100);

    if (pathStat.isDirectory()) {
      //maybe it is created or deleted
      if (event === 'rename') {
        //if it was created we have to create base information
        if (typeof fileHashMap[eventPath] === 'undefined') {
          fileHashMap[eventPath] = fs.readdirSync(eventPath).length;
          if (fileHashMap[eventPath] > 0) {
            indexing(eventPath);
          }
          console.log(`Folder: ${eventPath} created.`);
          watch(eventPath);
        } else {
          const curCount = fs.readdirSync(eventPath).length;
          if (fileHashMap[eventPath] !== curCount) {
            fileHashMap[eventPath] = curCount;
            if (fs.existsSync(eventPath)) {
              console.log(`Folder: ${eventPath} changed.`);
            } else {
              console.log(`Folder: ${eventPath} content deleted.`);
            }
          }
        }
      } else if (event === 'change') {
        console.log(`event 'change' for folder ${eventPath} triggered`);
      }
    }

    if (pathStat.isFile()) {
      if (event === 'rename') {
        if (typeof fileHashMap[eventPath] !== 'undefined') {
          //it is deleted
          delete fileHashMap[eventPath];
          console.log(`File ${eventPath} deleted`);
        } else {
          //it is created

          fileHashMap[eventPath] = md5(fs.readFileSync(eventPath));
          console.log(`File ${eventPath} created`);
        }
      }
      if (event === 'change') {
        const currentHash = md5(fs.readFileSync(eventPath));
        if (fileHashMap[eventPath] !== currentHash) {
          fileHashMap[eventPath] = currentHash;
          console.log(`File ${eventPath} changed`);
        }
      }
    }
  });
}

const testFolder = './testFolder';
const dirName = path.join(process.cwd(), testFolder);
console.log('Indexing...');
indexing(dirName);

console.log('Start watching...\n');


/*
  rename:
  * create
  * delete
  * rename fires 3 times, 2 times for create and delete 1 for content change

  change:
  * folder content changes
*/