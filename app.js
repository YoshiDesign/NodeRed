const fs = require('fs')
const redis = require('redis')
const express = require('express')
const bodyParser = require('body-parser')
const TypeAhead = require('./utils/typeahead')
const TypeAheadRedis = require('./utils/typeahead_redis')
const aLoad = require('./utils/asyncLoad')
const cors = require('cors')

require('dotenv').config()

// Redis setup
const redis_client = redis.createClient({
    port      : process.env.REDIS_PORT,
    host      : process.env.LOCALHOST,
    password  : process.env.REDIS_PASS,
});
redis_client.auth(process.env.REDIS_PASS)
redis_client.on("error", function(error) {
    console.error(error);
  });

var app = express()
app.use(cors());
app.use(express.json())
app.use(bodyParser.json());
// const filename = process.argv[2]

app.get('/', function (req, res) {
    console.log("Access: /")
})

// app.post('/loadRedis', function(req, res){

//     aLoad.asyncLoad('./data/trie.json')
//         .then( load => {
//             console.log(load)
//             for (let key in load.data['n']) {
//                 console.log("adding new key... ", key)
//                  aLoad.redisLoad(key, load.data.n[key], redis_client)
//             }
//         })
//         .catch( err => {
//             console.log("CRASH: ", err)
//         })
// })

app.get('/typeahead', function(req, res){
    var t1 = Date.now()
    aLoad.asyncLoad('./data/trie.json')
        .then( load => {
            console.log(load)
            try {
                if (
                    !load.data.n[req.query.query[0]]
                    /* || regexp fail */) {
                    res.send({
                        results: {
                            message: "No Results",
                            matches: []
                        },
                        time : Date.now()
                    })
                } else {
                    res.send(
                        {
                            results: TypeAhead.typeahead(
                                req.query.query, 
                                load.data.n[req.query.query[0]], 
                                req.query.query[0]
                            ),
                            time : t1
                        }
                    )
                }
            } catch(err) {
                console.log(err)
            }
        })

    // fs.access('./data/trie.json', fs.constants.F_OK | fs.constants.R_OK, (err) => {
    //     if (err != null) {
    //         console.log(err.message)
    //     }
    //     else {
    //         console.log("good to go")
    //     }
    // })

})

app.get('/typeaheadRedis', function(req, res) {
    var t1 = Date.now()
    redis_client.get(req.query.query[0], function(err, reply) {
        if( !reply ) {
            console.log("NoReply@redis")
            return 0
        }
        if (err){
            console.log(err)
            return 0
        }
        res.send(
            {
                results: TypeAheadRedis.typeahead_redis(
                    req.query.query, 
                    JSON.parse(reply), 
                    req.query.query[0]
                ),
                time : t1
            }
        )
    })

})

app.listen(4000, () => {
    console.log("🔥");
});