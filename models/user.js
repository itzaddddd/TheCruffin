let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let passportLocalMongoose = require('passport-local-mongoose');

let schema = new Schema({
    username : {type:String},
    password : {type:String},
    email : {type:String},
    firstname : {type:String},
    lastname : {type:String},
    gender : {type:String},
    address : {
        house_no : {type:String},
        village : {type:String},
        village_no : {type:String},
        lane : {type:String},
        road : {type:String},
        province : {type:String},
        district : {type:String},
        sub_district : {type:String},
        postal_code : {type:String}
    },
    contact_name : {type:String},
    phone : {type:String},
    isAdmin : {type:Boolean, default:false}
    },
);

schema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',schema);
