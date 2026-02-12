# Logistics & Personal Move Management System

## Project Overview
This project is a **Centralized Cloud Platform** where all roles interact with one shared database. It is designed to manage the full lifecycle of logistics, specifically optimized for the "Personal Move" (House Shift) scenario—the system's most complex use case. By integrating real-time GPS, inventory, and labor management, it provides a seamless flow from initial booking to final delivery.

## System Architecture
The platform is built on three core pillars:
*   **The Backend (The Engine):** Houses the primary logic for routing, inventory, and GenAI.
*   **The Frontend (The Dashboards):** Six different "Views" tailored specifically to each role.
*   **The Database (The Heart):** Stores all live data, including GPS, Stock, Labor, and Payments.

## Key Roles & Workflow
The system follows a sequential six-step process to ensure operational efficiency:

| Sequence | Role | Primary Tool | Output to Next Role |
| :--- | :--- | :--- | :--- |
| 1 | Individual/Vendor | Booking UI | Order Data (ORDER_ID) |
| 2 | Logistics Manager | Admin Dashboard | Approved Workflow Resource |
| 3 | Warehouse Manager | Inventory/Staff Map | Packed Box + Crew Logic |
| 4 | Dispatcher | Route Map | Assigned Route Execution |
| 5 | Driver | Mobile App | Proof of Delivery |
| 6 | AI Bot | Chat Interface | Customer Rating Support |

---

## Detailed Module Specifications

### 1. Logistics Manager (System Owner)
*   **Organizational Architecture:** Multi-warehouse provisioning and Role-Based Access Control (RBAC) to link managers to specific hubs.
*   **Global Control Tower:** Integrated fleet map using Google Maps to monitor active vehicles and real-time KPI visualization.
*   **Geofencing:** Digital boundaries that trigger "Auto-Arrival/Departure" timestamps and security alerts for unauthorized movement.
*   **Financial Ledger:** Monitors Cash on Delivery (COD) and automates payroll based on distance and performance.

### 2. Warehouse Manager (Regional Administrator)
*   **Inventory & Stock:** Real-time SKU tracking (Aisle/Shelf/Bin) and automated safety stock alerts.
*   **Resource Management:** Manages the labor roster and assigns "Helpers" to moves.
*   **Internal Mapping:** Digitized floor plans (2D grids) and dynamic slotting to maximize picking speed.

### 3. Dispatcher (Operational Coordinator)
*   **Dynamic Route Optimization:** Solves the "Traveling Salesman Problem" using automated batching and real-time traffic data.
*   **Constraint-Based Routing:** Accounts for vehicle size (e.g., avoiding narrow streets) and seat capacity for laborers.
*   **Crisis Management:** Real-time re-optimization of routes if a truck breaks down.

### 4. Driver (Field Execution - Mobile App)
*   **Interactive Manifest:** Digital checklists for vehicle check-in and sequential stop lists with special instructions.
*   **Geofence Integration:** Automatic "Driver is outside" notifications sent to customers when within 50m of the address.
*   **Proof of Delivery (PoD):** Captures photos, e-signatures, and QR scans to close orders.

### 5. AI Customer Support (The "Amazon-Style" Bot)
*   **Intelligent Tracking:** Pulls live GPS and ETA data to answer "Where is my stuff?".
*   **Autonomous Problem Solving:** Handles address corrections, rescheduling, and refund initiation.
*   **Escalation:** Uses sentiment analysis to "hot-swap" conversations to a human manager if a customer is angry.

---

## Generative AI Integration
The system leverages a Large Language Model (like Gemini) and Retrieval-Augmented Generation (RAG) to prevent hallucinations:

*   **Predictive Labor Scaling:** Suggests shifting staff between hubs based on predicted volume.
*   **AI Visual Volume Estimator:** Requesters can upload photos of their room; the AI estimates the number of boxes and laborers required.
*   **Smart Parking Assistant:** Analyzes historical data to suggest parking spots to drivers.
*   **Natural Language Analytics:** Managers can ask questions like *"Who was my most efficient driver last week?"* to get instant summaries and charts.

## Technical Requirements
*   **Core AI:** Large Language Model (Gemini).
*   **Data Retrieval:** RAG implementation for SQL database interaction.
*   **Maps API:** Google Maps Platform for fleet tracking and routing.
*   **Mobile Capabilities:** OCR for fuel receipt uploads and high-res image capture for PoD.
