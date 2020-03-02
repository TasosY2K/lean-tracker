const fs = require('fs');

module.exports = {
  readSql: function(filepath) {
    let contents = fs.readFileSync(filepath, 'utf8');
    return contents.toString()
  },
  shutdown: function() {
    console.log("Exit 0");
    process.exit()
  }
};
