# Technical Requirement Document (TRD)

## Project: DrainageAI (v1.0)

**Document Status:** Approved for Implementation

**Architecture Pattern:** Centralized Stream Processing Architecture

---

## 1. System Architecture & Data Flow

To bypass physical edge hardware dependencies completely, DrainageAI employs a centralized ingest-and-process architecture. The backend acts as a centralized processing hub that pulls RTSP video streams, executes machine learning inference, factors in secondary data feeds, and streams real-time state updates to the React client via WebSockets.

```
[ Mock CCTV (MediaMTX) ] ---> (RTSP Stream) ---> [ FastAPI Backend ]
                                                       |  (OpenCV Frame Capture)
                                                       v
                                            [ YOLO Inference Engine ]
                                                       |  (Visual Metrics Extracted)
                                                       v
                                            [ Risk Fusion Engine ] <--- [ Mock IMD API ]
                                                       |
                             +-------------------------+-------------------------+
                             |                                                   |
                             v                                                   v
                  [ PostgreSQL + PostGIS ]                                [ WebSocket Server ]
                   (Persistence & Geo-Logs)                                (Real-time Push)
                                                                                 |
                                                                                 v
                                                                        [ React UI Dashboard ]

```

---

## 2. Comprehensive Tech Stack

Choosing React over Streamlit is the right call for a hackathon—it shows production-level maturity and gives you complete design freedom to match enterprise-grade Command and Control software.

### Frontend (Client Layer)

* **Framework:** React 19 (Scaffolded using **Vite** for near-instant build times).
* **Styling:** **Tailwind CSS** + **Shadcn/ui** (For ultra-clean, dashboard-ready UI components like maps, tables, and alert badges).
* **Mapping/GIS:** **React Map GL** (Mapbox) or **React-Leaflet** (Open-source alternative) to plot real-time drain coordinates.
* **State Management & Live Feeds:** Native WebSockets API for real-time alert streams; standard Axios/Fetch for REST endpoints.

### Backend (Application & ML Layer)

* **Core Framework:** **FastAPI (Python)**. Chosen for native asynchronous design, exceptional speed, automatic OpenAPI documentation, and effortless integration with Python ML pipelines.
* **Video Handlers:** **OpenCV (cv2)** for frame extraction from RTSP endpoints.
* **Stream Simulation:** **MediaMTX** (formerly rtsp-simple-server). A lightweight zero-dependency RTSP server to broadcast local `.mp4` video files as simulated active municipal CCTV feeds.

### Data & Intelligence Layer

* **Machine Learning Framework:** **Ultralytics YOLOv8 / YOLOv11** (Object Detection and Instance Segmentation).
* **Database:** **PostgreSQL** with the **PostGIS** extension.
> **Hackathon Advantage:** Using PostGIS to handle spatial metrics (such as calculating distance to low-lying basins) elevates your project significantly above typical data setups.



---

## 3. Database Schema

### Table 1: `drains` (Master Telemetry Table)

Stores the physical location, unique identifier, and geographic properties of every monitored asset.

```sql
CREATE TABLE drains (
    id VARCHAR(50) PRIMARY KEY,
    camera_rtsp_url VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    geo_location GEOMETRY(Point, 4326), -- PostGIS Spatial Geometry Type
    topological_vulnerability INT DEFAULT 3, -- Scale 1-5 (5 = Severe Low-Lying Basin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### Table 2: `blockage_alerts` (Event & Inference Log)

Stores the output of historical and active computer vision runs combined with mathematical risk outputs.

```sql
CREATE TABLE blockage_alerts (
    id SERIAL PRIMARY KEY,
    drain_id VARCHAR(50) REFERENCES drains(id),
    blockage_percentage DECIMAL(5,2) NOT NULL, -- Calculated from YOLO Bounding Box area
    water_level_status VARCHAR(20) NOT NULL,    -- 'NORMAL', 'ACCUMULATING', 'FLOODED'
    risk_score DECIMAL(5,2) NOT NULL,           -- Calculated Risk Index ($RI$)
    status VARCHAR(20) DEFAULT 'ACTIVE',       -- 'ACTIVE', 'DISPATCHED', 'RESOLVED'
    snapshot_url VARCHAR(255),                  -- Path to frame evidence snapshot
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

---

## 4. API Endpoints & Contract Definitions

### 4.1 REST API (Control Layer)

| Method | Endpoint | Description | Request Payload | Response Sample (200 OK) |
| --- | --- | --- | --- | --- |
| **GET** | `/api/v1/drains` | Retrieves data for all registered drains to display on the map view. | None | `[{"id": "DRN-01", "lat": 17.3850, "lng": 78.4867, "status": "CRITICAL"}]` |
| **GET** | `/api/v1/alerts/active` | Pulls all unaddressed high-risk blockage events. | None | `[{"alert_id": 102, "drain_id": "DRN-01", "risk_score": 84.50}]` |
| **POST** | `/api/v1/dispatch` | Dispatches a cleaning crew and transitions alert state. | `{"alert_id": 102, "team_id": "CREW-B"}` | `{"status": "success", "message": "Crew dispatched successfully"}` |

### 4.2 WebSockets API (Real-Time Ingestion Layer)

* **Endpoint:** `ws://localhost:8000/api/v1/stream/alerts`
* **Direction:** Server $\rightarrow$ Client (Broadcast)
* **Payload Structure:** Pushes frame analytics to the frontend instantly whenever the calculated Risk Index ($RI$) breaches the alert threshold.

```json
{
  "event": "BLOCKAGE_ALERT",
  "data": {
    "drain_id": "DRN-948",
    "coordinates": { "latitude": 17.4431, "longitude": 78.3742 },
    "visuals": { "blockage_ratio": 0.72, "water_level": "ACCUMULATING" },
    "weather": { "incoming_rain_mm": 52.0 },
    "risk_score": 88.40,
    "timestamp": "2026-06-20T13:41:16Z"
  }
}

```

---

## 5. Algorithmic Processing Specifications

The backend pipeline performs asynchronous iterations over active frames pulled via OpenCV. The final data output is calculated through the **Multi-Signal Risk Fusion Engine** equation:

$$RI = (w_b \cdot A_b) + (w_r \cdot R_f) + (w_v \cdot V_t)$$

### Execution Pipeline Sequence:

1. **Frame Capture:** OpenCV pulls a frame from the designated simulated RTSP channel once every 30 frames (1 frame per second to conserve resource overhead).
2. **CV Inference:** The frame runs through the custom YOLO detector to calculate $A_b$ (Area Blocked ratio).
3. **Persistence Verification:** A temporal loop verifies if $A_b > 0.40$ holds true for 5 consecutive check cycles to filter out moving obstructions.
4. **Data Hydration:** If validated, the pipeline queries the database for the location's topology rank ($V_t$) and pulls weather forecast figures ($R_f$).
5. **Score Evaluation:** The backend calculates the final $RI$. If the metric exceeds 70.00, it persists the event log to PostgreSQL and fires the payload over the open WebSocket pipeline to the React UI dashboard.