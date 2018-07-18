const fs = require('fs-extra');

const takeSnapshot = name => {
  let heapdump;
  try {
    heapdump = requie('heapdump');
  } catch (err) {
    return Promise.reject();
  }
  return new Promise((resolve, reject) => {
    heapdump.writeSnapshot(
      `snapshots/${name}.heapsnapshot`,
      (err, filename) => {
        if (err) return reject(err);
        resolve(filename);
      },
    );
  });
};

let testApp;

module.exports = {
  ssr: {
    server(app) {
      testApp = app;

      fs.ensureDirSync('snapshots');

      app.use(async (ctx, next) => {
        if (/^\/heapdump/.test(ctx.url)) {
          await takeSnapshot(ctx.query.name || new Date().getTime());
          ctx.body = 'ok';
        } else {
          await next();
        }
      });
    },
  },
  plugins: { tests: '@/plugins/tests' },
};

const signals = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, () => {
    testApp.httpServer.close(() => {
      process.exit(0);
    });
  });
}
