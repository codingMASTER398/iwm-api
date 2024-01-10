# iwm-api
A package to interact with the I Wanna Maker API
`npm install iwm-api`
This is not finished, so please contribute what you can!

## Starting off
Most client functions don't need you to be logged in, but here's how to do so.
You need a **username**, **password** and the **current version of IWM** (be sure to update it often)
```js
var client = new require("iwm-api").client();

client.login("username","password","version").then(async function(session) {
    console.log(session)
}).catch(function(err) {
    console.log(err)
})
```

### Leaderboards
```js
// Global leaderboard (yes its a fake enum I know)
console.log(await client.leaderboard(client.enum.leaderboardCodes["Skribble Hard"]))
// Leaderboard for a level
console.log(await client.leaderboardLevel(4269,5,0))
// Level ID, limit, and if we should include the replay data (0 for no, 1 for yes)
```
### Level search
```js
// By ID
console.log(await client.search({
    "code": "AAAABBBB"
}))

// By whatever else

console.log(await client.search({
    "min_diff": "0", // 0 for easy, 5.00 for impossible
    "order": `[{${encodeURIComponent(`"Dir": "desc", "Name": "created_at"`)}}]`, // I don't know too much about this, but you can change the "Sort by"
    "required_tags": `6,2`, // Tags by ID
    "start": "0",
    "limit": "10",
    "max_diff": "5.00"
}))

// Feel free to mix in any further parameters you can find in the search GET request
// http://make.fangam.es/api/v1/map?author=Mr.%20Maker&min_diff=0&order=[{%20"Dir":%20"desc",%20"Name":%20"created_at"%20}]&record=0&start=0&required_tags=5&limit=10&max_diff=5.00&played=1&name=levelName&clear=0
```

### Levels
```js
// Both of these require you to be logged in

await client.playLevel(4269) // Level ID
// Gives you level data (you can't ACTUALLY play it)
// The "MapData" attribute of the response is a base64 encoded file which can then be unzipped (using zlib or an alternative) to get the xml structure (.map file)

await client.tagLevel(420,[6,9]) // Tag a level with tag ids

await client.rateLevel(420,5) // Rate a level (level ID then 1 for down and 5 for up)
```

### Users
```js
// User lookup
await client.userLookup(4269) // User ID

// Update avatar and country (login required)
await client.updateLook({
    "Country": 10, "PantsColor": 12058802, "HatSpr": 0, "HairColor": 0, "CapeColor": 0, "ShoesColor": 16777215, "ID": 212176, "ShirtColor": 12124343, "SkinColor": 16748460
}) // Don't ask me what all those mean. Can somebody contribute to this README and make it better to understand?

// Follow/unfollow (login required)
await client.updateFollow(4269,true) // User ID, follow/unfollow
```

### Notifications
```js
// Get unread notification count
console.log(await client.notificationsUnread())

// Get notifications
console.log(await client.notifications(0,10)) // Start and limit
```
### Misc
```js
await client.canUpload() // true or false, because cooldown
await client.mapCount() // Global map count
client.logout() // Logout
```

## Contributing
Please contribute (:
Thats all
