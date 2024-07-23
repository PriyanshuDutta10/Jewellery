const Joi = require("joi");
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        name:Joi.string().allow("",null),
        image:Joi.string().allow("",null),
        category:Joi.string().required(),
        weight:Joi.string().required(),
        trending:Joi.string().required(),
    }).required(),

});