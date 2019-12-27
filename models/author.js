let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    a_penname : {type:String,required:true},
    a_pic : {type:String},
    a_name : {type:String},
    a_interview : {type:String},
    a_phone : {type:String},
    a_email : {type:String},
    //a_join : {type:Date},
    a_book : [{type:String}]
});

module.exports = mongoose.model('Author',schema);