'use strict';
const mongoose = require('mongoose');

const { DonateSchema } = require('./Donate.model');

const DATA_BASE = process.env.DATA_BASE || 'mongodb://mongodb-dwidget/donate-widget-test';
const DONATIONS = 'donations';

const Donation = mongoose.model(DONATIONS, DonateSchema);

mongoose.connect(DATA_BASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection
  .on('error', (err) => {
    throw err.message;
  })
  .once('open', () => {
    console.log(`Successfully connected to ${ DATA_BASE }`);
  });

module.exports = {
  Donation,
};
