# WhatsApp Spotify Bot

A Node.js bot that monitors WhatsApp group chats for Spotify links and automatically adds the songs/albums to a specified playlist.

## Features

- Connects to WhatsApp using the Baileys library
- Monitors individual or group chats for Spotify links
- Extracts track/album URIs from shared Spotify links
- Automatically adds tracks to a specified Spotify playlist
- Optional filtering to only process messages from specific groups

## Prerequisites

- Node.js v14+ installed
- A Spotify Developer account and application
- A WhatsApp account

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ogkatzu/whatsapp_spotify_bot.git
   cd whatsapp_spotify_bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
   SPOTIFY_PLAYLIST_ID=your_spotify_playlist_id
   ```

## Usage

1. Start the bot:
   ```
   node index.js
   ```

2. Scan the QR code with your WhatsApp mobile app:
   - Open WhatsApp on your phone
   - Go to Settings > WhatsApp Web/Desktop
   - Tap "Link a Device"
   - Point your camera at the QR code displayed in the terminal

3. The bot will now monitor messages for Spotify links and automatically add them to your playlist.

## Configuring Target Groups

By default, the bot will log all group IDs when it receives messages. To restrict the bot to only process messages from specific groups:

1. Run the bot and send a message in the target group
2. Note the group ID that appears in the console
3. Edit this line the group ID to the `ALLOWED_GROUP` array in `index.js`:
   ```javascript
   const ALLOWED_GROUP = [
     '123456789-123456789@g.us',
     // Add more group IDs here
   ];

   ```
   Note: If you already know the group id, just this line to .env file:
   ```
   ALLOWED_GROUP_ID=your_whatsapp_group_id@g.us
   ```
## Project Structure

- `index.js` - Main bot logic and WhatsApp connection
- `spotify.js` - Spotify API integration for extracting URIs and adding to playlist
- `auth.js` - Spotify authentication handlers
- `auth/` - Directory where WhatsApp session data is stored

## Troubleshooting

- **Error: open is not a function**: Install the 'open' package with `npm install open`
- **WhatsApp connection issues**: Make sure your phone and computer are connected to the internet
- **QR code not displaying**: Install 'qrcode-terminal' with `npm install qrcode-terminal`
- **Spotify authentication errors**: Verify your client ID, client secret, and redirect URI in the .env file

## Dependencies

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) - Spotify API wrapper
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - QR code generation in terminal
- [dotenv](https://github.com/motdotla/dotenv) - Environment variable management

## License

MIT

## Acknowledgements

- [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) for the WhatsApp Web API
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for the Spotify integration
