(function(p,c,e){function r(n){if(!c[n]){c[n]={exports:{}};p[n][0](function(x){return r(p[n][1][x])},c[n],c[n].exports);}return c[n].exports}for(var i=0;i<e.length;i++)r(e[i]);return r})({"a1b5af78":[function(require,module,exports){console.log(require('./foo')(5))},{"./foo":"b8f69fa5"}],"b8f69fa5":[function(require,module,exports){module.exports = function (n) { return n * 111 }},{}]},{},["a1b5af78","b8f69fa5"])