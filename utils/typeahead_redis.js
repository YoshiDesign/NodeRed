/*
 TODO Optimizations  
 		- Each node must keep track of the number of consecutive nodes in its previous generations which have already been fully traversed.
 		  This way we don't backtrack to nodes which have already been fully traversed, instead we begin backtracking from a point
 		  where a bifurcation of the search path is possible.

 		 - Similarly, while constructing the data, we can tack a property onto each object, n, which is a count of consecutive previous generations that 
 		   only had 1 node to traverse into. This can also represent the number of steps back we can take in 1 fel swoop
 */


const MATCH = 8

/**
 * Generate suggestions
 * @param {*} q - The query string
 * @param {*} d - The search index starting from data[fist-letter-of-query]
 * @param {*} s - The first letter of the query
 */
function typeahead_redis (q, d, s) {

    var count = 0

    // The first letter, the index start
    var _str = s
    // Suggestions to send to frontend
    var matches = []
    // The current search path object
    var sPath = d

    // Follow the Query 
    for (let i = 1; i < q.length; i++) {

        // No data for this character. Start suggestions
        if ( !q[i] || !d.n[ q[i] ] ) {
            // console.log("BROKE")
            break
        }

        // Descend to next letter
        sPath = sPath.n[q[i]] || null
        _str += q[i]

        // console.log(sPath)
        // No path from here. Continue without appending to string so we can still generate suggestions
        if (sPath == null) {
            continue
        }

        // Add to suggestions
        if (sPath.im && q.length <= _str.length - 1) {
            matches.push(_str)
        }
        
    }

    /*
        The query string is exhausted. Begin searching for recommendations from where the query left off
    */

    while (matches.length < MATCH) {
        count++
        // Save resources
        if (count > 1000) {
            return {
                message: "Searched Everything",
                matches: matches
            }
        }
        // Used to determine our next descent in the trie
        var next_letter = null

        try {
            // Obvious Choice - This node only has 1 place to go
            if (Object.keys(sPath.n).length == 1 && sPath.n[Object.keys(sPath.n)[0]].v == false) {
                next_letter = Object.keys(sPath.n).length ? Object.keys(sPath.n)[0] : null		
            }

            // Determine where to traverse next, if there is more than 1 possible route yet taken
            else if (Object.keys(sPath.n).length > 0) {
                /*
                * Determine the next node we'll descend into.
                * next_letter - Has not been visited and has the highest weight
                */
                next_letter = getNextLetter(sPath.n)

            }
        } catch (err) {
            return {
                message: "No Results",
                matches: []
            }
        }
        
        // Backtrack
        if (!next_letter) {

            // Don't backtrack beyond the actual query
            if (_str != q){

                // Reset search head
                sPath = d

                // Reduce _str
                _str = _str.slice(0,-1)

                // Descend to [_str]
                for (let i = 1; i < _str.length; i++) {
                    sPath = sPath.n[_str[i]]
                }

            // backtracked all the way to the initial query string. All paths have been exhausted
            } else {
                // Return matches
                break
            }

        // Move to the next best node
        } else {

            _str += next_letter
            sPath = sPath.n[next_letter]
            sPath.v = true

            if (sPath.im) {
                matches.push(_str)
            }

        }

    }

    console.log(`Completed in ${count} steps.`)
    return {
        message: false,
        matches: matches
    }
}

/**
 * Return an unvisited node with the highest search rank.
 * Return the first unvisited node if there is a tie.
 * @param {*} nodes 
 */
function getNextLetter(nodes) {

    var best_option = null

    // Find the most popular search path
    for (let key of Object.keys(nodes)) {

        // Already visited
        if (nodes[key].v) {continue}

        // Start comparing
        for (let _k of Object.keys(nodes)) {

            // Compared against itself, or isn't as popular
            if (_k == key || nodes[key].wt <= nodes[_k].wt) {continue}

            //  More popular and unvisited
            if (nodes[key].wt > nodes[_k].wt && nodes[key].v == false) {
                best_option = key
            }

            // Save some time by considering our first best match, or use the current key if unvisited
            else if (best_option == null) {

                if (nodes[_k].wt > nodes[key].wt && !nodes[_k].v) {
                    best_option = _k
                }
                else if (nodes[key].v == false) {
                    best_option = key
                }
            }
        }
    }

    // Any key will do if we haven't found one for whatever reason
    if (best_option == null) {
        for (let key of Object.keys(nodes)) {
            if (nodes[key].v == false) {
                best_option = key
            }
        }
    }

    return best_option

}



module.exports.typeahead_redis = typeahead_redis











