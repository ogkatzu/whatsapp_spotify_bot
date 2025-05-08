
// index.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { extractUriFromLink, addToPlaylist, getAlbumTrackUris, refreshAccessToken } = require('./spotify');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state });

  // Handle connection updates (including QR code)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Display QR code in terminal
      console.log('Scan this QR code with your WhatsApp app:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 403;
      console.log('Connection closed due to ', lastDisconnect.error, 'Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    }

    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }
  });

  const ALLOWED_GROUP = '120363030050430190@g.us';

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      // Skip if the message doesn't exist
      if (!msg.message) continue;

      // Get the text content from various message types
      let text = '';

      // Direct conversation message
      if (msg.message.conversation) {
        text = msg.message.conversation;
      }
      // Group or forwarded message
      else if (msg.message.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
      }

      // Skip if no text content
      if (!text) continue;

      // Check if this is from a group (remoteJid will contain '-' for groups)
      const isGroup = msg.key.remoteJid.includes('@g.us');
      if (!isGroup || msg.key.remoteJid !== ALLOWED_GROUP) {
        continue; // Skip if not from your group
      }
      // Process the message

      const spotifyRegex = /https?:\/\/open\.spotify\.com\/(track|album)\/[a-zA-Z0-9]+/g;
      const matches = text.match(spotifyRegex);

      if (matches) {
        console.log(`Spotify link detected in ${isGroup ? 'group chat' : 'private chat'}: ${msg.key.remoteJid}`);

        for (let link of matches) {
          const resource = await extractUriFromLink(link);
          if (!resource) continue;

          try {
            if (resource.type === 'track') {
              await addToPlaylist([`spotify:track:${resource.id}`]);
              console.log(`Added track to playlist: ${resource.id}`);
            } else if (resource.type === 'album') {
              const trackUris = await getAlbumTrackUris(resource.id);
              if (trackUris.length === 0) {
                console.log('Album has no tracks');
                continue;
              }
              await addToPlaylist(trackUris);
              console.log(`Added ${trackUris.length} tracks from album ${resource.id}`);
            }
          } catch (err) {
            // Handle expired token (401)
            if (err.response?.status === 401) {
              try {
                await refreshAccessToken();
                if (resource.type === 'track') {
                  await addToPlaylist([`spotify:track:${resource.id}`]);
                } else if (resource.type === 'album') {
                  const trackUris = await getAlbumTrackUris(resource.id);
                  if (trackUris.length > 0) {
                    await addToPlaylist(trackUris);
                  }
                }
                console.log('Retried after refreshing token.');
              } catch (refreshErr) {
                console.error('Failed after token refresh:', refreshErr.response?.data || refreshErr.message);
              }
            } else {
              console.error('Failed to add track/album:', err.response?.data || err.message);
            }
          }
        }
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startBot();
