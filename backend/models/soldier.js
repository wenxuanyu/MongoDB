'use strict';
const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

/*  const SoldierSchema   = new Schema({
    name: String,
    rank: String,
    date:String,
    phone:String,
	sex: String,
    email: String,
    superior:String,
    superiorid:{type:Schema.Types.ObjectId,ref:"Soldier"},
    avatar:String,
    ds:Number,
    sub:[String],
    directReports:[
        {report:{
            type:Schema.Types.ObjectId,
            ref:"Soldier"}}
    ]
}); */
const SoldierSchema   = new Schema({
    name: String,
    rank: String,
    date:String,
    phone:String,
	sex: String,
    email: String,
    superior: {name: String, _id: mongoose.Schema.Types.ObjectId},
    avatar:String,
    ds:Number,
    sub:[{_id: mongoose.Schema.Types.ObjectId}],
});
SoldierSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Soldier', SoldierSchema); 

