(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _insertion = require('shared/insertion');

var _insertion2 = _interopRequireDefault(_insertion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

try {
  var insertion = function (_CoreInsertion) {
    _inherits(insertion, _CoreInsertion);

    function insertion() {
      _classCallCheck(this, insertion);

      return _possibleConstructorReturn(this, (insertion.__proto__ || Object.getPrototypeOf(insertion)).call(this));
    }

    return insertion;
  }(_insertion2.default);

  new insertion();
} catch (e) {
  console.log('CRITICAL ERROR');
  console.log(e);
}

},{"shared/insertion":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Messaging = require('../Messaging');

var _Messaging2 = _interopRequireDefault(_Messaging);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdBlocker = function AdBlocker() {
  _classCallCheck(this, AdBlocker);

  _Messaging2.default.send('AdBlocker', 'domRules', {}, function (selectors) {
    if (selectors === false) return;
    var elements = document.querySelectorAll(selectors);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var element = _step.value;

        element.parentElement.removeChild(element);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
};

exports.default = AdBlocker;

},{"../Messaging":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Messaging = function () {
  function Messaging() {
    _classCallCheck(this, Messaging);
  }

  _createClass(Messaging, null, [{
    key: "send",
    value: function send(from, method, message, callback) {
      if (!browser || !browser.runtime || !browser.runtime.sendMessage) return;

      browser.runtime.sendMessage({ from: from, method: method, message: message }, function (response) {
        if (!callback) return;

        callback(response);
      });
    }
  }]);

  return Messaging;
}();

exports.default = Messaging;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AdBlocker = require('./AdBlocker');

var _AdBlocker2 = _interopRequireDefault(_AdBlocker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.browser = window.browser ? window.browser : window.chrome ? window.chrome : {};

var insertion = function insertion() {
  _classCallCheck(this, insertion);

  new _AdBlocker2.default();
};

exports.default = insertion;

},{"./AdBlocker":2}]},{},[1]);
