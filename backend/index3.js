'use strict';
const express    = require('express'); 
const router 	 = express.Router();        
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const app        = express();                 
const User       = require('./models/soldier')

mongoose.connect('mongodb://localhost/soldiers', {useNewUrlParser: true});

app.use(bodyParser.urlencoded({entended:true,limit:'10mb'}));
app.use(bodyParser.json({limit:'10mb'}));

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const port = process.env.PORT || 8888;    

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Resource-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "*");
	next();
})
app.get('/', (req, res) => {
    res.json({ message: 'welcome to project!' });   
});

app.listen(port, () => {
    console.log('starting port ' + port)}
);

app.use('/api', router);

router.get('/', (req, res) => {
    res.json({ message: 'welcome to our api!' });   
});

let sortAll = (req,res,index) => {
    User.find().sort({index: 1}).exec(function(err, users){
               if(err) console.log(err);
                {res.status(200);    
                res.json(users);
              };});
}

router.get('/sort', (req, res) => {
    sortAll(req,res,req.params.sort); 
})

let search = (req, res, condition) => {
    var where = ({"$or":[{'name':/condition/} , {'sex':/condition/}, {'date':/condition/} ,{'rank':/condition/} , {'phone':/condition/}]})   
      User.find(where).exec(function(err, users){
               if(err) console.log(err);
                {res.status(200);    
                res.json(users);
              };
});
}
 router.get('/find', (req, res) => {
        search(req,res,req.params.search); 
    })
    

router.post('/users', (req, res) => {
    createOne (req,res);
/*    let user=new User();
        user.name=req.body.name
        user.rank=req.body.rank
        user.date=req.body.date
        user.phone=req.body.phone 
        user.sex=req.body.sex  
        user.email=req.body.email
        user.superiorid=req.body.superiorid
        user.avatar=req.body.avatar
        user.ds=req.body.ds
        user.sub=[]           
            if (req.body.superior)  { User.superior=req.body.superior;}
                user.save((err,doc)=>{
                    if (err) res.json(err);
                    res.json(doc);
}); */
});

let createOne = (req, res) => {
    var data = { 
        name:req.body.name,
        rank: req.body.rank, 
        date: req.body.date,
        phone:req.body.phone, 
        sex:req.body.sex , 
        email:req.body.email,
        superior:req.body.superior,
        avatar:req.body.avatar,
        ds:req.body.ds,
        sub :[] };
    User.create(
        data, 
        function(err, newItem) {         
            if (data.superior)  { 
                User.find({"_id": req.body.superior}, (err, item)=>{
                    if (err){ res.status(500);console.log(err);return;};     
                    if(item){
                       const dsNumber=item[0].ds+1;
                       const newArray = [...item[0].sub, JSON.stringify(newItem._id) ]
                        User.findOneAndUpdate({'_id' : req.body.superior}, { ds: dsNumber, sub : newArray },(err) => {                        
                            if (err){ res.status(500);console.log(err);return;};                       
                            res.status(200);
                            res.json('');      
                        });
                    }               
                })               
            }else{
                res.status(200);
                res.json('');
            }             
        }
    );
};

router.get('/users', (req, res) => {
    getAll(req, res);
});

let getAll = (req, res) => {
    User.find().exec(function(err, users){
      res.status(200);    
      res.json(users);
    });
};
router.get('/users/:user_id', (req, res) => {
    getOne(req, res, req.params.user_id);
});

let getOne = (req, res, id) => {
    User.find({"_id": id}, function(err, users) {
        res.status(200);    
        res.json(users);
      });
}   

router.put('/users/:user_id', (req, res) => {
    editOne(req, res, req.params.user_id);
});

router.delete('/users/:user_id', (req, res) => {
    deleteOne(req, res, req.params.user_id);
});

 router.get('/users:pageNo',(req,res)=>{
    User.paginate({ },{page:req.params.pageNo, limit:5},function(err,result){
        if (err){res.json(err)};
        res.json(result.docs);
    })
})


router.route('/updatesub/:_id').put((req,res)=>{
    if(req.params._id){
        User.findById(req.params._id),(err,record)=>{
            if (err) res.json(err);
            record.directReports.push({reports:req.body.id});
            record.save(err=>{
                if (err) res.json(err);
                res.json('');
            })
        }
    }
})


/* let editOne = (req, res, id) => {
    const data = {
        rank: req.body.rank, 
        date: req.body.date,
        phone:req.body.phone, 
        sex:req.body.sex , 
        email:req.body.email,
        superior:req.body.superior,
        superiorid:req.body.superiorid,
        name:req.body.name,
        avatar:req.body.avatar,
        ds:req.body.ds,
    }
    User.findOneAndUpdate({'_id' : id},{$set : data},{new:true},(error,doc) => { 
        if(error){
            res.status(555).json(`user with id ${id} is not found!`);return;
    }
            res.status(200).json(`user with id ${id} is update.`);   
    }); 
}; */


let editOne = (req, res, id) => {
    const data = {
        rank: req.body.rank, 
        date: req.body.date,
        phone:req.body.phone, 
        sex:req.body.sex , 
        email:req.body.email,
        superior:req.body.superior,
        name:req.body.name,
        avatar:req.body.avatar,
        ds:req.body.ds,
        sub:req.body.sub,
    }
         Users.findById(id, (err, originalData) => {
            if (err)  {res.json(err)}      
            const originName = originalData.superior.name ? originalData.superior.name.toString() : null;
            const originId = originalData.superior._id ? originalData.superior._id.toString() : null;

            if ((originName === data.superior.name && originId === data.superior._id)) {
                Users.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                    if (err) {res.json(err)}
                    res.status(200);});
            } else {
                if (originalData.superior.name === null && originalData.superior._id === null) {
                    Users.findByIdAndUpdate(data.superior._id, { $push: { sub: { _id: id } } }, { useFindAndModify: false }, (err) => {
                        if (err) {res.json(err)}
                        Users.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                            if (err) {res.json(err)}
                            res.status(200);
                        });
                    });
                } else {
                    Users.updateOne({ _id: originalData.superior._id }, { $pull: { sub: { _id: id } } }, (err) => {
                        if (err) {res.json(err)}
                        Users.findByIdAndUpdate(data.superior._id, { $push: { sub: { _id: id } } }, { useFindAndModify: false }, (err) => {
                            if (err) {res.json(err)}
                            Users.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                                if (err) {res.json(err)}
                                res.status(200);
                            });
                        });
                    });
                }
            }
        })
    }

/* let deleteOne = (req, res, id) => {
    User.findById(req.params._id),(err,doc)=>{
       if (err) res.json(err);
       else{
           if(!doc.superior && doc.ds.length===0){
    User.deleteOne({_id: id}, function(err,data)
{   if(err){
            res.status(555).json(`user with id ${id} is not found!`);return;
    }
            res.status(200).json(`user with id ${id} is deleted.`);           
           
});
};
       }else if (doc.superior && doc.ds.length ===0){
           User.findById(doc.superior,(err,result)=>{
               if(err) {res.json(err)}
               else{
                   let newDS= result.ds.filter(ele.toString()!=req.params._id);
                   User.findByIdAndUpdate(doc.superior,{ds:newDS},(err,result)=>{
                       if (err){res.json(err)}
                       else{
                           User.findByIdAndDelete(req.params._id,(err,doc)={
                               if(err){res.json(err)}
                               else{
                                   res.json(doc)}
                           })
                       }
                   })
               }
           })
       }

    else if(!doc.superior &&doc.ds.length>0){
        for (let i=0;i<doc.ds.length;i++){
            User.findByIdAndUpdate(doc.ds[i],(err,result)=>{
                if (err){res.json(err)
                }
            })
        }
        User.findByIdAndDelete(req.params._id,(err,result)={
            if(err){res.json(err)}
            else{
                res.json(result);
            }
        })
    }
    else{
        for(let i=0;i<doc.ds.length;i++){
            User.findByIdAndUpdate(doc.ds[i],{superior:doc.superior},(err.result)=>{
                if (err) res.json(err)
            })
        }
    }
 */


let deleteOne = (req, res, id) => {
    User.deleteOne({_id: id}, function(error,data)
{
    if(error){
            res.status(555).json(`user with id ${id} is not found!`);return;
    }
            res.status(200).json(`user with id ${id} is deleted.`);    
});
};
