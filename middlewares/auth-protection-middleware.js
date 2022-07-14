function guardRoute(req, res, next) {
  if (!res.locals.isAuth) {
    return res.redirect("/401");
  }

  // This allows the request to move on to the next middleware in line:
  next();
}

module.exports = guardRoute;