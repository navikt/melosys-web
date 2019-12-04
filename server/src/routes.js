import express from 'express';
import passport from 'passport';
import session from 'express-session';

import config from './config';
import reverseProxy from './proxy/reverse-proxy';
import authUtils from './auth/utils';

const router = express.Router();

const updateUserTokenSet = (tokenSet, req) => {
  req.user.tokenSet.access_token = tokenSet.access_token || req.user.tokenSet.access_token;
  req.user.tokenSet.refresh_token = tokenSet.refresh_token || req.user.tokenSet.refresh_token;
  req.user.tokenSet.id_token = tokenSet.id_token || req.user.tokenSet.id_token;
};

const ensureAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else if (req.isAuthenticated() && authUtils.hasExpiredTokenSets(req)) {
    await authUtils.renewTokenSets();
    next();
  } else {
    session.redirectTo = req.url;
    res.redirect('/login');
  }
};

const setup = authClient => {
  // Unprotected
  router.get('/isAlive', (req, res) => res.send('Alive'));
  router.get('/isReady', (req, res) => res.send('Ready'));

  router.get('/login', passport.authenticate('azureOidc', { failureRedirect: '/login' }));
  router.use('/callback', passport.authenticate('azureOidc', { failureRedirect: '/login' }), (req, res) => {
    if (session.redirectTo) {
      res.redirect(session.redirectTo);
    } else {
      res.redirect('/');
    }
  });

  router.use(ensureAuthenticated);

  // Protected
  router.get('/', (req, res) => {
    res.json(req.user);
  });

  router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
  });

  router.get('/refresh', (req, res) => {
    authUtils.renewTokenSets(authClient, req.user.tokenSet.refresh_token)
      .then(tokenSet => {
        updateUserTokenSet(tokenSet, req);
        res.json(req.user);
      })
      .catch(err => {
        console.error(err); // TODO: Bruk frontendlogger
        res.redirect('/logout');
      });
  });

  // Set up reverse proxy for a given prefix that proxies matching requests to the downstream API
  router.use(`/${config.downstreamApi.prefix}/*`, reverseProxy.setup(authClient));

  router.use('/*', (req, res) => {
    res.status(404).send('Not found');
  });

  return router;
};

export default { setup };
