const router = require("express").Router();
const isLoggedIn = require("../middleware/auth")

router.get("/", isLoggedIn, (req,res,next) => {
    res.render("page/main.hbs")
})


module.exports = router;