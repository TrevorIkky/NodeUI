const tmp = require('tmp');
const fs = require('fs');
const {exec} = require('child_process');


module.exports = {
  create_source: function(domain, data) {
    var tmpObj;
    if (domain.startsWith('scheduling')) {
      tmpObj = tmp.fileSync({mode: 0744, prefix: domain, postfix: '.py'});
    } else {
      tmpObj = tmp.fileSync({mode: 0644, prefix: domain, postfix: '.cc'});
    }
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
    if (exe.startsWith('scheduling')) {
      exec(`python ${base + '.py'} ${ofile}`, (err, stdout, stderr) => {
        if (err) throw err;
        console.log(ofile);
        callback(JSON.parse(fs.readFileSync(ofile, 'utf8')));
      });
    }
    else { 
    const ortoolsDir = '/home/kajm/code/JavaScript/is-proj/or-tools';
    exec(`make build SOURCE=${sourceFile}`, {cwd: ortoolsDir}, (err, stdout, stderr) => {
      if (err) throw err;
      exec(`bin/${exe} ${ofile}`, {cwd: ortoolsDir}, (err, stdout, stderr) => {
        if (err) throw err;
        console.log(ofile);
        callback(JSON.parse(fs.readFileSync(ofile, 'utf8')));
        // console.log('Process says: ' + stdout);
        // return output;
      }) ;
    });
    }
  },
};
