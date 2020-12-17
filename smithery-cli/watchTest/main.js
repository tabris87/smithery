const fs = require('fs');
const path = require('path');
const md5 = require('md5');

const fileHashMap = {}

function indexing(filePath) {
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    const childs = fs.readdirSync(filePath);
    fileHashMap[filePath] = childs.length;
    childs.forEach(c => indexing(path.join(filePath, c)));
  }
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    fileHashMap[filePath] = md5(fs.readFileSync(filePath));
  }
}

const testFolder = './testFolder';
const dirName = path.join(process.cwd(), testFolder);
console.log('Indexing...');
indexing(dirName);

console.log('Start watching...\n');
let fsWait = false;

fs.watch(dirName, { recursive: true }, (event, filename) => {
  if (typeof filename === 'undefined') { return; }
  if (fsWait) return;
  const eventPath = path.join(dirName, filename);

  //used to check if a file was deleted, as well as subfiles/subfolder
  if (event === 'rename' && !fs.existsSync(eventPath)) {
    //Linux sends the delete event multiple times 
    //only checking for rename and not existing is not enough
    //therefore we have to check if the path is within the fileHashMap
    //if not, the file is already deleted
    if (typeof fileHashMap[eventPath] !== 'undefined') {
      console.log(`File/Folder ${eventPath} deleted;`)
      delete fileHashMap[eventPath];
    }
    return;
  }
  const pathStat = fs.lstatSync(eventPath);

  //debouncing
  fsWait = setTimeout(() => {
    fsWait = false;
  }, 100);

  if (pathStat.isDirectory()) {
    //maybe it is created or deleted
    if (event === 'rename') {
      if (typeof fileHashMap[eventPath] !== 'undefined') {
        //it was deleted
        delete fileHashMap[eventPath];
        console.log(`Folder ${eventPath} deleted`);
      } else {
        //if it was created we have to create base information
        fileHashMap[eventPath] = fs.readdirSync(eventPath).length;
        console.log(`Folder ${eventPath} created`);
      }
    } else if (event === 'change') {
      const current = fs.readdirSync(eventPath).length;
      if (fileHashMap[eventPath] !== current) {
        fileHashMap[eventPath] = current;
        console.log(`Folder ${eventPath} changed`);
      }
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

/*
  rename:
  * create
  * delete
  * rename fires 3 times, 2 times for create and delete 1 for content change

  change:
  * folder content changes
*/