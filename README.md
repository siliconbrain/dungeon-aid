# Dungeon Aid
*a D&D player's best friend*


# The Making of Dungeon Aid
* Create an empty project in WebStorm.
* Add the project to Git version control.
* Install the `.ignore` plugin.
* Add `.gitignore` to the project root with JetBrains exclusions.
* Do first commit.
* Add `README.md` to the project root.
* Install the `Markdown` plugin.
* Add basic info to `README.md`.
* Commit.
* Add `index.html` to project to based on HTML5 template.
* Change site title.
* Add `div` container with `id="app"`.
* Commit.
## Setup Grunt
* Install Node.js.
* Create basic `package.json`.
* Install `grunt`, `grunt-browserify`, `grunt-contrib-watch`, `babelify`, `babel-preset-es2015` via NPM:
```npm install --save-dev grunt grunt-browserify grunt-contrib-watch babelify babel-preset-es2015```
* Create `Gruntfile.js` in project root.
* Add `default` and `build` Grunt tasks.
* Create `modules` and `dist` directories in project root.
* Mark `dist` as Excluded in WebStorm and add it to `.gitignore` as well.
* Add the default Grunt task as a Startup Task. This'll watch for changes in `modules`.
* Commit.
## Setup cycle.js
* Create `main.es6` in `modules`.
* Install `@cycle/core`, `@cycle/dom` and `rx` via NPM: ```npm install --save @cycle/core @cycle/dom rx```
* Import Cycle and Rx in `main.es6`.


***

**TBC**

# Notes
* Read up on transpiler running options (Grunt, Gulp, WebPack, Browserify)
    * Use `browserify` instead of Grunt: add NPM script ```browserify modules/main.es6 -t babelify --outfile dist/module.js``` (Tip: make `dist` directory via `mkdirp`)
