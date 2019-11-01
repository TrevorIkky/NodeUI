const tmp = require('tmp');
const fs = require('fs');
const {exec} = require('child_process');
const randomString = require('randomstring');

module.exports = {
  create_source: function(domain, data) {
    const tmpObj = tmp.fileSync({mode: 0644, prefix: domain, postfix: '.cc'});
    console.log('File: ', tmpObj.name);
    fs.writeFile(tmpObj.name, data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    // create json file to be used for output
    const basename = tmpObj.name.split('.')[0];
    const ofile = basename + '.json';
    fs.closeSync(fs.openSync(ofile, 'w'));
    return basename;
  // tmp.setGracefulCleanup();
  },
  create_output_listener: function(base) {
    const ofile = basename + '.json';
    fs.watch(ofile, {persistent: false}, (eventType, filename) => {
      if (eventType === 'change') {
        console.log(`Output has arrived in ${filename}`);
        const output = JSON.parse(fs.readFileSync(filename, 'utf8'));
        return output;
      }
    });
  },
  compile_and_run: function(base, callback) {
    const sourceFile = base + '.cc';
    const ofile = base + '.json';
    const exe = base.split('/')[2];
    const ortoolsDir = '/home/kajm/code/JavaScript/is-proj/or-tools';
    exec(`make build SOURCE=${sourceFile}`, {cwd: ortoolsDir}, (err, stdout, stderr) => {
      if (err) throw err;
      exec(`bin/${exe} ${ofile}`, {cwd: ortoolsDir}, (err, stdout, stderr) => {
        if (err) throw err;
        console.log(ofile);
        callback(JSON.parse(fs.readFileSync(ofile, 'utf8')));
        // console.log('Process says: ' + stdout);
        // return output;
      })
      ;
    });
  },

  saveFileProgress: function(data) {
    // Can include a path...mindful of windows and linux paths
    const fileName = randomString.generate(5)+'.json';
    fs.writeFile(fileName, data, (err)=>{
      if (err) throw err;
      return fileName;
    });
  },

  deleteFile: function(path) {
    fs.access(path, (error)=>{
      if (error) throw error;
      fs.unlink(path, (error)=>{
        if (error) throw err;
        return 'OK';
      });
    });
  },
};
