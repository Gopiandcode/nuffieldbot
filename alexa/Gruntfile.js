var config = require("./config/config");
module.exports = function(grunt) {
    grunt.initConfig(config(grunt));

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('run', 'Runs the Server', function(arg) {
        var port = arg | 30000;


    });

    grunt.registerTask('default', []);
}
