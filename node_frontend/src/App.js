import React, {useEffect} from 'react'
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

function App() {

    var typing = false
    
    useEffect( () => {


        // Load a ton of data into Redis
        // document.getElementById('load').addEventListener('click', function(e){
        //     axios.post('/loadRedis', {message: "Loadin'...."})
        //     .then( (res) => {
        //         console.log(res.data.message)
        //     })
        //     .catch( err => {
        //         console.log(err)
        //     })
        // })


        document.getElementById('search').addEventListener('keyup', function(e){

            document.getElementById('results').innerHTML = ""

            if (!e.target.value.trim()) return 0

            axios.get(`/typeaheadRedis?query=${e.target.value}`, {
                proxy: {
                    host: 'localhost',
                    port: 4000
                  }
            })
            .then( (res) => {

                console.log(res.data.results.matches)
                console.log(`Round Trip: ${Date.now() - res.data.time}ms`)

                var rList = document.getElementById('results')
                if (res.data.results.matches.length > 0) {
                    rList.innerHTML = ""
                    for (let _m of res.data.results.matches) {
                        rList.innerHTML += `<li>${_m}</li>`
                    }
                } 

            })
            .catch( err => { console.log(err) } )
        })

    },[])

    return (
        <div className="App">
            <div className="center">
                <input id="search" type='text' />
            </div>
            <div className="center">
                <input id="load" type='submit' value="loadDatas" />
            </div>
            <div>
                <ul id="results"></ul>
            </div>
            <div>
                <p>TODO: Save their last search. Don't repeat</p>
                <p>TODO: If last search was length of 1, do not send request</p>
                <p>TODO: </p>
            </div>
        </div>
    );
}

export default App;
