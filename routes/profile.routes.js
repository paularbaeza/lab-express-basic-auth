const router = require("express").Router();
const isLoggedIn = require("../middleware/auth");

router.get("/private", isLoggedIn, (req, res, next) => {
  res.render("profile/private.hbs");
});

module.exports = router;
