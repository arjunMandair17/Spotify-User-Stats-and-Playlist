
const MAX_TRACKS = 25;

document.getElementById("statsButton").addEventListener("click", async (event)=>{
    let timeSelect = document.getElementById("timePeriod");
    let timePeriod = timeSelect.value;
    let chartDiv = document.getElementById("chartDiv");
    chartDiv.innerHTML = "";

    let userData = await fetch("/user/data?timePeriod=" + timePeriod, {
        headers: {
            "Accept": "application/json"
        }
    })

    userData = await userData.json();

    let statsTitle = document.createElement("h2");
    statsTitle.innerHTML = "User Statistics:";
    chartDiv.appendChild(statsTitle);

    // make two tables, one for top artists and one for top songs (with links to both's spotify page)
    let artistTable = document.createElement("table");
    let topSongsTable = document.createElement("table");
    chartDiv.append(artistTable, topSongsTable)

    let counter = 1;

    let artistDiv = document.createElement("div");
    artistDiv.classList.add("statsDiv");
    let artistTitle = document.createElement("h3");
    artistTitle.innerHTML = "Top Artists:";
    artistTitle.classList.add("subtitle");
    artistDiv.append(artistTitle, artistTable)

    let trackDiv = document.createElement("div");
    trackDiv.classList.add("statsDiv");
    let trackTitle = document.createElement("h3");
    trackTitle.innerHTML = "Top Songs:";
    trackTitle.classList.add("subtitle")
    trackDiv.append(trackTitle ,topSongsTable);

    let tableDiv = document.createElement("div");
    tableDiv.classList.add("tableDiv");
    tableDiv.append(artistDiv, trackDiv);
    chartDiv.append(tableDiv);

    for(item of userData.artists){
        let tr = document.createElement("tr");
        let curNumberContainer = document.createElement("td");
        let curNumber = document.createElement("h3");
        let tableImg = document.createElement("td");
        let img = document.createElement("img");
        let tableArtistName = document.createElement("td");
        let artistName = document.createElement("h3");
        let spotifyAnchor = document.createElement("a");
        spotifyAnchor.append(artistName);

        curNumber.innerHTML = `${counter}.`;
        counter++;
        curNumberContainer.appendChild(curNumber);
        img.src = item.images[1].url;
        tableImg.appendChild(img);
        artistName.innerHTML = item.name;
        spotifyAnchor.href = item.external_urls.spotify;
        spotifyAnchor.target = "_blank"
        tableArtistName.appendChild(spotifyAnchor);

        tr.append(curNumberContainer,tableImg, tableArtistName);
        artistTable.append(tr);
    }

    counter = 1;
    for(item of userData.tracks){
        let tr = document.createElement("tr");
        let curNumberContainer = document.createElement("td");
        let curNumber = document.createElement("h3");
        let tableImg = document.createElement("td");
        let tableSong = document.createElement("td");
        let img = document.createElement("img");
        let title = document.createElement("h3");
        let artist = document.createElement("p");
        let titleAnchor = document.createElement("a");
        titleAnchor.append(title);

        curNumber.innerHTML = `${counter}.`;
        counter++;
        curNumberContainer.appendChild(curNumber);
        img.src = item.album.images[1].url;
        title.innerHTML = item.name;
        artist.innerHTML = `by ${item.artists[0].name}`;
        titleAnchor.href = item.external_urls.spotify;
        titleAnchor.target = "_blank"
        
        tableSong.append(titleAnchor, artist);
        tableImg.append(img);
        tr.append(curNumberContainer,img, tableSong);
        topSongsTable.append(tr);
    }   


    // make a chart for how many of the top songs were each of the top artists

    let artistSpread = {};
    userData.tracks.forEach(track =>{

        track.artists.forEach(artist =>{
            if(artist.name in artistSpread){
                artistSpread[artist.name]++;
            }else{
                artistSpread[artist.name] = 1;
            }
        })

    })

    let topArtist = {artist: "", count: 0};

    Object.keys(artistSpread).forEach(artist=>{
        if(artistSpread[artist] > topArtist.count){
            topArtist.count = artistSpread[artist];
            topArtist.artist = artist;
        }
    })

    
    let topArtistText = document.createElement("h2");
    topArtistText.innerHTML = "Your top artist is " + topArtist.artist;;

    let chartsContainer = document.createElement("div");
    chartsContainer.id = "chartsContainer";

    let artistChart = document.createElement("canvas");
    let artistChartDiv = document.createElement("div");
    artistChartDiv.classList.add("chartDiv");
    artistChartDiv.append(topArtistText,artistChart);
    chartsContainer.append(artistChartDiv);
    chartDiv.appendChild(chartsContainer);

    new Chart(artistChart, {
        type: "pie",
        data: {
            labels: Object.keys(artistSpread),  
            datasets: [{
                data: Object.values(artistSpread).map(value => (value / MAX_TRACKS) * 100 ),
                backgroundColor:
                    [
                        "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
                        "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
                        "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
                        "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080",
                        "#ff7f50", "#6495ed", "#2e8b57", "#dda0dd", "#ff1493"
                    ] 
            }]
        }
    })


    // intensity (loudness and acousticness), mood (valence and danceability), and energy (energy and tempo)
    let songIds = [];

    userData.tracks.forEach(track =>{ songIds.push(track.id); });


    let songStats = await fetch("/user/data/songStats?songs=" + songIds.join(","), {
        headers: {
            "Accept": "application/json"
        },
    })

    songStats = await songStats.json();



    let moodCounter = {Upbeat : 0, Sad: 0, Chill: 0, Moody: 0};
    songStats.content.forEach(track=>{

        let mood = getMood(track.valence, track.danceability);
        moodCounter[mood]++;
        
    })

    let topMood = {mood: "", count:0};
    Object.keys(moodCounter).forEach(mood=>{
        if(moodCounter[mood] > topMood.count){
            topMood.count = moodCounter[mood];
            topMood.mood = mood;
        }
    })

    let topMoodText = document.createElement("h2");
    topMoodText.innerHTML = "Most of your songs are " + topMood.mood;

    let moodChart = document.createElement("canvas");
    moodChart.id = "moodChart";
    let moodChartDiv = document.createElement("div");
    moodChartDiv.classList.add("chartDiv");
    moodChartDiv.append(topMoodText,moodChart);
    chartsContainer.append(moodChartDiv);

    new Chart(moodChart, {
        type: "pie",
        data: {
            labels: Object.keys(moodCounter),  
            datasets: [{
                data: Object.values(moodCounter).map(value => (value / MAX_TRACKS) * 100 ),
                backgroundColor:
                    [
                        "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
                        "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
                        "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
                        "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080",
                        "#ff7f50", "#6495ed", "#2e8b57", "#dda0dd", "#ff1493"
                    ] 
            }]
        }
    })

    let genreSpread = {};
    let topGenre = {genre: "", count: 0};

    userData.artists.forEach(artist=>{

        artist.genres.forEach(genre=>{

            if(genreSpread.hasOwnProperty(genre)){
                genreSpread[genre]++;
            }else{
                genreSpread[genre] = 1;
            }

            if(genreSpread[genre] > topGenre.count){
                topGenre.genre = genre;
                topGenre.count = genreSpread[genre];
            }

        })

    })

    let topGenreText = document.createElement("h2");
    topGenreText.innerHTML = "Your most played genre is " + topGenre.genre;
    chartDiv.appendChild(topGenreText);

    let genreChart = document.createElement("canvas");
    genreChart.id = "genreChart";
    let genreChartDiv = document.createElement("div");
    genreChartDiv.classList.add("largeChartDiv");
    genreChartDiv.append(genreChart);
    chartDiv.appendChild(genreChartDiv);

    new Chart(genreChart, {
        type: 'bar',
        data: {
            labels: Object.keys(genreSpread),
            datasets: [{
                data: Object.values(genreSpread).map(value=> (value / MAX_TRACKS) * 100),
                backgroundColor: "#ffffffff",
                label: "% of your listening dominated by this genre"
            }]
        }
    })

    // average the song stats for the top songs to make a sound profile for the user

     function getIntensity(loudnessAvg, acousticAvg){
        if(loudnessAvg > -8 && acousticAvg < 0.5){
            return "Booming"
        }else{
            return "Relaxed"
        }
    }

    function getMood(valenceAvg, danceAvg){
        if(valenceAvg > 0.6){
            if(danceAvg > 0.6){
                return "Upbeat"
            }else{
                return "Chill";
            }
        }else{
            if(danceAvg > 0.6){
                return "Moody";
            }else{
                return "Sad";
            }
        }
    }
   
    function getEnergy(energyAvg, tempoAvg){
        if(energyAvg > 0.6){
            if(tempoAvg > 120){
                return "Electric";
            }else if(70 < tempoAvg < 120){
                return "Excited"
            }
        }else{
            if(tempoAvg > 120){
                return "Laid-Back";
            }else if(70 < tempoAvg < 120){
                return "Melancholy"
            }
        }
    }

    let loudnessAvg = 0;
    let acousticAvg = 0;
    let valenceAvg = 0;
    let danceAvg = 0;
    let energyAvg = 0;
    let tempoAvg = 0;
    songStats.content.forEach(track =>{

        loudnessAvg += track.loudness;
        acousticAvg += track.acousticness;
        valenceAvg += track.valence;
        danceAvg += track.danceability;
        energyAvg += track.energy;
        tempoAvg += track.tempo;
    });

    loudnessAvg = loudnessAvg / MAX_TRACKS;
    acousticAvg = acousticAvg / MAX_TRACKS;
    valenceAvg = valenceAvg / MAX_TRACKS;
    danceAvg = danceAvg / MAX_TRACKS;
    energyAvg = energyAvg / MAX_TRACKS;
    tempoAvg = tempoAvg / MAX_TRACKS;


    // diagnose intensity, mood, and energy
    let intensity = getIntensity(loudnessAvg, acousticAvg);
    let mood = getMood(valenceAvg, danceAvg);
    let energy = getEnergy(energyAvg, tempoAvg);

    let profileDiv = document.createElement("div");
    profileDiv.id = "profileDiv";
    chartDiv.appendChild(profileDiv);
    let profileInfo = document.createElement("h4");
    profileInfo.id = "profileInfo";
    profileInfo.innerHTML = `We've analyzed your listening from your top songs, and discovered some interesting quirks about your listening habits. You often gravitate towards songs with a ${intensity} intensity. On top of this, your recent songs give off a ${energy} vibe, showing off the ${mood} artists at the top of your playlists. Furthermore, you've had a really special connection with ${topArtist.artist}, some would call you a superfan! We're glad you enjoy their music so much. As a whole, it looks like your favorite genre is ${topGenre.genre}, which makes sense given the songs you've been bumping lately. Keep being you!`;
    profileDiv.appendChild(profileInfo);


    let tracks = userData.tracks.slice(0,5).map(track=> track.id);

    let playlistParams = new URLSearchParams({
        tracks: tracks.join(","),
        valence: valenceAvg,
        energy: energyAvg,
        loudness: loudnessAvg,
        danceability: danceAvg,
        featureWeight: 2
    }).toString()
    

    
    let playlistDesc = document.createElement("h3");
    profileDiv.append(playlistDesc);
    playlistDesc.innerHTML = "We've generated a playlist for you based on your listening habits and top songs. Click the button below to add it to your spotify account!"

    let playlistButton = document.createElement("button");
    playlistButton.classList.add("button");
    playlistButton.innerHTML = "Generate Playlist";
    profileDiv.appendChild(playlistButton);



    playlistButton.addEventListener("click", async(e)=>{

        e.target.disabled = true;

        let recSongs = await fetch("user/data/recommendations?" + playlistParams, {
        headers:{
            "Accept": "application/json"
            }
        })

        recSongs = await recSongs.json();


        let playlistInfo = await fetch("user/data/playlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(recSongs)
        })
        
        playlistInfo = await playlistInfo.json();

        let playlistAnchor = document.createElement("a");
        let playlistName = document.createElement("h2");
        playlistAnchor.appendChild(playlistName);
        playlistAnchor.href = playlistInfo.playlist_url;
        playlistAnchor.target = "_blank";
        playlistAnchor.style.color = "#ffffffff"
        playlistName.innerHTML = `Click here to access your playlist!`;
        profileDiv.append(playlistAnchor)

    })

})