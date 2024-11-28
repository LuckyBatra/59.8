const express= require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema}=require("../schema.js");
const Listing = require("../Models/listing.js");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js"); 



//Index Route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});


//New Route
router.get("/new", isLoggedIn, (req, res)=> {
  if (!req.isAuthenticated()) {
    req.flash("error", "you must be logged in to create a new listing");
    return res.redirect("/login");
  }  
  res.render("listings/new.ejs");
});



// Show Route with error handling and potential template data
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    try {
      const listing = await Listing.findById(id).populate("reviews").populate("owner") ;
      if (!listing) {
        return res.status(404).send("Listing not found."); // Handle not found case
      }
      // You can add additional data for the template here (optional)
      res.render("listings/show.ejs", { listing }); // Use 'listing'
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error"); // Handle unexpected errors
    }
  });

// Create Route
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const newListing = new Listing (req.body.listing);     
        //console.log(req.user);
        newListing.owner = req.user._id; 
        await newListing.save();
    req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
    });
    


//Edit Route
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const { id } = req.params;
  
    try {
      const listing = await Listing.findById(id);
  
      if (!listing) {
        return res.status(404).render("error", { message: "Listing not found" });
      }
  
      // Implement authorization checks here (e.g., check user roles, permissions)
  
      res.render("listings/edit.ejs", { listing });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", { message: "Internal server error" });
    }
  });

  // Update Route
 router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, price, country, location } = req.body.listing;

        const updatedListing = await Listing.findByIdAndUpdate(id, {
            title,
            description,
            image: { url: imageUrl },
            price,
            country,
            location
        }, { new: true });

        if (!updatedListing) {
            return res.status(404).send("Listing not found.");
        }
        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

//Delete Route
    router.delete("/:id", async (req,res ) =>  {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete (id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    });

    module.exports = router;