const express = require("express");
const User = require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});



router.post(
    "/signup", 
    wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User ({ email, username});
        const registeredUser = await User.register( newUser, password );
        console.log(registeredUser); // for see the hash and salt work
        req.login(registeredUser , (err) => {
            if (err) {
                return next(err);
            }
        req.flash("success", "Welcome to WonderLust");
        res.redirect("/listings");
    });
 } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
})
);

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true, }),
//     async (req, res) => {
//         //res.send("Welccome to WanderLust! You are logged in!!!!");
// req.flash("success", "Welcome back to wonderlust");
// res.redirectUrl = res.locals.redirectUrl || "/listings";
//         //res.redirect(redirectUrl);
//     }
// );

// router.post(
//     "/login",
//     saveRedirectUrl,
//     passport.authenticate("local", {
//       failureRedirect: "/login",
//       failureFlash: true,
//     }),
//     async (req, res) => {
//       req.flash("success", "Welcome back to WanderLust");
//       const redirectUrl = res.locals.redirectUrl || "/listings"; // Correct usage of a variable
//       res.redirect(redirectUrl); // Correctly redirect using the variable
//     }
//   );

// router.post(
//     "/login",
//     passport.authenticate("local", {
//       failureRedirect: "/login",
//       failureFlash: true,
//     }),
//     (req, res) => {
//       req.flash("success", "Welcome back to WanderLust!");
//       //const redirectUrl = res.locals.redirectUrl || "/listings"; // Use the saved redirect URL or fallback to default
//       res.redirect(redirectUrl);
//     }
//   );

// router.post(
//     "/login",
//     passport.authenticate("local", {
//       failureRedirect: "/login", // Redirect to login on failure
//       failureFlash: true,        // Flash failure message
//     }),
//     (req, res) => {
//       req.flash("success", "Welcome back to WanderLust!");
//       res.redirect("/listings"); // Always redirect to /listings
//     }
//   );
router.post(
    "/login",
    saveRedirectUrl, // Middleware to prepare redirectUrl
    passport.authenticate("local", {
      failureRedirect: "/login", // Redirect to login on failure
      failureFlash: true,        // Flash failure message
    }),
    (req, res) => {
      req.flash("success", "Welcome back to WanderLust!");
      const redirectUrl = res.locals.redirectUrl || "/listings"; // Fallback to /listings
      res.redirect(redirectUrl);
    }
  );
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
});

    module.exports = router;