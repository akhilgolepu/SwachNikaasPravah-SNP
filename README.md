# DrainageAI — ICCC Command Center

> Real-time AI-powered drainage monitoring for Indian smart cities. Repurposing CCTV infrastructure to prevent urban flooding.

## Architecture

```
[ CCTV / RTSP ]  ──→  [ FastAPI Backend ]  ──→  [ React Dashboard ]
                          │                         ↑
                    ┌─────┴──────┐                  │
                    │            │                  │
              [ YOLOv8 ]   [ SQLite ]       [ WebSocket ]
              Inference    Persistence      Real-Time Push
```

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend (Python 3.12+)
pip install -r backend/requirements.txt
```

### 2. Start Backend

```bash
cd backend
python run.py
# → API:       http://localhost:8000
# → Swagger:   http://localhost:8000/docs
# → WebSocket: ws://localhost:8000/api/v1/stream/alerts
```

### 3. Start Frontend

```bash
npm run dev
# → Dashboard: http://localhost:5173
```

### 4. (Optional) Both at Once

```bash
npm run dev:full
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/drains` | All monitored drains |
| GET | `/api/v1/drains/{id}` | Single drain telemetry |
| GET | `/api/v1/alerts/active` | Active blockage alerts |
| GET | `/api/v1/tickets` | All dispatch tickets |
| GET | `/api/v1/crews` | Field crew availability |
| POST | `/api/v1/dispatch` | Dispatch crew to drain |
| POST | `/api/v1/tickets/{id}/resolve` | Resolve a ticket |
| POST | `/api/v1/tickets/{id}/escalate` | Escalate to Sr. Engineer |
| POST | `/api/v1/weather/storm` | Toggle storm simulation |
| GET | `/api/v1/inference/{id}/frame` | YOLO-annotated JPEG frame |
| GET | `/api/v1/inference/{id}/raw-frame` | Raw camera frame |
| WS | `/api/v1/stream/alerts` | Real-time WebSocket feed |

## Plugging In Your Custom YOLO Model

1. Place your trained `.pt` weights file in the `backend/` directory
2. Set the environment variable:
   ```bash
   set YOLO_MODEL_PATH=your_custom_model.pt
   ```
3. Restart the backend — the inference pipeline auto-loads the new model

## Adding Real CCTV Video

Edit `backend/app/inference.py` → `generate_sample_frame()` method:

```python
# Replace the synthetic frame generation with:
import cv2
cap = cv2.VideoCapture("rtsp://your-camera-url")
ret, frame = cap.read()
```

## Tech Stack

**Frontend:** React 19 · TanStack Start/Router · Tailwind CSS 4 · Leaflet.js · TypeScript  
**Backend:** FastAPI · SQLAlchemy · SQLite · WebSockets · Uvicorn  
**ML Pipeline:** Ultralytics YOLOv8 · OpenCV · NumPy  
**Risk Engine:** Multi-signal fusion (blockage × weather × topology)
