const passport = require('passport');
const passportJwt = require('passport-jwt');

const secret = 'PalavraSecreta2023';

const { Strategy, ExtractJwt } = passportJwt;

module.exports = (app) => {
  const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const strategy = new Strategy(params, (payload, done) => {
    const userIdToSearch = payload.userId || payload.id;
    app.services.user.findOne({ id: userIdToSearch })
      .then((user) => {
        if (user) done(null, { ...payload });
        else done(null, false);
      }).catch((err) => done(err, false));
  });

  passport.use(strategy);

  return {
    authenticate: () => passport.authenticate('jwt', { session: false }),
  };
};
