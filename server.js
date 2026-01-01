const express = require("express");
const app = express();
const querystring = require("querystring");
const crypto = require("crypto");
const session = require("express-session");
require("dotenv").config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {sameSite: "lax"}
}));

app.use(express.static("static"));
app.use(express.json());
app.set("view engine", "pug");

app.get("/authorize", (req,res)=>{

    // the scope of the user's info that will be accessed (email and account info)
    let scope = "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private";

    // random 16 byte hexadecimal string to protect against third party requests
    let state = crypto.randomBytes(16).toString("hex");
    req.session.state = state;

    let sendParams = querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectURI,
        state: state,
        show_dialog: "true" 
    });

    return res.redirect("https://accounts.spotify.com/authorize?" + sendParams);
})

app.get("/callback", async (req,res)=>{
    let code = req.query.code;
    let state = req.query.state;

    if(!state || state !== req.session.state){
        return res.status(400).send("State Mismatch: Possible Third Party Request");
    }

    let result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // encodes the client id and secret in base 64
            "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
            "Accept": "application/json"
        },
        body: querystring.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectURI
        })
    })

    result = await result.json();

    let accessToken = result.access_token;
    req.session.expiry = Date.now() + (result.expires_in * 1000);

    if(!accessToken){
        return res.status(401).send("Unauthorized: Login Failed");
    }

    req.session.access_token = accessToken;

    return res.redirect("/dashboard");

})

app.get("/dashboard", async(req,res)=>{

    // checks if the user is authenticated
    if(!req.session.access_token){
        return res.status(401).send("Unauthenticated: Sign In");
    }

    // redirects if access token has expired
    if(req.session.expiry <= Date.now()){
        return res.redirect("/authorize");
    }

    let userInfo = await getUserInfo(req.session.access_token);

    return res.render("dashboard", {userInfo: userInfo});
    
})

app.get("/user/data", async (req, res)=>{

    // checks if the user is authenticated
    if(!req.session.access_token){
        return res.status(401).send("Unauthenticated: Sign In");
    }

    // redirects if access token has expired
    if(req.session.expiry <= Date.now()){
        return res.redirect("/authorize");
    }

    let timePeriod = req.query.timePeriod;


    // get the user's top artists for data analysis
    let userArtists = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=" + timePeriod + "&limit=10",  {
    headers: {
        "Authorization": `Bearer ${req.session.access_token}`
        }
    })

    userArtists = await userArtists.json();

    let userTracks = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=" + timePeriod + "&limit=25",  {
    headers: {
        "Authorization": `Bearer ${req.session.access_token}`
        }
    })

    userTracks = await userTracks.json();

    let resObj = {artists: userArtists.items, tracks: userTracks.items}
    
    res.status(200).send(resObj);
});

app.get("/user/data/songStats", async (req,res)=>{

    // checks if the user is authenticated
    if(!req.session.access_token){
        return res.status(401).send("Unauthenticated: Sign In");
    }

    // redirects if access token has expired
    if(req.session.expiry <= Date.now()){
        return res.redirect("/authorize");
    }

    let songIds = req.query.songs;


    let songStats = await fetch("https://api.reccobeats.com/v1/audio-features?ids=" + songIds, {
        headers: {
            "Accept": "application/json"
        }
    });


    songStats = await songStats.json();

    res.status(200).send(songStats);
});

app.get("/user/data/recommendations", async(req,res)=>{
    // checks if the user is authenticated
    if(!req.session.access_token){
        return res.status(401).send("Unauthenticated: Sign In");
    }

    // redirects if access token has expired
    if(req.session.expiry <= Date.now()){
        return res.redirect("/authorize");
    }


    let tracks = req.query.tracks;


    

    if((tracks.split(",").length) > 5){
        return res.status(400).send("ERROR: Number of seeds provided exceeds maximum (at most 5 seeds)");
    }


    let params = querystring.stringify({
        size: 60,
        seeds: tracks,
        valence: req.query.valence,
        energy: req.query.energy,
        loudness: req.query.loudness,
        danceability: req.query.danceability,
    })

    let recs = await fetch("https://api.reccobeats.com/v1/track/recommendation?" + params, {
        headers: {
            "Accept": "application/json"
        }
    })

    recs = await recs.json();


    res.send(recs.content);
})

app.post("/user/data/playlist", async(req,res)=>{
    // checks if the user is authenticated
    if(!req.session.access_token){
        return res.status(401).send("Unauthenticated: Sign In");
    }

    // redirects if access token has expired
    if(req.session.expiry <= Date.now()){
        return res.redirect("/authorize");
    }

    let songs = req.body;
    let songUris = songs.map(song=> `spotify:track:${song.href.replace("https://open.spotify.com/track/", "")}`);

    let userInfo = await getUserInfo(req.session.access_token);

    let newPlaylist = await fetch(`https://api.spotify.com/v1/users/${userInfo.id}/playlists`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${req.session.access_token}`
        },
        body: JSON.stringify({
            "name": "My Recommendations",
            "description": "Songs tailored towards your listening habits. Generated using the Spotify API.",
            "public": "false"
        })

    });

    newPlaylist = await newPlaylist.json();

    await fetch(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${req.session.access_token}`
        },
        body: JSON.stringify({
            "uris": songUris
        })
    })

    res.send({playlist_url: newPlaylist.external_urls.spotify, name: newPlaylist.name, })

})

app.listen(3000, ()=>{console.log("Server running on port 3000")});


async function getUserInfo(token){
    // gets the user's information
    let userInfo = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    userInfo = await userInfo.json();
    return userInfo;
}