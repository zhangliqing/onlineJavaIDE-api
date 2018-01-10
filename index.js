/**
 * Created by zhangliqing on 2018/1/4.
 */
 const express = require('express');
 const shell = require('shelljs');
 const cors = require('cors');
 const childProcess = require('child_process');
 const fs = require('fs');
 const bodyParser = require('body-parser');
 const path = require('path');

 const app = express();
 const router = express.Router();

 app.use(bodyParser.urlencoded({extended: true}));
 app.use(bodyParser.json());
 app.use(cors())
 app.use('/',router)

 /*
 req.body:
 {
   "file_name": "src/test.java",
   "content": "test"
 }
 */
 app.post('/srcFile',function(req,res) {
   var dirname = path.dirname(req.body.file_name);
   if(!fs.existsSync(dirname)){
     fs.mkdirSync(dirname)
   }

   fs.appendFile(req.body.file_name, req.body.content, function (err) {
     if (err)
       throw err;
     res.send(200,JSON.stringify({errorCode:0}))
   });
 })

/*
project structure
src
|-Apllication.java
|-dir1
  |-classA.java
|-xxx
*/
app.get('/result', function(req, res) {
  var compileResult='';
  var execResult='';

  //file java file
  shell.cd('src');  //path in docker image
  var javaFiles = shell.find('.').filter(function(file) { return file.match(/\.java$/); });

  //compile
  var javac = childProcess.spawn('javac',javaFiles)
  javac.stderr.on('data', function (data) {
    compileResult += data;
  });
  javac.stdout.on('data', function (data) {
    compileResult += data;
  });
  javac.on('close', function (code) {
    if(code === 0){

      //execute
      var java = childProcess.spawn('java',['Application'])
      java.stderr.on('data', function (data) {
        execResult += data;
      });
      java.stdout.on('data', function (data) {
        execResult += data;
      });
      java.on('close', function (code) {
        shell.rm('-rf','./*')
        shell.cd('..')
        return res.status(200).send(execResult);
      })
    }else {
      shell.rm('-rf','./*')
      shell.cd('..')
      return res.status(200).send(compileResult);
    }
  });
});

app.listen(8080, function () {
  console.log('listening on port 8080!');
});
