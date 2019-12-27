let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = new Schema({
    b_name : {type:String, required:true},
    b_cover : {type:String},
    b_author : {type:String, required:true},
    b_price : {type:Number, required:true},
    b_ISBN : {type:String, required:true},
    b_tag : {type:String, required:true},
    b_story : {type:String, required:true},
    b_date : {type:Date},
    b_page : {type:Number}
    }
);

module.exports = mongoose.model('Product',schema);