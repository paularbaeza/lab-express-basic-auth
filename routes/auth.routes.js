const router = require("express").Router();
const User = require("../models/User.model.js");
const bcrypt = require("bcryptjs");

//GET "/auth/signup" => Formulario de registro de usuario

router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});

//POST "/auth/signup" => reciba la info y cree el usuario en la BD
router.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  if (username === "" || email === "" || password === "") {
    res.render("auth/signup.hbs", {
      error: "Fill all the fields",
    });
    return;
  }

  const passRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/;
  if (passRegex.test(password) === false) {
    res.render("auth/signup.hbs", {
      error:
        "Password must contain at least 8 characters, 1 Uppercase, 1 Lowercase, 1 Number and 1 Special character",
    });
    return;
  }

  try {
    const foundUser = await User.findOne({ email });
    if (foundUser !== null) {
      res.render("auth/signup.hbs", {
        error: "This email is already registered",
      });
      return;
    }

    const foundUsername = await User.findOne({ username });
    if (foundUsername !== null) {
      res.render("auth/signup.hbs", {
        error: "This username is already registered",
      });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.redirect("/auth/login");
    console.log();
  } catch (err) {
    next(err);
  }
});

//GET "/auth/login" => renderizar formulario de login
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});

//POST "/auth/login" => comprobar los datos de usuario y entrar a la app
router.post("/login", async (req, res, next) => {
  const { access, password } = req.body;

  if (access === "" || password === "") {
    res.render("auth/login.hbs", { error: "Fill all the fields" });
    return;
  }

  try {
    const foundUser = await User.findOne({
      $or: [{ username: access }, { email: access }],
    });

    if (foundUser === null) {
      res.render("auth/login.hbs", {
        error: "User not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (isPasswordValid === false) {
      res.render("auth/login.hbs", {
        error: "Invalid password",
      });
      return;
    }

    req.session.user = {
      _id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
    };

    req.session.save(() => {
      res.redirect("/main");
    });
  } catch (err) {
    next(err);
  }
});

// GET "/auth/logout" => cerrar sesion
router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
