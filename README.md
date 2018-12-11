# How to use the project:

* Install all libraries run: `npm install`
* For code parsing, this project uses the [Esprima](http://esprima.org/) library.
    * See example usage in `src/js/code-analyzer.js`
* Run the project:
    * From the command-line run: `npm start`
    * After the bundler is done, execute the `index.html` from your IDE (preferably `WebStorm`)
    * Try the parser... 
* For testing, this project uses the [Mocha](https://mochajs.org/) library.
    * From the command-line run: `npm run test`
    * See example test in `test/code-analyzer.test.js`
* For coverage, this project uses the [nyc](https://github.com/istanbuljs/nyc) library.
    * From the command-line run: `npm run coverage`
    * Run `coverage/lcov-report/index.html` to see the html report
* For linting, this project uses the [ESLint](https://eslint.org/) library.
    * From the command-line run: `npm run lint`
    * See the report file `lint/eslint-report.json`