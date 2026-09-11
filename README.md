# Team Lambda — Motor & Brush Controller

A web-based controller UI for sending commands to an **ESP32** (or similar Wi-Fi microcontroller) over HTTP. Two versions are included: a plain HTML file and a React app.

---

## How It Works

### Overview

```
[Browser UI] --HTTP GET--> [ESP32 Wi-Fi Module] --> [Motors / Actuators]
```

1. You enter the **IP address** of the ESP32 device (e.g. `192.168.4.1`).
2. Use sliders and buttons to choose a speed (0–255) and direction.
3. The UI sends an HTTP GET request to:
   ```
   http://<device-ip>/data?cmd=<command>
   ```
4. The ESP32 receives the command and drives the corresponding motor.

---

### Command Format

Each command is a short string: **prefix + speed value (0–255)**

| Control          | Forward       | Reverse       | Stop |
|-----------------|---------------|---------------|------|
| Drive Motor      | `fm<speed>`   | `rm<speed>`   | `b`  |
| Brush            | `fb<speed>`   | `rb<speed>`   | `s`  |
| Linear Actuator  | `fl<speed>`   | `rl<speed>`   | `p`  |

**Example:** Pressing *Forward* on the Drive Motor at speed 200 sends:
```
GET http://192.168.4.1/data?cmd=fm200
```

---

## Project Structure

```
bot_lambd/
├── web_.html                    # Standalone single-file version (no build needed)
└── motor-controller/            # React + TypeScript + Vite version
    └── src/
        ├── App.tsx              # Root component — manages IP state and command log
        ├── types.ts             # Shared TypeScript types (LogEntry, ControllerConfig)
        └── components/
            ├── ControlCard.tsx  # Slider + Forward/Reverse/Stop buttons per device
            └── CommandLog.tsx   # Live scrollable log of sent commands
```

---

## Running the React App

```bash
cd motor-controller
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

> For the plain HTML version, just open `web_.html` directly in any browser — no build or server needed.

---

## Tech Stack

- **React 19** + **TypeScript** — component-based UI
- **Vite** — fast dev server and bundler
- **ESP32 firmware** *(not in this repo)* — must listen on `/data?cmd=` and handle the command strings above
