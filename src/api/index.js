'use strict';
const path = require('path');
const koaStatic = require('koa-static');
const mount = require('koa-mount');
const koaBody = require('koa-body');
const Router = require('koa-router');
const Koa = require('koa2');

const { ALLOWED_CURRENCIES } = require('../lib/constants');
const { Donation } = require('./models');
const router = new Router();
const app = new Koa();
const publicFolder = new Koa();
const LISTEN_PORT = process.env.LISTEN_PORT || 3000;

publicFolder.use(koaStatic(path.join(__dirname, '/public')));

router.post('/donate', koaBody({ json: true }),
  async (ctx, next) => {
    console.log(ctx.request.body);
    try {
      const { amount = 0, currency } = ctx.request.body;
      if (Number(amount) <= 0) {
        ctx.response.status = 400;
        ctx.response.body = { ok: false };
        return next();
      }
      if (!ALLOWED_CURRENCIES.includes(`${currency.trim().toUpperCase()}`)) {
        ctx.response.status = 400;
        ctx.response.body = { ok: false };
        return next();
      }
      const donation = new Donation({ amount, currency });
      await donation.save();
      console.log('🎉 New donation added: ', donation.toJSON());
      ctx.response.status = 200;
      ctx.response.body = { ok: true };
    } catch (err) {
      console.error(err.message);
      ctx.response.status = 400;
      ctx.response.body = { ok: false };
    }
  });

app.use(mount('/', publicFolder))
app.use(router.routes());
app.listen(LISTEN_PORT);
console.log(`Server is running on ${LISTEN_PORT}`);
