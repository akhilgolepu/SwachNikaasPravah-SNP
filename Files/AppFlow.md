# Application Flow & User Experience Document (appflow.md)

## Project: DrainageAI (v1.0)

**Target Audience:** Frontend Developers / Hackathon UI Designers

---

## 1. Core UX Principles for GovTech Dashboards

To impress hackathon judges, the user experience must completely reject generic admin template designs. It needs to mimic high-stakes, real-time command systems (like flight control or emergency dispatch).

* **Dark Mode by Default:** Reduces eye strain for 24/7 ICCC operators and emphasizes neon alert states (Red/Amber/Green).
* **Three-Click Rule to Action:** An operator must be able to view an alert, verify the visual evidence, and dispatch a field crew in **three clicks or fewer**.
* **Zero Polling:** Status updates, map pin color transitions, and alert banners must update instantly via WebSocket pushes without requiring manual page refreshes.

---

## 2. Screen Architecture (The 3 Core Views)

```
                       +-----------------------------+
                       |   Main ICCC Map Dashboard   |  (Hero Screen)
                       +-----------------------------+
                          /                       \
                         /                         \
                        v                           v
+-----------------------------------+   +------------------------------------+
|  Drain Inventory & Stream Matrix  |   |  Dispatch & Ticket Control Center  |
+-----------------------------------+   +------------------------------------+

```

### Screen 1: Main ICCC Map Dashboard (The Hero View)

This is the workspace where the operator spends 90% of their time. It is a single-page, split-panel interface designed for instant situational awareness.

* **Left Panel (Real-Time Alert Feed):** A vertically scrolling stack of active blockages sorted strictly by their **Risk Index ($RI$)**. Critical alerts (Red) pulse at the top.
* **Center Panel (Interactive GIS Canvas):** A full-screen Mapbox/Leaflet dark-mapped canvas populated with coordinate-mapped drain nodes. Pins match the risk status colors. Clicking a pin isolates that specific drain's telemetry.
* **Right Drawer (Live Stream Inspection):** Slides out from the right when an alert or map pin is selected. It features a split-screen viewport showing the raw simulated RTSP stream next to the live YOLO inference layer (bounding boxes and segmentation masks), directly followed by the computed Risk metrics.

### Screen 2: Drain Inventory & Stream Matrix

A high-density operational grid view used to audit the health of the entire urban infrastructure network.

* **Filter Matrix:** Toggle view states by Ward Number, Risk Level, Camera Connection Health, or specific blockage types (e.g., Plastic vs. Silt).
* **The Grid Table:** Displays Camera ID, Location Name, Current Blockage %, Live IMD Local Forecast, and an "Uptime Status" metric (proving stream connectivity).
* **Quick-Action Actions:** Allows the operator to manually trigger a model recalibration or force-refresh an RTSP stream connection pipeline.

### Screen 3: Dispatch & Ticket Control Center

The operational transition layer where automated insights convert to real-world physical cleanup actions.

* **Visual Evidence Vault:** Shows a high-resolution, time-stamped capture of the frame that breached the persistence threshold.
* **Crew Assignment Workspace:** A clean form pre-populated with optimal field routing metrics, listing available *safai karamchari* teams sorted by proximity to the asset.
* **Action Command Bar:** Features distinct, high-contrast CTA buttons: `[DISPATCH CREW]`, `[DISMISS / FALSE POSITIVE]`, or `[ESCALATE TO SENIOR ENGINEER]`.

---

## 3. Step-by-Step User Journeys (The Demo Flows)

These two precise workflows should be used during your live hackathon pitch to showcase the execution capability of the software stack.

### Journey 1: Critical Alert Triage & Crew Dispatch (The Core Pitch Path)

```
[WebSocket Push] -> UI Sounds Alert -> Map Marker Pulses Red -> Operator Clicks Panel ->
Right Drawer Expands -> Review YOLO Output -> Clicks 'Dispatch' -> Ticket Generated

```

1. **The Trigger:** The FastAPI backend pushes a `BLOCKAGE_ALERT` packet via WebSockets because a drain's Risk Index has crossed the critical threshold ($RI > 70.00$).
2. **The UI Reaction:** The React dashboard sounds a subtle, low-frequency notification chime. The corresponding map marker flashes from Green to a pulsing Red, and a new alert card animates into the top of the Left Panel.
3. **The Inspection:** The operator clicks the pulsing alert card. The Right Drawer slides into view. The simulated camera feed plays smoothly, showcasing a drain blocked with plastic bottles, highlighted tightly by a neon-red YOLO bounding box.
4. **The Verification:** The operator reviews the metrics block inside the drawer: *Blockage: 78%, Predicted Rain: 45mm, Topo Risk: High*.
5. **The Resolution:** The operator clicks the `[Quick Dispatch]` button directly inside the drawer. A modal slides open showing the closest available field crew. The operator clicks `[Confirm Dispatch]`. The alert state transitions to `DISPATCHED` (turning Amber), a routing ticket is auto-generated, and the drawer closes.

### Journey 2: Proactive Weather-Risk Inspection (The Pre-Storm Path)

1. **The Action:** A heavy storm is projected for a specific zone in Hyderabad (e.g., Gachibowli). The Executive Engineer opens the **Drain Inventory & Stream Matrix** screen.
2. **The Filter:** The engineer filters the network data table by *Ward: Gachibowli* and sorts the list by *Upcoming Rainfall Forecast (Highest First)*.
3. **The Discovery:** The system bubbles up 5 drains that currently sit at a "Normal/Green" status visually, but have a high terrain vulnerability score and an incoming 65mm downpour alert.
4. **The Prevention:** Recognizing that even minor debris could trigger immediate failure under these weather conditions, the engineer batch-selects these 5 nodes and assigns a preventative inspection ticket to field teams, executing true proactive disaster management.