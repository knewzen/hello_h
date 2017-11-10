// Generated by CoffeeScript 1.12.5
(function() {
  var Adapter, W, clone, fs, partialRight, path, readFile, requireEngine, resolve, resolvePath,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  W = require('when');

  clone = require('lodash.clone');

  partialRight = require('lodash.partialright');

  resolve = require('resolve');

  path = require('path');

  fs = require('fs');

  readFile = require('when/node/function').lift(fs.readFile);

  Adapter = (function() {

    /**
     * The names of the npm modules that are supported to be used as engines by
       the adapter. Defaults to the name of the adapter.
     * @type {String[]}
     */
    Adapter.prototype.supportedEngines = void 0;


    /**
     * The name of the engine in-use. Generally this is the name of the package on
       npm.
     * @type {String}
     */

    Adapter.prototype.engineName = '';


    /**
     * The actual engine, no adapter wrapper. Defaults to the engine that we
       recommend for compiling that particular language (if it is installed).
       Otherwise, whatever engine we support that is installed.
     */

    Adapter.prototype.engine = void 0;


    /**
     * Array of all file extensions the compiler should match
     * @type {String[]}
     */

    Adapter.prototype.extensions = void 0;


    /**
     * Expected output extension
     * @type {String}
     */

    Adapter.prototype.output = '';


    /**
     * Specify if the output of the language is independent of other files or the
       evaluation of potentially stateful functions. This means that the only
       information passed into the engine is what gets passed to Accord's
       compile/render function, and whenever that same input is given, the output
       will always be the same.
     * @type {Boolean}
     * @todo Add detection for when a particular job qualifies as isolated
     */

    Adapter.prototype.isolated = false;


    /**
     * @param {String} [engine=Adapter.supportedEngines[0]] If you need to use a
       particular engine to compile/render with, then specify it here. Otherwise
       we use whatever engine you have installed.
     */

    function Adapter(engineName1, customPath) {
      var i, len, ref, ref1;
      this.engineName = engineName1;
      if (!this.supportedEngines || this.supportedEngines.length === 0) {
        this.supportedEngines = [this.name];
      }
      if (this.engineName != null) {
        if (ref = this.engineName, indexOf.call(this.supportedEngines, ref) < 0) {
          throw new Error("engine '" + this.engineName + "' not supported");
        }
        this.engine = requireEngine(this.engineName, customPath);
      } else {
        ref1 = this.supportedEngines;
        for (i = 0, len = ref1.length; i < len; i++) {
          this.engineName = ref1[i];
          try {
            this.engine = requireEngine(this.engineName, customPath);
          } catch (error) {
            continue;
          }
          return;
        }
        throw new Error("'tried to require: " + this.supportedEngines + "'.\nNone found. Make sure one has been installed!");
      }
    }


    /**
     * Render a string to a compiled string
     * @param {String} str
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.render = function(str, opts) {
      if (opts == null) {
        opts = {};
      }
      if (!this._render) {
        return W.reject(new Error('render not supported'));
      }
      return this._render(str, opts);
    };


    /**
     * Render a file to a compiled string
     * @param {String} file The path to the file
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.renderFile = function(file, opts) {
      if (opts == null) {
        opts = {};
      }
      opts = clone(opts, true);
      return readFile(file, 'utf8').then(partialRight(this.render, Object.assign({
        filename: file
      }, opts)).bind(this));
    };


    /**
     * Compile a string to a function
     * @param {String} str
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.compile = function(str, opts) {
      if (opts == null) {
        opts = {};
      }
      if (!this._compile) {
        return W.reject(new Error('compile not supported'));
      }
      return this._compile(str, opts);
    };


    /**
     * Compile a file to a function
     * @param {String} file The path to the file
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.compileFile = function(file, opts) {
      if (opts == null) {
        opts = {};
      }
      return readFile(file, 'utf8').then(partialRight(this.compile, Object.assign({
        filename: file
      }, opts)).bind(this));
    };


    /**
     * Compile a string to a client-side-ready function
     * @param {String} str
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.compileClient = function(str, opts) {
      if (opts == null) {
        opts = {};
      }
      if (!this._compileClient) {
        return W.reject(new Error('client-side compile not supported'));
      }
      return this._compileClient(str, opts);
    };


    /**
     * Compile a file to a client-side-ready function
     * @param {String} file The path to the file
     * @param {Object} [opts = {}]
     * @return {Promise}
     */

    Adapter.prototype.compileFileClient = function(file, opts) {
      if (opts == null) {
        opts = {};
      }
      return readFile(file, 'utf8').then(partialRight(this.compileClient, Object.assign(opts, {
        filename: file
      })).bind(this));
    };


    /**
     * Some adapters that compile for client also need helpers, this method
       returns a string of minfied JavaScript with all of them
     * @return {Promise} A promise for the client-side helpers.
     */

    Adapter.prototype.clientHelpers = void 0;

    return Adapter;

  })();

  requireEngine = function(engineName, customPath) {
    var engine, err;
    if (customPath != null) {
      engine = require(resolve.sync(path.basename(customPath), {
        basedir: customPath
      }));
      engine.__accord_path = customPath;
    } else {
      try {
        engine = require(engineName);
        engine.__accord_path = resolvePath(engineName);
      } catch (error) {
        err = error;
        throw new Error("'" + engineName + "' not found. make sure it has been installed!");
      }
    }
    try {
      if (!engine.version) {
        engine.version = require(engine.__accord_path + '/package.json').version;
      }
    } catch (error) {
      err = error;
    }
    return engine;
  };


  /**
   * Get the path to the root folder of a node module, given its name.
   * @param  {String} name The name of the node module you want the path to.
   * @return {String} The root folder of node module `name`.
   * @private
   */

  resolvePath = function(name) {
    var filepath;
    filepath = require.resolve(name);
    while (true) {
      if (filepath === '/') {
        throw new Error("cannot resolve root of node module " + name);
      }
      filepath = path.dirname(filepath);
      if (fs.existsSync(path.join(filepath, 'package.json'))) {
        return filepath;
      }
    }
  };

  module.exports = Adapter;

}).call(this);
