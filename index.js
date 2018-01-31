/**
 * Created by zhangliqing on 2018/1/4.
 */
 const express = require('express');
 const shell = require('shelljs');
 const cors = require('cors');
 const fs = require('fs');
 const bodyParser = require('body-parser');
 const path = require('path');
 const jsonfile = require('jsonfile');
const childProcess = require('child_process');
 const app = express();
 const router = express.Router();

 app.use(bodyParser.urlencoded({extended: true}));
 app.use(bodyParser.json());
 app.use(cors())
 app.use('/',router)

/*
req.header:
{
 "experimentId": 4
}
*/
/*app.get('/srcfiles/:experimentid',function(req,res){
  console.log('entry get /srcfiles')

  var baseDir = '/Users/zhangliqing/data/ideCode/'+req.params.experimentid;  //会把experimentId转成experimentid ？？？

  if(fs.existsSync(baseDir+'/.jsondata.json')){
    res.send(200,jsonfile.readFileSync(baseDir+'/.jsondata.json'))
  }else {
    res.send(404,'file not exist!')
  }
})*/
/*
 req.body:
 {
   "experimentId": 4,
   "files": []
 }
 */
/*app.post('/srcfiles',function(req,res) {
   console.log('entry post /srcfiles')
    console.log(req.body.files)
   //clear all files before update
   var baseDir = '/Users/zhangliqing/data/ideCode/'+req.body.experimentId;
   if(fs.existsSync(baseDir)){
     shell.rm('-rf',baseDir+'/!*')
   }

   var writeFiles = function(fileModel) {

     //console.log(fileModel)

     if ('children' in fileModel){
       for(var i = 0; i < fileModel.children.length; ++i){
         writeFiles(fileModel.children[i])
       }
     }else {
       //mkdir
       var tmpDir = baseDir+path.dirname(fileModel.text)
       if(!fs.existsSync(tmpDir)){
         shell.mkdir('-p', tmpDir);
       }

       //write file
       fs.appendFile(baseDir+fileModel.text, fileModel.data, function (err) {
         if (err)
           throw err;
       });
     }
     return true;
   }

   var fileModel = {
     "text": "/",
     "children": req.body.files
   }

   if(writeFiles(fileModel)){
     jsonfile.writeFile(baseDir+'/.jsondata.json',{'files':req.body.files})
     res.send(200,{errorCode:0})
   }

 })*/

app.get('/result/:userid/:experimentid',function(req,res) {

  var workingDir = '/srcData/workspace/'+req.params.userid+'_'+req.params.experimentid+'/working-dir/';
  var compile = function(dir) {
    var compileResult='';
    var execResult='';

    //find all java files
    shell.cd(dir);
    var javaFiles = shell.find('.').filter(function(file) { return file.match(/\.java$/); });

    //compile
    var javac = childProcess.spawn('javac',javaFiles,{encoding:'UTF-8'})
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
          return res.status(200).send({result:execResult});
        })
      }else {
        return res.status(200).send({result:compileResult});
      }
    });
  }
  compile(workingDir)

})

app.listen(8080, function () {
  console.log('listening on port 8080!');
});
