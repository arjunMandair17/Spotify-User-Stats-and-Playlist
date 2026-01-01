# Spotify-User-Stats-and-Playlist
A simple application that uses HTTP, Express, and the Spotify API to display the user's recent listening info, such as songs and artists. It also generates a sound profile for the user and creates a tailored playlist using the reccoBeats API.

The application asks the user to sign in. It then gives the user an overview of their account, along with an option to get listening data from previous Spotify usage. Once selected, a list of the user's top 10 artists and top 25 songs are rendered. There is also a chart displaying how many artists they've been listening to, one for their average listening mood, and one for the spread of their genres. Finally, a sound profile is provided that gives the user some insight into their listening and top artists/genres. After this, there is an option to create a personalized playlist, which is added to the user's Spotify account.

Right now the application can only run locally since the server listens on port 3000. Users of the application must also be Spotify Premium members to be able to access the API itself.

Node.js is used to provide access to the asynchronous libraries/dependencies, and the entire project is coded in JavaScript.

Dependencies used: 
- Express
- Pug
- Chart.js
- Express-session
- dotenv

APIs used:
- Spotify API
- ReccoBeats API

Startup Instructions:
- Enter the project directory
- Open a terminal in the directory
- Initialize dependencies with 'npm install'
- Run the server with 'node server.js'
- Open the home page by navigating to port 3000 on a browser
- Click on "login" to sign in with Spotify
- Once authorized, you will be redirected to the dashboard where you can render listening information
