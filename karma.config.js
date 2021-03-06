// Karma configuration
// Generated on Mon Nov 17 2014 09:20:51 GMT+1300 (NZDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
        'src/js/libs.js',
        'src/js/config.js',
        'src/js/scripts.js',
        'src/js/templates.js',
        'src/js.spec/*.js',
        'src/modules/**/tests/*.spec.js'
    ],

    proxies: {
        '/i18n': 'http://localhost:8000/src/i18n'
    },


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // preprocessors: {
    //   'src/js/scripts.js': ['coverage']
    // },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
        'dots',
        // 'coverage'
    ],

    // coverageReporter: {
    //     type : 'html',
    //     dir : 'reports/coverage'
    // },


    // web server port
    port: 8001,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};