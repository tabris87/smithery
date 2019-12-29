"use strict";

const ProjectCL = require('./lib/Project');

let oProject = new ProjectCL();
oProject.setModelPath('./test.model');
oProject.setConfigsPath('./configs');
oProject.build();

let oProject2 = new ProjectCL();
oProject2.setModelPath('./test.model');
oProject2.setConfigsPath('./configs');
oProject2.setConfig('fileConflict');
oProject2.build();
