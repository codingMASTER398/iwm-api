const fetch = require("node-fetch")

module.exports.client = function() {
    this.session = {
        loggedIn:false
    }

    this.logout = function() {
        this.session = {
            loggedIn:false
        }
    }

    this.login = (username,password,version)=> {
        return new Promise(async (resolve,reject)=> {

            let formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('version', version);

            let loginRequest = await fetch("http://make.fangam.es/api/v1/login",{
                body: formData,
                headers:{
                    "User-Agent": "GameMaker HTTP"
                },
                method: "POST"
            })

            switch(loginRequest.status){
                case 400:
                    reject("Bad Request (right version?)")
                    break
                case 401:
                    reject("Incorrect username or password")
                    break
                case 200:

                    var session = await loginRequest.json();

                    this.session = {
                        loggedIn:true,
                        token: session.token,
                        userId: session.userId,
                        twitch: session.twitch
                    }

                    resolve(this.session)

                    break
                default:
                    reject(`Unexpected login status code (${loginRequest.status})!`)
                    break
            }
        })
    }

    this.mapCount = ()=>{
        return new Promise(async (resolve,reject)=>{
            let mapCount = await fetch("http://make.fangam.es/api/v1/mapcount")
            switch(mapCount.status){
                case 200:
                    resolve(Number(await mapCount.text()))
                    break;
                case 500:
                    reject(`Server error`)
                    break;
                default:
                    reject(`Unexpected status code ${mapCount.status}`)
                    break;
            }
        })
    }

    this.leaderboard = (code)=>{
        return new Promise(async (resolve,reject) => {
            let board = await fetch(`http://make.fangam.es/api/v1/leaderboard?type=${code}&start=0&limit=50&userId=-1`)

            switch(board.status){
                case 200:
                    resolve(await board.json())
                    break;
                case 400:
                    reject(`Invalid leaderboard/Bad request (use client.enum.leaderboardCodes['leaderboardName'])`)
                    break;
                default:
                    reject(`Unexpected response code ${board.status}`)
                    break
            }
        })
    }

    this.enum = {
        "leaderboardCodes":{
            "Clears":"clears",
            "Records":"records",
            "Explorer":"explorer",
            "Skribble Easy":"scribble0",
            "Skriblle Medium":"scribble1",
            "Skribble Hard":"scribble2",
            "Skriblle Impossible":"scribble3",
            "Endurance Easy":"endurance0",
            "Endurance Medium":"endurance1",
            "Endurance Hard":"endurance2",
            "Endurance Impossible":"endurance3",
            "Roulette":"roulette",
            "Hardcore Roulette":"hardcore"
        }
    }

    //http://make.fangam.es/api/v1/map?author=aee&min_diff=2&order=[{%20"Dir":%20"desc",%20"Name":%20"created_at"%20}]&record=1&start=0&required_tags=0,9&limit=10&max_diff=4&played=1&name=ae&clear=1

    this.search = (parameters)=>{
        return new Promise(async(resolve,reject)=>{
            let searchUrl = `http://make.fangam.es/api/v1/map?a=a`

            for (const property in parameters) {
                searchUrl = searchUrl.concat(`&${property}=${parameters[property]}`)
            }

            let response;
            if(this.session.loggedIn){
                response = await fetch(searchUrl,{headers:{"Authorization":this.session.token}})
            }else{
                response = await fetch(searchUrl)
            }
            switch(response.status){
                case 200:
                    resolve(response.json())
                    break;
                case 400:
                    reject(`Bad request`)
                    break;
                default:
                    reject(`Unexpected response status ${response.status}`)
                    break;
            }
        })
    }

    this.playLevel = (id)=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                let response = await fetch(`http://make.fangam.es/api/v1/map/${id}/start`,{
                    headers:{
                        "Authorization":this.session.token
                    },
                    method:"POST"
                })
                
                switch(response.status){
                    case 200:
                        resolve(response.json())
                        break;
                    case 400:
                        reject(`Bad request`)
                        break;
                    default:
                        reject(`Unexpected response status ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in`)
            }
        })
    }

    this.tagLevel = (id,tags)=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                let response = await fetch(`http://make.fangam.es/api/v1/tag/${id}?tags=${tags.join(",")}`,{
                    headers:{
                        "Authorization":this.session.token
                    },
                    method:"POST"
                })
                
                switch(response.status){
                    case 200:
                        resolve(response.json())
                        break;
                    case 400:
                        reject(`Bad request`)
                        break;
                    default:
                        reject(`Unexpected response status ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in`)
            }
        })
    }

    this.leaderboardLevel = (id,limit,replayData)=>{
        //http://make.fangam.es/api/v1/map/177484/besttimes/5?include_replay_data=0
        return new Promise(async(resolve,reject)=>{
            let response = await fetch(`http://make.fangam.es/api/v1/map/${id}/besttimes/${limit}?include_replay_data=${replayData}`)
            
            switch(response.status){
                case 200:
                    resolve(response.json())
                    break;
                case 400:
                    reject(`Bad request`)
                    break;
                default:
                    reject(`Unexpected response status ${response.status}`)
                    break;
            }
        })
    }

    //http://make.fangam.es/api/v1/user/212176
    this.userLookup = (id)=>{
        return new Promise(async(resolve,reject)=>{
            let response = await fetch(`http://make.fangam.es/api/v1/user/${id}`)
            
            switch(response.status){
                case 200:
                    resolve(response.json())
                    break;
                case 400:
                    reject(`Bad request`)
                    break;
                default:
                    reject(`Unexpected response status ${response.status}`)
                    break;
            }
        })
    }

    this.updateLook = (look)=>{
        //{ "Country": 10, "PantsColor": 12058802, "HatSpr": 0, "HairColor": 0, "CapeColor": 0, "ShoesColor": 16777215, "ID": 212176, "ShirtColor": 12124343, "SkinColor": 16748460 }
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                let response = await fetch(`http://make.fangam.es/api/v1/user/${this.session.userId}`,{
                    headers:{
                        "Authorization":this.session.token,
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(look),
                    method:"POST"
                })
                
                switch(response.status){
                    case 200:
                        resolve(response.json())
                        break;
                    case 400:
                        reject(`Bad request`)
                        break;
                    default:
                        reject(`Unexpected response status ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in`)
            }
        })
    }

    this.updateFollow = (id,follow)=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                let followUrl;
                if(follow){
                    followUrl = `http://make.fangam.es/api/v1/follow?userId=${id}`
                }else{
                    followUrl = `http://make.fangam.es/api/v1/unfollow?userId=${id}`
                }

                let response = await fetch(followUrl,{
                    headers:{
                        "Authorization":this.session.token
                    },
                    method:"POST"
                })
                
                switch(response.status){
                    case 200:
                        resolve(response.json())
                        break;
                    case 400:
                        reject(`Bad request`)
                        break;
                    default:
                        reject(`Unexpected response status ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in`)
            }
        })
    }

    this.canUpload = ()=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                
                let response = await fetch(`http://make.fangam.es/api/v1/useruploadcooldown`,{
                    headers:{
                        "Authorization":this.session.token
                    }
                })
                
                switch(response.status){
                    case 200:
                        resolve(true)
                        break;
                    default:
                        reject(false)
                        break;
                }
            }else{
                reject(false)
            }
        })
    }

    //http://make.fangam.es/api/v1/notifunread
    this.notificationsUnread = ()=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                
                let response = await fetch(`http://make.fangam.es/api/v1/notifunread`,{
                    headers:{
                        "Authorization":this.session.token
                    }
                })
                
                switch(response.status){
                    case 200:
                        resolve(Number(await response.text()))
                        break;
                    default:
                        reject(0)
                        break;
                }
            }else{
                reject(0)
            }
        })
    }
    this.notifications = (start,limit)=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                
                let response = await fetch(`http://make.fangam.es/api/v1/notif?notifType=-1&start=${start}&limit=${limit}&notifRead=-1`,{
                    headers:{
                        "Authorization":this.session.token
                    }
                })
                
                switch(response.status){
                    case 200:
                        resolve(await response.json())
                        break;
                    default:
                        reject(`Status code ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in!`)
            }
        })
    }

    this.rateLevel = (id,rating)=>{
        return new Promise(async(resolve,reject)=>{
            if(this.session.loggedIn){
                
                let response = await fetch(`http://make.fangam.es/api/v1/map/${id}/rating`,{
                    headers:{
                        "Authorization":this.session.token
                    },
                    body:JSON.stringify({"Rating":rating}),
                    method:"POST"
                })
                
                switch(response.status){
                    case 200:
                        resolve()
                        break;
                    default:
                        reject(`Status code ${response.status}`)
                        break;
                }
            }else{
                reject(`Not logged in!`)
            }
        })
    }

    return this
}