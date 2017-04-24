var express = require('express');
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');
var request = require('request');
var PythonShell = require('python-shell');
var querystring = require('querystring');
var moment = require('moment');

const NodeCouchDb = require('node-couchdb');
const couch = new NodeCouchDb({
    host: '10.99.0.12',
    protocol: 'http',
    port: 5986,
    auth: {
        user: 'user',
        pass: 'pass'
    }
});
var mongoose = require('mongoose'); //db to store session for limit rate access 1 minute / remote IP
mongoose.connect('mongodb://localhost/mongothrottle');

app.use(logger('combined', {
  skip: true
}));
app.set('json spaces', 2);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet({
  noCache: true
}));
app.use(cors());
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});

function checkblock(callback){
    request({
        url: 'http://10.99.0.12:5986/block/_design/detail/_view/status?key=0',
        method: 'GET'
    }, function (err, response) {
        callback(err, JSON.parse(response.body));
    });
};

function mining(wallet, addtvalueq, callback){
    return function(error, response, body) {
        // real callback code here, has access to passMeDown
        if(error){
            //res.sendStatus(504);
            callback(504);
            //console.log('check blocktx current wallet error');
        } else {
            resbodytx = JSON.parse(response.body);
            //console.log('check blocktx current wallet success');
            addtvalue = addtvalueq.value;
            //console.log(resbodytx.rows);
            if (resbodytx.rows.length == 0){
                                            //add new blocktx                                        
                couch.uniqid().then(function(ids){
                    var id = ids[0];
                    couch.insert('blocktx', {
                        _id: id,
                        status: 0,
                        received: 0,
                        unreceived: 0,
                        datetime: moment().unix(),
                        blockreward: addtvalue.blockreward,
                        counthash: 1,
                        blocktx: "blktx_"+id,
                        wallet: wallet,
                        percentage: 0,
                        type: "blocktx",
                        block: addtvalue.block
                    }).then(
                        function(data, headers, status){
                            //res.sendStatus(200);
                            var cth = addtvalue.counthash + 1;
                            if ( cth >= 1000000){
                                var statusblock = 1;
                            }else{
                                var statusblock = 0;
                            }
                            couch.update('block', {
                                _id: addtvalue._id,
                                _rev: addtvalue._rev,
                                status: statusblock,
                                blockreward: addtvalue.blockreward,
                                counthash: cth,
                                datetime: moment().unix(),
                                statusreward: addtvalue.statusreward,
                                type: "block",
                                block: addtvalue.block                                    
                            }).then(function(dataa, headerss, statuss){
                                    callback(200);
                                    //console.log('update blocktx current wallet success');
                                }
                            )
                        },
                        function(erradd){
                            //res.send(504);
                            callback(504);
                            //console.log('add blocktx current wallet error');
                        }
                    )
                });
            }else{
                //update blocktx
                var finch = resbodytx.rows[0].value.counthash + 1;
                var finunrcvd = finch / 1000000 * resbodytx.rows[0].value.blockreward;
                var finpctg = finch / 1000000 * 100;
                couch.update('blocktx', {
                    _id: resbodytx.rows[0].value._id,
                    _rev: resbodytx.rows[0].value._rev,
                    unreceived: finunrcvd,
                    counthash: finch,
                    percentage: finpctg,
                    status: 0,
                    received: 0,
                    datetime: moment().unix(),
                    blockreward: resbodytx.rows[0].value.blockreward,
                    blocktx: resbodytx.rows[0].value.blocktx,
                    wallet: resbodytx.rows[0].value.wallet,
                    type: "blocktx",
                    block: resbodytx.rows[0].value.block
                }).then(
                    function(data, headers, status){
                        //res.sendStatus(200);
                        
                        var cth = addtvalue.counthash + 1;
                        if ( cth >= 1000000){
                            var statusblock = 1;
                        }else{
                            var statusblock = 0;
                        }
                        couch.update('block', {
                            _id: addtvalue._id,
                            _rev: addtvalue._rev,
                            status: statusblock,
                            blockreward: addtvalue.blockreward,
                            counthash: cth,
                            datetime: moment().unix(),
                            statusreward: addtvalue.statusreward,
                            type: "block",
                            block: addtvalue.block                                    
                        }).then(function(dataa, headerss, statuss){
                                callback(200);
                                //console.log('update blocktx current wallet success');
                            }
                        )
                    },
                    function(erradd){
                        //res.send(504);
                        callback(504);
                        //console.log('update blocktx current wallet error');
                    }
                )
            }
        }
    }
}

var throttler = require('./lib/throttler');
app.post('/:cayawallet', throttler,function(req, res, next) {
   checkblock(function(err, result)  {
        if (err) {
            ////console.log(err);
            //console.log('check unfinished block error');
            res.send(err);
        } else {
            // successful
            ////console.log(result);
            //console.log('check unfinished block success');
            if (result.rows.length == 0){
                PythonShell.run('python/addblock.py', function (errpython, respython) {
                  if (errpython) {
                    //res.send(errpython);
                    //console.log('python add block error');
                    res.send(errpython);
                  }else{
                    
                    //console.log('python add block success');
                    
                    request({
                        url: 'http://10.99.0.12:5986/block/_design/detail/_view/status?key=0',
                        method: 'GET'
                    }, function (errget, responseget) {
                        if(errget){
                            res.sendStatus(504);
                            //console.log('check unfinished block error');
                        } else {
                            //res.sendStatus(200);
                            //console.log('check unfinished block success');
                            resbody = JSON.parse(responseget.body);
                            //res.send(resbody.rows[0].block);
                            var quw = '%5B%22'+resbody.rows[0].value.block+'%22%2C%20%22'+req.params.cayawallet+'%22%5D';
                            request({
                                url: 'http://10.99.0.12:5986/blocktx/_design/detail/_view/find?key='+quw,
                                method: 'GET'
                            }, mining(req.params.cayawallet, resbody.rows[0], function(result){
                                res.sendStatus(result);
                            }));
                        }
                        
                    });
                  }               
                });
    	    } else {
                    request({
                        url: 'http://10.99.0.12:5986/block/_design/detail/_view/status?key=0',
                        method: 'GET'
                    }, function (errget, responseget) {
                        if(errget){
                            res.sendStatus(504);
                            //console.log('check unfinished block error');
                        } else {
                            //res.sendStatus(200);
                            //console.log('check unfinished block success');
                            resbody = JSON.parse(responseget.body);
                            //res.send(resbody.rows[0].block);
                            var quw = '%5B%22'+resbody.rows[0].value.block+'%22%2C%20%22'+req.params.cayawallet+'%22%5D';
                            request({
                                url: 'http://10.99.0.12:5986/blocktx/_design/detail/_view/find?key='+quw,
                                method: 'GET'
                            }, mining(req.params.cayawallet, resbody.rows[0], function(result){
                                res.sendStatus(result);
                            }));
                        }
                        
                    });
                    
    	    }
         }
   });
})

var server = app.listen(2435, function(){
  console.log('Magic is happening on port 2435')
});
