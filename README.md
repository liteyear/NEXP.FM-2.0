# 📻 NEXP.FM-2.0

> A lightweight, high-performance Discord bot designed to stream public SoundCloud playlists 24/7 into a Voice Channel (VC).

Built for stability and low resource overhead, **NEXP.FM-2.0** is the perfect engine for community radio stations, lo-fi streams, or "always-on" background audio.

---

## 🚀 Features

* **24/7 Uptime:** Automatically reconnects and stays in the VC without manual intervention.
* **SoundCloud Integration:** Streams directly from any public SoundCloud playlist URL.
* **Minimalist Design:** Low CPU and RAM usage, ideal for hosting on small VPS instances.
* **Auto-Resume:** Smart logic to handle Discord gateway hiccups without stopping the music.

---

## 🛠 Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **FFmpeg** (Essential for audio processing)
* **Discord Bot Token** (via [Discord Developer Portal](https://discord.com/developers/applications))

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/liteyear/NEXP.FM-2.0.git](https://github.com/liteyear/NEXP.FM-2.0.git)
    cd NEXP.FM-2.0
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your credentials:
    ```env
    DISCORD_TOKEN=your_bot_token_here
    PLAYLIST_URL=[https://soundcloud.com/user/sets/your-playlist](https://soundcloud.com/user/sets/your-playlist)
    VOICE_CHANNEL_ID=your_vc_channel_id
    GUILD_ID=your_server_id
    ```

4.  **Run the bot:**
    ```bash
    node index.js
    ```

---

## ⚙️ Configuration

You can customize the bot's behavior in the `config.json` (or your equivalent settings file):

* **Volume:** Set default gain levels to prevent clipping.
* **Auto-Join:** Toggle whether the bot should force-join on startup.
* **Bitrate:** Adjust based on your server's boost level for maximum clarity.

---

## 📦 Deployment

For 24/7 operation, it is recommended to use a process manager like **PM2**:

```bash
# Install PM2 globally
npm install pm2 -g

# Start the bot
pm2 start index.js --name "nexp-fm"

# Save the process list for reboots
pm2 save

🤝 **Contributing**
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📄 **License**
This project is MIT licensed.

⭐ **Support**
If you find this tool useful, give it a star to help others find it!
