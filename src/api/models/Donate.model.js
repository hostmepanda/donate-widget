'use strict';
const { model, Schema } = require('mongoose');

const { MONGOOSE_DEFAULT_OPTS } = require('../../lib/constants');

const DONATES = 'Donates';

const DonateSchema = new Schema({
  amount: {
    type: Number,
    min: 0,
  },
  currency: {
    type: String,
    max: 10,
  },
}, {
  ...MONGOOSE_DEFAULT_OPTS
});

module.exports = {
  schema: model(DONATES, DonateSchema),
};
