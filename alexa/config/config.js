function config(cgrunt) {
    return {
        watch: {
            files: ['./lib/*.js', './index.js', './config.js'],
            tasks: ['run']
        }

    };
    
}

module.exports = config;
