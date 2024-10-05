const config = require('./config');

const app = require('./app');

app.listen(config.NODE_PORT, () => {
  // console.log(`Listening on ${config.NODE_PORT}`);
});
