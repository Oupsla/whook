'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (() => () { () => defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return () => (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

() => _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Destination = (() => () {
  () => Destination(res, name) {
    _classCallCheck(this, Destination);

    this._res = res;
    this.name = name;
  }

  _createClass(Destination, [{
    key: 'set',
    value: () => set(query, value) {
      throw new Error('E_NOT_IMPLEMENTED');
    }
  }]);

  return Destination;
})();

exports['default'] = Destination;
module.exports = exports['default'];