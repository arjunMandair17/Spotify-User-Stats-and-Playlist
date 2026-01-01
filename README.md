# Spotify-User-Stats-and-Playlist
A simple application that uses HTTP, express, and the spotify API to display the user's recent listening info such as songs and artists. It also generates a sound profile for the user and creates a tailored playlist using the reccoBeats API.

The application asks the user to sign in. It then gives the user an overview of their account, along with an option to get listening data from previous Spotify usage. Once selected, a list of the user's top 10 artists and top 25 songs are rendered. There is also a chart displaying how many artists they've been listening to, one for their average listening mood, and one for the spread of their genres. Finally, a sound profile is provided that gives the user some insight into their listening and top artists/genres. After this there is an option to create a personalized playlist, which is added to their Spotify account.

Right now the application can only run locally since the redirect on my Spotify account is to a port on my computer. It also only works for select users, since Spotify does not allow authorization for users who are not the application owner, only to a select few chosen on the website. My API keys and client id/secret are stored in environment files for security purposes.

Node.js is used to provide access to the asynchronous libraries/dependencies.

Dependencies used: 
- Express
- Pug
- Chart.js
- Express-session

APIs used:
- Spotify API
- ReccoBeats API

Startup Instructions:
- Enter the project directory
- Open a terminal in the directory
- Initialize dependencies with 'npm install'
- Run the server with 'node server.js'
- Open the home page with 'http://127.0.0.1:3000/', which returns a home page
- Click on "login" to sign in with Spotify
- Once authorized, you will be redirected to the dashboard where you can render listening information
