# Adaptive FairFlow
### A Context-Aware Hybrid Traffic Signal Controller Using Fuzzy Logic & Dynamic Priority Optimization

Adaptive FairFlow is a state-of-the-art intelligent traffic management simulation and control platform. It models a complex four-way urban intersection in real-time 3D, integrating **HC-SR04 ultrasonic echo sensing**, **RFID-based emergency preemption**, a **Mamdani Fuzzy Logic Inference Engine**, a **Dynamic Priority Index (DPI)**, and an **Anti-Starvation Fairness Protocol**.

---

## 1. Quick Start & Execution

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup & Launch
```bash
# Clone or navigate to the repository directory
cd "c:\Users\Pranjal\OneDrive\Desktop\LDAM SOFTWARE"

# Install dependencies (React, Three.js, React Three Fiber, Drei, Tailwind CSS, Recharts, Lucide React)
npm install

# Start the Vite local development server
npm run dev
```

Open your browser at `http://localhost:3000` (or the port indicated in your console). The simulation runs automatically upon launch without requiring external credentials, cloud APIs, or hardware keys.

---

## 2. System Architecture & Project Folder Structure

```
adaptive-fairflow/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx                # Live status bar, phase indicator, speed controls
│   │   │   └── Sidebar.jsx               # Navigation drawer, equity gauge, quick dispatch
│   │   ├── simulation/
│   │   │   ├── Intersection3D.jsx        # Master Three.js canvas & viewport
│   │   │   ├── RoadNetwork.jsx           # 4-way asphalt roadway, zebra crossings, buildings
│   │   │   ├── TrafficLight3D.jsx        # Emissive triple-aspect signal assemblies
│   │   │   ├── Vehicle3D.jsx             # 3D models (Car, Bus, Truck, Ambulance)
│   │   │   ├── UltrasonicSensor3D.jsx    # Roadside HC-SR04 transducer models & sonar laser
│   │   │   ├── RFIDReader3D.jsx          # Overhead gantries & RF interrogation zones
│   │   │   ├── CameraControls.jsx        # OrbitControls with camera presets (Iso, Top-down, etc.)
│   │   │   └── VehicleDetailModal.jsx    # Click inspector for vehicle telemetry
│   │   ├── dashboard/
│   │   │   ├── MetricCard.jsx            # KPI metric cards
│   │   │   ├── ApproachCard.jsx          # Corridor telemetry cards (N, S, E, W)
│   │   │   ├── TrafficCharts.jsx         # Live telemetry charts (Recharts)
│   │   │   └── EventLog.jsx              # Filterable real-time event audit stream
│   │   └── controls/
│   │       ├── SimulationToolbar.jsx     # Traffic density, auto-spawn, vehicle dispatch
│   │       └── EmergencyQuickPanel.jsx   # Ambulance dispatcher & RFID test panel
│   ├── pages/
│   │   ├── LiveSimulation.jsx            # Primary 3D simulation twin & control room
│   │   ├── TrafficAnalytics.jsx          # Live performance metrics and queue history
│   │   ├── SensorMonitoring.jsx          # Dedicated ultrasonic telemetry station
│   │   ├── EmergencyManagement.jsx       # RFID priority queue and incident logs
│   │   ├── ControllerLogic.jsx           # Decision matrix, active fuzzy rules, DPI formula
│   │   └── Settings.jsx                  # Timing settings, weights, ESP32 IoT schemas
│   ├── simulation/
│   │   ├── constants.js                  # Geometry coordinates, vehicle configs, timings
│   │   ├── vehicleRoutes.js              # Kinematics, car-following model, Bézier turns
│   │   ├── trafficSignalFSM.js           # Finite state machine enforcing safety clearance
│   │   ├── sensorSimulator.js            # Geometric distance calculation (cm) & health
│   │   ├── rfidSimulator.js              # RFID zone detection & emergency queue
│   │   ├── fuzzyLogic.js                 # Mamdani inference engine & Centroid defuzzifier
│   │   ├── dynamicPriority.js            # DPI computation & Explainable AI rationale
│   │   ├── fairnessManager.js            # Starvation tracking & anti-starvation boost
│   │   └── simulationEngine.js           # Master simulation coordinator & physics loop
│   ├── hardware/
│   │   └── hardwareAdapter.js            # Bi-directional ESP32 WebSocket/MQTT adapter
│   ├── hooks/
│   │   └── useSimulation.js              # Decoupled React state subscriber hook
│   ├── App.jsx                           # Application shell & hotkeys
│   ├── main.jsx                          # React 18 DOM mount
│   └── index.css                         # Tailwind directives & glassmorphism theme
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

## 3. The Fuzzy Logic Inference Algorithm

The controller incorporates a genuine **Mamdani Fuzzy Inference System (FIS)** with Centroid defuzzification:

### A. Fuzzification & Membership Functions
Three continuous input metrics are fuzzified:
1. **Traffic Density ($\rho \in [0, 1]$)**:
   - `LOW`: Trapezoidal $([-0.1, 0, 0.25, 0.45])$
   - `MEDIUM`: Triangular $([0.25, 0.50, 0.75])$
   - `HIGH`: Trapezoidal $([0.55, 0.75, 1.0, 1.2])$
2. **Average Waiting Time ($W \in [0, 60\text{s}]$)**:
   - `SHORT`: Trapezoidal $([-1, 0, 6, 12])$
   - `MODERATE`: Triangular $([8, 18, 30])$
   - `LONG`: Trapezoidal $([22, 35, 60, \infty])$
3. **Queue Length ($Q \in [0, 12\text{ vehicles}]$)**:
   - `SMALL`: Trapezoidal $([-1, 0, 1.5, 3])$
   - `MEDIUM`: Triangular $([2, 4, 6])$
   - `LARGE`: Trapezoidal $([4.5, 7, 12, \infty])$

### B. Mamdani Rule Base
A comprehensive set of 12 rules models traffic behavior, such as:
- *Rule 1*: `IF Density is HIGH AND Waiting Time is LONG THEN Urgency is VERY HIGH`
- *Rule 2*: `IF Queue is LARGE AND Waiting Time is MODERATE THEN Urgency is HIGH`
- *Rule 3*: `IF Density is LOW AND Waiting Time is SHORT THEN Urgency is LOW`
- *Rule 6*: `IF Waiting Time is LONG AND Queue is SMALL THEN Urgency is HIGH` (prevents neglected isolated vehicles)

Rule firing strengths $\alpha_i$ are computed using the Mamdani min-operator:
$$\alpha_i = \min(\mu_A(x_1), \mu_B(x_2))$$

### C. Centroid Defuzzification (Center of Gravity)
The aggregated fuzzy set $\mu_{\text{comb}}(u) = \max_i (\min(\alpha_i, \mu_{\text{urgency}_i}(u)))$ is defuzzified into a crisp Urgency Score $U \in [0, 100]$:
$$U = \frac{\int_{0}^{100} u \cdot \mu_{\text{comb}}(u) \, du}{\int_{0}^{100} \mu_{\text{comb}}(u) \, du}$$

---

## 4. The Dynamic Priority Index (DPI) Formulation

At each phase switch decision point, every approach corridor calculates its Dynamic Priority Index:

$$\text{DPI} = \frac{w_d \cdot S_{\text{demand}} + w_w \cdot S_{\text{wait}} + w_q \cdot S_{\text{queue}} + w_f \cdot S_{\text{fairness}} + w_u \cdot S_{\text{fuzzy}}}{w_d + w_w + w_q + w_f + w_u}$$

Where:
- $S_{\text{demand}} \in [0, 100]$: Normalized count of approaching and queued vehicles.
- $S_{\text{wait}} \in [0, 100]$: Normalized mean waiting duration relative to standard nominal tolerance (30s).
- $S_{\text{queue}} \in [0, 100]$: Normalized count of stationary vehicles queued before the stop line.
- $S_{\text{fairness}} \in [0, 100]$: Anti-starvation score computed by `FairnessManager` based on elapsed starvation time since the approach last held a green phase.
- $S_{\text{fuzzy}} \in [0, 100]$: Crisp urgency output from the Mamdani Centroid Defuzzifier.
- Configurable default weights: $w_d = 0.25, w_w = 0.25, w_q = 0.20, w_f = 0.15, w_u = 0.15$.

### Explainable Decision Rationale
The system dynamically synthesizes natural language explanations from the exact mathematical contributors (e.g., *"North approach selected with highest DPI (84.2 pts, +18.4 ahead of East). Driven primarily by queue length (5 queued vehicles) and anti-starvation fairness"*).

---

## 5. Simulated Ultrasonic Sensors & Signal Allocation

Four virtual **HC-SR04 ultrasonic sensors** are positioned at the roadside near each stop line:
1. **Geometric Distance Calculation**: Each simulation frame, the sensor computes Euclidean distance to oncoming vehicles on that corridor:
   $$d = \sqrt{(x_v - x_s)^2 + (y_v - y_s)^2 + (z_v - z_s)^2}$$
2. **Telemetry Conversion**: Scaled to centimeters ($d_{\text{cm}} = \text{round}(d \times 100)$).
3. **Target Locking**: When a vehicle is within the $32\text{m}$ detection threshold:
   - Dynamic 3D cyan sonar laser beam extends from the sensor to the front bumper of the target vehicle.
   - Live distance is broadcast to the dashboard HUD.
   - Traffic demand metric (`LIGHT`, `MODERATE`, `HEAVY`) is calculated and fed directly into $S_{\text{demand}}$ and fuzzy density calculations.

---

## 6. How to Demonstrate Emergency RFID Priority

1. Navigate to the **Live Simulation** tab or **Emergency / RFID** tab.
2. Under **Emergency Preemption**, select an approach corridor (e.g., **East Road**).
3. Click **"Spawn Ambulance on East"** (or use the red **"Dispatch Ambulance"** button in the sidebar).
4. **Observe the 3D Scene**:
   - The emergency ambulance (white body with medical cross decals and flashing red/blue strobe beacons) spawns on East Road.
   - As it travels into the overhead RFID Interrogation Zone, the gantry panel pulses bright gold and illuminates the road surface.
   - The HUD logs: `"RFID TAG DETECTED: Valid transponder [RFID-EMERG-AMB-911] authenticated on EAST approach."`
5. **Observe Safe Signal Preemption**:
   - The active green signal safely transitions: `ACTIVE GREEN → ACTIVE YELLOW (3s) → ALL-RED CLEARANCE (1.5s) → EAST GREEN`.
   - Conflicting traffic is stopped safely; yellow and all-red clearance intervals are strictly maintained.
   - The ambulance passes through the intersection uninhibited.
   - Once the ambulance clears the intersection, the emergency request completes and normal adaptive optimization resumes smoothly.

---

## 7. Future ESP32 Hardware Integration

Adaptive FairFlow includes a modular hardware bridge (`hardwareAdapter.js`) designed to interface with physical ESP32 microcontrollers:

### Pinout Mapping
- **HC-SR04 Ultrasonic Sensors**:
  - `TRIG_PIN` → GPIO 5, `ECHO_PIN` → GPIO 18 (North)
  - `TRIG_PIN` → GPIO 19, `ECHO_PIN` → GPIO 21 (South)
  - `TRIG_PIN` → GPIO 22, `ECHO_PIN` → GPIO 23 (East)
  - `TRIG_PIN` → GPIO 25, `ECHO_PIN` → GPIO 26 (West)
- **RC522 RFID Reader**: SPI Interface (MISO 12, MOSI 13, SCK 14, SS 15, RST 4)
- **12V Signal Light Relays**: 8-Channel Relay Module on GPIOs 27, 32, 33, etc.

### Telemetry Payload Format (WebSocket `ws://<ESP32_IP>:81`)
```json
{
  "device": "ESP32-INTERSECTION-CTRL-01",
  "sensors": {
    "NORTH": { "distanceCm": 420, "detected": true },
    "SOUTH": { "distanceCm": 3200, "detected": false },
    "EAST":  { "distanceCm": 1150, "detected": true },
    "WEST":  { "distanceCm": 3200, "detected": false }
  },
  "rfid": {
    "tagId": "RFID-EMERG-AMB-911",
    "approach": "EAST",
    "timestamp": 1729000000
  }
}
```

Safety Invariant: For physical road deployment, the safety finite state machine (minimum green, yellow time, all-red clearance) should reside in non-volatile C++ firmware on the ESP32 itself to ensure fail-safe operation during network latency or disconnection.

---

## 8. Keyboard Shortcuts
- **Spacebar**: Toggle Simulation Pause / Resume
- **R**: Restart Simulation from Initial State
