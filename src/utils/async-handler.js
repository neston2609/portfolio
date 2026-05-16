// Wrap an async route handler so a thrown error or rejected promise reaches
// Express's error middleware instead of crashing the process. Express 5 does
// this natively; we're on 4.x.

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Mutate a router/app in place so every method added afterwards is wrapped.
function wrapRouter(router) {
  for (const m of ['get', 'post', 'put', 'patch', 'delete']) {
    const orig = router[m].bind(router);
    router[m] = (path, ...handlers) => orig(path, ...handlers.map((h) =>
      typeof h === 'function' && h.constructor && h.constructor.name === 'AsyncFunction'
        ? asyncHandler(h) : h
    ));
  }
  return router;
}

module.exports = { asyncHandler, wrapRouter };
