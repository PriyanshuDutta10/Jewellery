
require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");

const dbUrl= process.env.ATLASDB_URL;
const MongoStore=require("connect-mongo");
const path=require("path");
const methodOverride = require("method-override");
const Listing=require("./models/listing");
const User=require("./models/user");
const ejsMate =require("ejs-mate");
const wrapAsync =require("./utils/wrapAsync");
const ExpressError=require("./utils/ExpressError");
const listingSchema=require("./schema")
const session =require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy=require("passport-local");
const multer=require("multer");
const {storage}=require("./cloudConfig");
const upload=multer({storage});
const {isLoggedIn,isOwner,saveRedirectUrl}=require("./middleware")

main().then(()=>{
    console.log("connected to database")
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24 * 3600,

})

store.on("error",()=>{
    console.log("Error in mongo session",err)
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7 * 24 * 60 * 60 *1000,
        maxAge:7 * 24 * 60 * 60 *1000,
        httpOnly:true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser= req.user;
    next();
});





app.get("/login",wrapAsync(async(req,res)=>{
    res.render("users/login.ejs");
}));
app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),wrapAsync(async(req,res)=>{
    res.redirect("/");
}));

app.get("/logout",wrapAsync(async(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        res.redirect("/");
    })
}));


app.get("/listings/new",isLoggedIn,wrapAsync(async(req,res)=>{
  res.render("listings/new.ejs");
}));

app.post("/listings",isLoggedIn,upload.single("listing[image]"),wrapAsync(async(req,res)=>{
    let link=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    let url = link.replace("/upload","/upload/w_1000,f_auto");
    newListing.image={url,filename};
    
    await newListing.save();
    
    res.redirect("/");
}));

app.get("/listings/:id",wrapAsync(async(req,res)=>{
   let {id}=req.params;
   const listing =await Listing.findById(id);
   if(!listing){
   
    res.redirect("/listings");
   }
res.render("listings/show.ejs",{listing});
}));

app.get("/listings/:id/edit",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing =await Listing.findById(id);
    if(!listing){
    
        res.redirect("/");
    }
    res.render("listings/edit.ejs",{listing});
}));

app.put("/listings/:id",isLoggedIn,upload.single("listing[image]"),wrapAsync(async(req,res)=>{
let {id}=req.params;
let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
}


res.redirect("/");
}));

app.delete("/listings/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndDelete(id);
    
    res.redirect("/listings")
}));


////ladieschain

app.get("/listings/ladieschain/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladieschain"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"ladieschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladieschain/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladieschain"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"ladieschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladieschain/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladieschain"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"ladieschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladieschain/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladieschain"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"ladieschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladieschain/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladieschain"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"ladieschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

////gentschain

app.get("/listings/gentschain/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentschain"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"gentschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentschain/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentschain"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"gentschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentschain/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentschain"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"gentschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentschain/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentschain"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"gentschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentschain/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentschain"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"gentschain"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

////necklace

app.get("/listings/necklace/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"necklece"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/necklace/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"necklece"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"necklece"})).length;
    res.render("listings/index.ejs",{listingtotal});
}))
app.get("/listings/necklace/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"necklece"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/necklace/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"necklece"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/necklace/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"necklece"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

///// choker

app.get("/listings/choker/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"choker"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"choker"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/choker/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"choker"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"choker"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/choker/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"choker"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"choker"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/choker/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"choker"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"choker"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/choker/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"choker"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"choker"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

///// pearl

app.get("/listings/pearl/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pearlchoker/necklece"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"pearlchoker/necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pearl/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pearlchoker/necklece"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"pearlchoker/necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pearl/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pearlchoker/necklece"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"pearlchoker/necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pearl/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pearlchoker/necklece"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"pearlchoker/necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pearl/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pearlchoker/necklece"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"pearlchoker/necklece"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

///// gentsring

app.get("/listings/gentsring/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentsring"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"gentsring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentsring/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentsring"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"gentsring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentsring/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentsring"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"gentsring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentsring/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentsring"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"gentsring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/gentsring/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"gentsring"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"gentsring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

///// ladiesring

app.get("/listings/ladiesring/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladiesring"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"ladiesring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladiesring/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladiesring"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"ladiesring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladiesring/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladiesring"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"ladiesring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladiesring/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladiesring"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"ladiesring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/ladiesring/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"ladiesring"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"ladiesring"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

////  bracelet

app.get("/listings/bracelet/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bracelet"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"bracelet"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bracelet/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bracelet"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"bracelet"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bracelet/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bracelet"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"bracelet"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bracelet/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bracelet"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"bracelet"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bracelet/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bracelet"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"bracelet"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

//// bangle

app.get("/listings/bangle/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bangle"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"bangle"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bangle/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bangle"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"bangle"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bangle/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bangle"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"bangle"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bangle/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bangle"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"bangle"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/bangle/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"bangle"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"bangle"})).length;
    res.render("listings/index.ejs",{listing,total});
}))



//// mantasha

app.get("/listings/mantasha/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"mantasha"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"mantasha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/mantasha/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"mantasha"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"mantasha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/mantasha/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"mantasha"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"mantasha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/mantasha/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"mantasha"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"mantasha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/mantasha/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"mantasha"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"mantasha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))



///// sankha

app.get("/listings/sankha/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"sankha"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"sankha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/sankha/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"sankha"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"sankha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/sankha/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"sankha"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"sankha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/sankha/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"sankha"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"sankha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/sankha/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"sankha"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"sankha"})).length;
    res.render("listings/index.ejs",{listing,total});
}))




///////  pola

app.get("/listings/pola/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pola"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"pola"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pola/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pola"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"pola"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pola/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pola"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"pola"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pola/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pola"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"pola"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pola/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pola"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"pola"})).length;
    res.render("listings/index.ejs",{listing,total});
}))


/////// earing

app.get("/listings/earing/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"earing"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"earing"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/earing/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"earing"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"earing"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/earing/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"earing"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"earing"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/earing/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"earing"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"earing"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/earing/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"earing"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"earing"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

/////  pendent

app.get("/listings/pendent/pg1",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pendent"})).reverse().slice(0,20);
    let total=(await Listing.find({category:"pendent"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pendent/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pendent"})).reverse().slice(20,40);
    let total=(await Listing.find({category:"pendent"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pendent/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pendent"})).reverse().slice(40,60);
    let total=(await Listing.find({category:"pendent"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pendent/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pendent"})).reverse().slice(60,80);
    let total=(await Listing.find({category:"pendent"})).length;
    res.render("listings/index.ejs",{listing,total});
}))
app.get("/listings/pendent/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({category:"pendent"})).reverse().slice(80,100);
    let total=(await Listing.find({category:"pendent"})).length;
    res.render("listings/index.ejs",{listing,total});
}))

//trending
app.get("/",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(0,20);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg2",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(20,40);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg3",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(40,60);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg4",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(60,80);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg5",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(80,100);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg6",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(100,120);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg7",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(120,140);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg8",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(140,160);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg9",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(160,180);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))
app.get("/listings/pg10",wrapAsync(async(req,res)=>{
    let listing = (await Listing.find({trending:"yes"})).reverse().slice(180,200);
    let total=(await Listing.find({trending:"yes"})).length;
    res.render("trending/trending.ejs",{listing,total});
}))




//footer

app.get("/contactus",wrapAsync(async(req,res)=>{
    res.render("extra/contactus.ejs")
}))
app.get("/aboutus",wrapAsync(async(req,res)=>{
    res.render("extra/aboutus.ejs")
}))
app.get("/privacypolicy",wrapAsync(async(req,res)=>{
    res.render("extra/privacypolicy.ejs")
}))
app.get("/scamalert",wrapAsync(async(req,res)=>{
    res.render("extra/scamalert.ejs")
}))
app.get("/store",wrapAsync(async(req,res)=>{
    res.render("extra/store.ejs")
}))
app.get("/terms&condition",wrapAsync(async(req,res)=>{
    res.render("extra/terms&condition.ejs")
}))








app.use((err,req,res,next)=>{
    let{statusCode=500,message="Some Error Occured"}=err;
    console.log(message);
    res.render("error.ejs",{err});
});

app.listen(8080,()=>{
    console.log("server is listening to the port");
})
