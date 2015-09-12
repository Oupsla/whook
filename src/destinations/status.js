import YError from 'yerror';
import Destination from '../destination';

export default class Headers extends Destination {
  constructor(res, name = 'status') {
    super(res, name);
    this._status = 0;
  }
  set(name, value) {
    if('number' !== typeof value || 100 > value || 699 < value) {
      throw new YError('E_BAD_STATUS', typeof value, value);
    }
    this._status = value;
  }
  finish() {
    this._res.statusCode = this._status || 404;
  }
}
