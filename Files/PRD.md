# Product Requirement Document (PRD)

## Project: DrainageAI (v1.0)

**Document Status:** Draft

**Target Delivery:** Hackathon MVP

**Domain:** GovTech / Smart Cities / MLOps

---

## 1. Overview & Problem Statement

### 1.1 Executive Summary

Urban flooding across Tier-1 and Tier-2 Indian cities results in billions of rupees in damages and preventable loss of life every monsoon cycle. While cities blame unprecedented rainfall, the structural root cause is frequently blocked stormwater drains (clogged with plastic, silt, and construction debris).

Municipalities have already spent crores deploying thousands of CCTV cameras via the Smart Cities Mission. However, this infrastructure is used purely for reactive traffic monitoring or post-incident surveillance. **DrainageAI** is a software-only, cloud-native intelligence layer that repurposes these existing feeds into a real-time, distributed early-warning sensor network. It bridges the gap between passive video streaming and active civic dispatch without requiring any new physical hardware.

### 1.2 The Core Problem

* **The Inspection Paradox:** Manual inspections occur once a year (pre-monsoon), while blockages occur dynamically (mid-monsoon, post-festival, illegal midnight dumping).
* **The Sensor Cost Wall:** Outfitting millions of urban drains with physical IoT flow sensors is financially and operationally impossible ($₹10,000+$ crore nationwide).
* **The Data Silo:** Live CCTV streams, India Meteorological Department (IMD) rainfall predictions, and geographic GIS maps exist independently; they do not talk to each other to prevent disasters.

---

## 2. Target Users & Personas

### 2.1 The ICCC Operator (Integrated Command & Control Centre)

* **Context:** Sits in a centralized municipal command center monitoring hundreds of live video streams simultaneously.
* **Pain Points:** Information overload, alert fatigue, lack of clear triaging tools during heavy downpours.
* **Goal:** Needs an automated system to flag exact locations where a drain is actively failing so they can validate it instantly.

### 2.2 The Municipal Executive Engineer / Ward Officer

* **Context:** Responsible for field operations and dispatching *safai karamcharis* (sanitation workers) for maintenance.
* **Pain Points:** Limited personnel, political pressure over localized flooding videos going viral, inefficient manual routing.
* **Goal:** Needs actionable, prioritized work tickets ("Clear Drain X at Intersection Y *before* it rains in 3 hours") rather than blanket deployments.

---

## 3. Core Features & Functional Requirements

### Feature 1: RTSP/ONVIF Stream Ingestion & Preprocessing

* **Description:** A hardware-agnostic ingestion pipeline capable of consuming standardized network video streams from existing municipal camera infrastructure.
* **Functional Requirements:**
* Accept video inputs via mock RTSP feeds (using tools like MediaMTX/rtsp-simple-server for simulation).
* **Monsoon Night Preprocessing Layer:** Implement Contrast Limited Adaptive Histogram Equalization (CLAHE) or similar low-compute illumination enhancement algorithms to handle heavy rain, low-light, and storm conditions before sending frames to the CV model.



### Feature 2: Dual-Class CV Inference Engine

* **Description:** An object detection and instance segmentation pipeline optimized for detecting drain state metrics.
* **Functional Requirements:**
* **Class 1 (Debris Detection):** Detect and bound localized targets like plastic waste blocks, silt accumulation, and leaves over the storm drain grate.
* **Class 2 (Water Accumulation Segmentation):** Track water surface area relative to the sidewalk or curb to measure immediate flooding severity.



### Feature 3: Temporal Persistence Filter (Anti-False-Positive Layer)

* **Description:** A state-tracking algorithm designed to filter out transient objects (e.g., a passing vehicle blocking the frame, a moving shadow, or leaves temporarily blowing past).
* **Functional Requirements:**
* Maintain a rolling frame buffer ($N$ frames) per camera stream.
* Trigger a "Blockage Event" **only** if the detected debris object remains static across a specific time horizon (e.g., 10 minutes in real-world logic, or 30 consecutive frames in the hackathon simulation).



### Feature 4: Multi-Signal Risk Fusion Engine

* **Description:** A statistical risk-scoring engine that infers the critical priority of a blockage by combining visual metrics with real-time external data streams.
* **Functional Requirements:**
* Ingest live/mock weather data profiles (simulating IMD 6-hour localized rainfall forecasts).
* Calculate a unified **Risk Index ($RI$)** using the following display formula:



$$RI = (w_b \cdot A_b) + (w_r \cdot R_f) + (w_v \cdot V_t)$$

> **Where:**
> * $A_b$ = Percentage of drain area blocked (determined by bounding box/segmentation density).
> * $R_f$ = Anticipated 6-hour rainfall volume (in mm).
> * $V_t$ = Local topological vulnerability score (derived from GIS map telemetry indicating low-lying areas).
> * $w_b, w_r, w_v$ = Weight coefficients balancing blockage severity, incoming rain, and terrain risk.
> 
> 

### Feature 5: The Smart ICCC Operations Dashboard

* **Description:** A web-based single-pane-of-glass UI displaying real-time alert contexts for municipal operations.
* **Functional Requirements:**
* **Geospatial Map Canvas:** A map overlay showing green (clear), amber (monitored), and red (critical risk) indicators across camera coordinate pairs.
* **Inference Split-Screen:** Allow operators to click a marker to view the live video stream side-by-side with the YOLO bounding box inference layer.
* **Automated Dispatch Workflow:** A single-click module that auto-compiles an operational work ticket containing the exact street coordinates, priority index, and a timestamped visual snapshot of the blockage to send to field crews.



---

## 4. Feature Prioritization Matrix (Hackathon MVP Focus)

| Feature ID | Feature Name | Impact | Effort | Priority | MVP Inclusion |
| --- | --- | --- | --- | --- | --- |
| **F-01** | RTSP Feed Simulation Setup | High | Low | P0 | Yes |
| **F-02** | YOLO Debris Detection Model | High | Medium | P0 | Yes |
| **F-03** | Map & Split-Screen Dashboard | High | Medium | P0 | Yes |
| **F-04** | Multi-Signal Risk Fusion Engine | Medium | Low | P1 | Yes |
| **F-05** | Temporal Persistence Filter | High | Medium | P1 | Yes |
| **F-06** | Preprocessing Night-Vision Layer | Medium | Medium | P2 | Stretch Goal |
| **F-07** | Automated Crew WhatsApp/SMS Alerts | Medium | High | P3 | Post-MVP |

---

## 5. Non-Functional Requirements (NFRs)

* **Deployment Flexibility:** The solution must be completely cloud-compatible or capable of running on centralized municipal server pools—**zero localized edge-hardware dependencies** (like Jetson units) are permitted.
* **Modularity:** The model training architecture must support quick fine-tuning to accommodate varying drain architectures (e.g., open drains in Hyderabad vs. closed iron grates in Mumbai).
* **Standardization:** Interaction with cameras must rely entirely on universally accepted video protocols (RTSP/ONVIF), ensuring plug-and-play adaptability across diverse vendor hardware (Hikvision, Dahua, Honeywell, etc.).

---