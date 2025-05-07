// spotify.js (updated)
const axios = require('axios');
require('dotenv').config();

let accessToken = '';

async function refreshAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
  }), {
    headers: {
      Authorization: 'Basic ' + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  accessToken = response.data.access_token;
  return accessToken;
}

async function addToPlaylist(uris) { // Now accepts array of URIs
  if (!accessToken) await refreshAccessToken();

  // Spotify allows adding up to 100 tracks per request
  const chunkSize = 100;
  for (let i = 0; i < uris.length; i += chunkSize) {
    const chunk = uris.slice(i, i + chunkSize);
    
    await axios.post(
      `https://api.spotify.com/v1/playlists/${process.env.SPOTIFY_PLAYLIST_ID}/tracks`,
      { uris: chunk },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }
}

async function getAlbumTrackUris(albumId) {
  if (!accessToken) await refreshAccessToken();
  
  let allTracks = [];
  let nextUrl = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;

  while (nextUrl) {
    const response = await axios.get(nextUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    allTracks.push(...response.data.items.map(t => t.uri));
    nextUrl = response.data.next;
  }

  return allTracks;
}

async function extractUriFromLink(link) {
  const match = link.match(/open\.spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  
  return {
    type: match[1],
    id: match[2]
  };
}

module.exports = { addToPlaylist, extractUriFromLink, getAlbumTrackUris };

