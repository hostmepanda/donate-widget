'use strict';

const ALLOWED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'RUB',
];

const MONGOOSE_DEFAULT_OPTS = {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      Reflect.deleteProperty(ret, '_id');
      Reflect.deleteProperty(ret, 'createdAt');
      Reflect.deleteProperty(ret, 'updatedAt');
      Reflect.deleteProperty(ret, '__v');
      return ret;
    },
  },
};

module.exports = {
  ALLOWED_CURRENCIES,
  MONGOOSE_DEFAULT_OPTS,
};
