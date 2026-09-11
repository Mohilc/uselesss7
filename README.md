# MoodOS — The Laptop With Feelings 💻❤️

An interactive full-stack application that monitors laptop hardware temperature and Wi-Fi signal strength, giving the machine an expressive visual "mood", dynamic atmospheric climate effects (sunny, rain, snow, heat, lightning), wallpapers, soundscapes, and AI personality voice lines.

---

## 🌟 Features

- 🌡️ **Real-Time Temperature Monitoring**: Tracks CPU thermals, temperature status (Normal, Warm, Hot, Critical), trend analysis, and overheating throttle risk warnings.
- 📶 **Wi-Fi Strength Monitoring**: Detects active network SSID, signal quality %, link speed, and ping latency.
- 😀 **Expressive Mood Engine**: Calculates dynamic laptop moods:
  - 😊 **Happy** (Normal temp + strong Wi-Fi → Sunny landscape)
  - 😡 **Angry / Hot** (Temp > 80°C → Fire & volcano climate)
  - 🥵 **Stressed** (Temp > 65°C → Heatwave atmosphere)
  - 🥶 **Cold** (Low temp → Snow & ice frost effect)
  - 😐 **Neutral** (Average parameters)
  - 😔 **Sad** (Weak Wi-Fi < 35% → Rainy drizzle)
  - 😭 **Lonely** (No Wi-Fi / Disconnected → Lightning storm)
  - 🤩 **Excited** (Cool thermals + Gigabit link → Aurora borealis)
- 🌦️ **Dynamic Climate Particle Engine**: 60 FPS HTML5 Canvas particle systems for Rain ripples, Floating Embers, Soft Snowflakes, Sunbeams, and Lightning Strikes.
- 🎨 **Dynamic Wallpapers**: Automatically transitions scenic backgrounds with manual theme locking option.
- 🎭 **Custom Personalities & Voice**: Choose between **Sarcastic**, **Dramatic**, **Zen**, **Gamer**, and **Tsundere** laptop personalities with Web Speech API voice synthesis.
- 🎵 **Generative Audio Synthesizer**: Procedural ambient soundscapes and alert chimes synthesized in-browser via Web Audio API.
- 🎛️ **Dual-Mode Operation**:
  - **Live Hardware Telemetry Mode**: Direct monitoring of laptop system state.
  - **Interactive Simulation & Demo Studio**: Real-time sliders and 1-click presets for demonstrations.
- 📈 **Session Telemetry Graph**: Real-time SVG dual-axis trend history.
- ⚡ **WebSocket Live Streaming**: Low-latency push updates every 1.5 seconds.
- 📖 **Interactive API Documentation & Explorer**: Built-in modal to test all REST endpoints and inspect OpenAPI schemas.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js |
| **Real-Time Stream** | WebSockets (`ws`) |
| **Audio & Speech** | Web Audio API & Web Speech API |
| **System Telemetry** | `systeminformation`, Windows WMI / NetAdapter |
| **Testing** | Jest, Supertest |
| **Database** | *None required* (zero persistence / stateless real-time telemetry) |

---

## 🏗️ Architecture

```
                 LAPTOP HARDWARE
                        │
                        ▼
             System Hardware Telemetry
            (CPU Load, Sensors, Wi-Fi)
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
  Temperature Service              Wi-Fi Service
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
                 Express Backend
                        │
                        ▼
                   Mood Engine
           (Sarcastic, Dramatic, Gamer, etc.)
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
          REST API             WebSockets
             │                     │
             └──────────┬──────────┘
                        │
                        ▼
               Frontend Dashboard
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
Dynamic Wallpapers  Climate Canvas   Mood Mascot & Voice
```

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- **Node.js** v18+ installed (`node -v`)
- **npm** v9+ installed (`npm -v`)

### 2. Install Dependencies

Install root, backend, and frontend packages:
```bash
npm run install:all
```
*(Or navigate into `backend` and `frontend` folders and run `npm install` in each).*

### 3. Launching on Windows (Screen App)

#### Option A: One-Click Desktop Launcher (Recommended)
Simply double-click the included Windows batch launcher:
```text
MoodOS.bat
```
This automatically boots the hardware sensors, starts the backend, and opens the native Windows Desktop window directly on your screen without opening any browser tabs.

#### Option B: Terminal Command
```bash
npm run desktop
```

---

## 🪟 Windows Desktop Screen Modes

MoodOS provides 3 distinct modes directly on your Windows screen:

1. **🖥️ Full Dashboard Window**:
   - High-tech frameless glass window with custom Windows controls (minimize, maximize, close).
   - Real-time temperature gauges, Wi-Fi health radars, interactive simulation drawers, and trend history graphs.

2. **🪟 Floating Screen Widget Mode (Mini Screen Companion)**:
   - Compact (350x140px) glassmorphism companion widget that floats on top of all other windows (`alwaysOnTop: true`).
   - Sits on your screen while you code, game, or browse!
   - Shows live mood face, pulsing mood aura, CPU temperature dial, and Wi-Fi indicator.
   - Click the expand icon anytime to return to the full dashboard.

3. **🌧️ Desktop Screen Weather Overlay**:
   - Transparent fullscreen weather canvas directly across your Windows monitor.
   - **Click-through enabled**: Raindrops, falling snow, volcanic embers, and storms animate directly over your desktop while you interact freely with other Windows applications.

4. **🖼️ Real Windows Desktop Wallpaper Synchronization**:
   - Automatically synchronizes your **actual Windows desktop wallpaper** using Windows PowerShell (`SystemParametersInfo`).
   - When your laptop overheats, your actual desktop background turns to volcanic fire! When it cools down, it transforms into glacial frost!

---

### 4. Running Web-Only (Optional Browser Mode)

If you ever wish to run it in a standard browser tab:
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## 🧪 Running Automated Tests

Run backend unit and integration test suite (11 test specs covering all boundary conditions):
```bash
cd backend
npm test
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system` | Combined system telemetry, temperature, Wi-Fi, and mood state |
| `GET` | `/api/temperature` | Current CPU thermals, status, thresholds, and overheating prediction |
| `GET` | `/api/wifi` | Wi-Fi network SSID, signal %, link speed, quality, and ping latency |
| `GET` | `/api/mood` | Active calculated mood, climate effect, and personality commentary |
| `GET` | `/api/status` | Hardware specs (CPU model, RAM utilization, uptime) |
| `GET` | `/api/history` | Historical session data points for graphing |
| `POST` | `/api/simulate` | Toggle and set simulated temperature/Wi-Fi values for demoing |
| `POST` | `/api/personality` | Change laptop persona (`Sarcastic`, `Dramatic`, `Zen`, `Gamer`, `Tsundere`) |
| `POST` | `/api/thresholds` | Update custom temperature limits (°C) |
| `GET` | `/api/docs` | OpenAPI 3.0 specification JSON |
| `WS` | `/ws` | Real-time continuous telemetry push stream |

---

## 🎯 Verification Checklist

- [x] Minimum: Frontend dashboard, Backend API, temperature & Wi-Fi detection, mood engine, theme shifts, responsive UI, error handling.
- [x] Good: Automatic wallpaper transitions, session history graph, animated climate effects, expressive mascot animations, Wi-Fi quality radar, auto refresh.
- [x] Excellent: Real-time monitoring, particle canvas, customizable temperature thresholds, procedural Web Audio effects, trend prediction, fullscreen mood mode.
- [x] Outstanding: Overheating warning prediction, AI personality descriptions, Web Speech synthesis voice lines, 5 custom personalities, WebSocket streaming, automated Jest tests, interactive API explorer modal, PWA manifest.
