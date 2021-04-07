
async function asyncLoad(filename) {
    
    var data = await JSON.parse(JSON.stringify(require("../" + filename)))
    return {data: data}
}

function redisLoad(key, value, client) {
    client.set(key, JSON.stringify(value), function(err){
        console.error("Redis Error: ", err)
    })
    return 0
}

module.exports.asyncLoad = asyncLoad
module.exports.redisLoad = redisLoad