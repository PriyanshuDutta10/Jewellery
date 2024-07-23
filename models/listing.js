const { ref } = require("joi");
const mongoose=require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  
 name: {
    type:String,
 } ,
 image:{
url:String,
filename:String,
 },

  
  category:{
   type:String,
   required:true,
  },
  weight:{
   type:Number,
   required:true,
  },
// owner:{
//     type:Schema.Types.ObjectId,
//     ref:"User",
// },
trending: String,

owner:{
   type:Schema.Types.ObjectId,
   ref:"User",
}

});
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;