'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/soldier')

mongoose.connect('mongodb://localhost/soldiers', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ entended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8888;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Resource-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
})
app.get('/', (req, res) => {
    res.json({ message: 'welcome to project!' });
});

app.listen(port, () => {
    console.log('starting port ' + port)
});

app.use('/api', router);

router.get('/', (req, res) => {
    res.json({ message: 'welcome to our api!' });
});

/* let sortAll = (req,res,index) => {
    User.find().sort({index: 1}).exec(function(err, users){
               if(err) console.log(err);
                {res.status(200);    
                res.json(users);
              };});
} */

router.get('/sort:index/:number', (req, res) => {
    //   sortAll(req,res,req.params.sort); 
    var oj = {};
    var keyword = req.params.index;
    oj[keyword] = req.params.number;
    console.log(oj);
    console.log(keyword);
    User.find().sort(oj).exec(function (err, users) {
        if (err) console.log(err);
        {
            res.status(200);
            res.json(users);
        };
    });
})
    

router.get('/find:key/sort:index/:number', (req, res) => {
    //   sortAll(req,res,req.params.sort); 
    var oj = {};
    var keyword = req.params.index;
    oj[keyword] = req.params.number;
    var keyword = req.params.key;
    var reg = new RegExp(keyword, 'i');
    var where = ({ "$or": [{ "name": { $regex: reg } }, { "sex": { $regex: reg } }, { "date": { $regex: reg } }, { 'rank': { $regex: reg } }, { 'phone': { $regex: reg } }] })
    console.log(oj);
    console.log(keyword);
    User.find(where).sort(oj).exec(function (err, users) {
        if (err) console.log(err);
        {
            res.status(200);
            res.json(users);
        };
    });
})


router.get('/users:pageNo', (req, res) => {
    User.paginate({}, { page: req.params.pageNo, limit: 5 }, function (err, result) {
        if (err) { res.json(err) };
        res.json(result.docs);
    })
})

router.get('/find:key', (req, res) => {
    var keyword = req.params.key;
    var reg = new RegExp(keyword, 'i');
    var where = ({ "$or": [{ "name": { $regex: reg } }, { "sex": { $regex: reg } }, { "date": { $regex: reg } }, { 'rank': { $regex: reg } }, { 'phone': { $regex: reg } }] })
    User.find((where), function (err, users) {
        if (err) console.log(err);
        {
            res.status(200);
            res.json(users);
        };
    });
})

router.post('/users', (req, res) => {
    createOne(req, res);
});

let createOne = (req, res) => {
    const newUserid = new mongoose.Types.ObjectId;
    var data = {
        _id: newUserid,
        name: req.body.name,
        rank: req.body.rank,
        date: req.body.date,
        phone: req.body.phone,
        sex: req.body.sex,
        email: req.body.email,
        superior: req.body.superior,
        avatar: req.body.avatar,
        ds: req.body.ds,
        sub: []
    };
    User.create(
        data,
        function (err, res) {
            if (err) { res.status(500); return; };
            if (data.superior._id === null) {
            } else {
                User.findByIdAndUpdate(data.superior._id, { $push: { sub: { _id: data._id } } }, { useFindAndModify: false }, (err) => {
                    if (err) {
                        console.error(err);
                    }
                })
            }
        });
    res.status(200).json('a new user is added!');
}

router.get('/users', (req, res) => {
    getAll(req, res);
});

let getAll = (req, res) => {
    User.find().exec(function (err, users) {
        res.status(200);
        res.json(users);
    });
};


router.get('/users/:user_id', (req, res) => {
    getOne(req, res, req.params.user_id);
});

let getOne = (req, res, id) => {
    User.find({ "_id": id }, function (err, users) {
        res.status(200);
        res.json(users);
    });
}

router.get('/users:pageNo', (req, res) => {
    User.paginate({}, { page: req.params.pageNo, limit: 5 }, function (err, result) {
        if (err) { res.json(err) };
        res.json(result.docs);
    })
})

router.put('/users/:user_id', (req, res) => {
    editOne(req, res, req.params.user_id);
});

let editOne = (req, res, id) => {
    const data = {
        _id: req.body._id,
        rank: req.body.rank,
        date: req.body.date,
        phone: req.body.phone,
        sex: req.body.sex,
        email: req.body.email,
        superior: req.body.superior,
        name: req.body.name,
        avatar: req.body.avatar,
        ds: req.body.ds,
        sub: req.body.sub,
    }
    User.findById(id, (err, originalData) => {
        if (err) { res.json(err) }
        const originName = originalData.superior.name ? originalData.superior.name.toString() : null;
        const originId = originalData.superior._id ? originalData.superior._id.toString() : null;
        const originMyName = originalData.name ? originalData.name.toString() : null;
        if (originMyName !== data.name) {
            const childrenIds = data.sub.map((ele, index) => {
                return ele._id;
            })
            User.updateMany({ _id: { $in: childrenIds } }, { $set: { superior: { name: data.name, _id: data._id } } }, (err) => {
                if (err) { res.json(err) };
            });
        }
        if ((originName === data.superior.name && originId === data.superior._id)) {
            console.log("case1");
            User.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                if (err) { res.json(err) };
                res.status(200);
            });
        } else {
            if (originalData.superior._id === null) {
                console.log('case2');
                User.findByIdAndUpdate(data.superior._id, { $push: { sub: { _id: id } } }, { useFindAndModify: false }, (err) => {
                    if (err) { res.json(err) };
                    User.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                        if (err) { res.json(err) };
                        res.status(200);
                    });
                });
            } else {
                User.updateOne({ _id: originalData.superior._id }, { $pull: { sub: { _id: id } } }, (err) => {
                    console.log('case3');
                    if (err) { res.json(err) };
                    User.findByIdAndUpdate(data.superior._id, { $push: { sub: { _id: id } } }, { useFindAndModify: false }, (err) => {
                        if (err) { res.json(err) };
                        User.findByIdAndUpdate(id, data, { useFindAndModify: false }, (err) => {
                            if (err) { res.json(err) };
                            res.status(200);
                        });
                    });
                });
            }
        }
    })
    res.status(200).json('  ');
}


/* let deleteOne = (req, res, id) => {
    User.deleteOne({_id: id}, function(error,data)
{
    if(error){
            res.status(555).json(`user with id ${id} is not found!`);return;
    }
            res.status(200).json(`user with id ${id} is deleted.`);    
});
}; */
router.delete('/users/:user_id', (req, res) => {
    deleteOne(req, res, req.params.user_id);
});

let deleteOne = (req, res, id) => {
    const data = {
        _id: req.body._id,
        rank: req.body.rank,
        date: req.body.date,
        phone: req.body.phone,
        sex: req.body.sex,
        email: req.body.email,
        superior: req.body.superior,
        name: req.body.name,
        avatar: req.body.avatar,
        ds: req.body.ds,
        sub: req.body.sub,
    }
    console.log(data);
    if (data.superior._id === null) {
        if (data.sub.length === 0) {
            User.findByIdAndDelete(data._id, (err) => {
                if (err) { res.json(err) };
            });
        } else {
            const childrenIds = data.sub.map((ele, index) => {
                return ele._id;
            })
            User.updateMany({ _id: { $in: childrenIds } }, { $set: { superior: { name: null, _id: null } } }, (err) => {
                if (err) { res.json(err) };
                User.findByIdAndDelete(data._id, (err) => {
                    if (err) { res.json(err) };
                    //       res.json('');
                });
            });
        }
    }
    else if (data.superior.name && data.superior._id && data.sub.length > 0) {
        console.log('case2');
        const childrenIds = data.sub.map((ele, index) => {
            return ele._id;
        });
        User.updateMany({ _id: { $in: childrenIds } }, { $set: { superior: { name: data.superior.name, _id: data.superior._id } } }, (err) => {
            if (err) { res.json(err) };
            User.updateOne({ _id: data.superior._id }, { $push: { sub: { $each: data.sub } } }, (err) => {
                if (err) { res.json(err) };
                User.updateOne({ _id: data.superior._id }, { $pull: { sub: { _id: data._id } } }, (err) => {
                    if (err) { res.json(err) };
                    User.findByIdAndDelete(data._id, (err) => {
                        if (err) { console.error(err) }
                        //     res.status(200).json('');
                    });
                });
            });
        });
    }
    else if (data.superior.name && data.superior._id && (data.sub.length === 0)) {
        console.log('case3' + data.superior._id)
        User.findOneAndUpdate({ '_id': data.superior._id }, { '$pull': { sub: { _id: data._id } } }, { 'new': true }, (err) => {
            if (err) { res.json(err) };
            User.findByIdAndDelete(data._id, (err) => {
                if (err) { res.json(err) }
                //      res.status(200).json('');
            });
        });
    };
    res.status(200).json(' ');
};

router.get('/subordinateview/:id', (req, res) => {
    User.findById(req.params.id, (err, data) => {
        if (err) { res.json(err) };
        const childrenIds = data.sub.map((ele, index) => {
            return ele._id;
        });
        User.find({ _id: { $in: childrenIds } }, (err, data) => {
            if (err) { res.json(err) };
            res.status(200).json(data);
        });
    });
})
router.get('/superior/:id', (req, res) => {
    User.find({}, (err, data) => {
        if (err) { res.json(err) };
        const id = req.params.id;
        const validData = getAllValidSuperiorList(id, data);
        res.status(200).json(validData);
    });
})

const getAllValidSuperiorList = (id, data) => {
    const map = new Map();
    data.forEach((ele) => {
        console.log(typeof ele.sub, ele.sub);
        map.set(ele._id.toString(), ele.sub.map((e, index) => e._id.toString()));
    })
    const set = new Set();
    dfsHelper(id, map, set);
    return data.filter((ele, index) => !set.has(ele._id.toString()));
}

const dfsHelper = (id, map, set) => {
    set.add(id)
    let currentChildrenArray = map.get(id);
    if (currentChildrenArray === []) {
        return;
    }
    for (let i = 0; i < currentChildrenArray.length; i++) {
        dfsHelper(currentChildrenArray[i], map, set);
    }
}
