#!/usr/bin/env python3
"""
Creates Milestone 2, required labels, parent issues, and frontend sub-issues
for the QuadCore-Devs repository.

Run via the GitHub Actions workflow: .github/workflows/create-milestone2-issues.yml
"""

import os
import sys
import json
import time
import requests

# ─────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────

TOKEN = os.environ["GITHUB_TOKEN"]
REPO  = os.environ["GITHUB_REPOSITORY"]   # e.g. "singh-yash129/QuadCore-Devs"

BASE  = "https://api.github.com"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

TEAM_ASSIGNEES = [
    "singh-yash129",   # Yashvardhan  – Frontend Developer / Code Reviewer
    "23f3001439",      # Siddarth S   – Product Manager / Scrum Master
    "23f1002103",      # Pruthvi Prasad S – Backend / Frontend Developer
    "heyitsgautham",   # Gautham Krishna S – Backend Developer / Tester
]

# ─────────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────────

def api(method, path, **kwargs):
    """Make a GitHub API call and return the parsed JSON."""
    url = f"{BASE}{path}"
    resp = requests.request(method, url, headers=HEADERS, **kwargs)
    if not resp.ok:
        print(f"  ⚠️  {method} {path} → {resp.status_code}: {resp.text[:300]}")
    return resp


def get_or_create_milestone(title, description):
    """Return the milestone number, creating it if it doesn't exist."""
    r = api("GET", f"/repos/{REPO}/milestones", params={"state": "all", "per_page": 100})
    if r.ok:
        for ms in r.json():
            if ms["title"] == title:
                print(f"  ✔ Milestone already exists: '{title}' (#{ms['number']})")
                return ms["number"]
    # Create
    r = api("POST", f"/repos/{REPO}/milestones", json={
        "title": title,
        "description": description,
        "state": "open",
    })
    if r.ok:
        num = r.json()["number"]
        print(f"  ✅ Created milestone: '{title}' (#{num})")
        return num
    sys.exit(f"Failed to create milestone '{title}': {r.status_code}")


def ensure_label(name, color, description):
    """Create a label if it doesn't already exist."""
    r = api("GET", f"/repos/{REPO}/labels/{requests.utils.quote(name, safe='')}")
    if r.status_code == 200:
        print(f"  ✔ Label already exists: '{name}'")
        return
    r = api("POST", f"/repos/{REPO}/labels", json={
        "name": name,
        "color": color,
        "description": description,
    })
    if r.ok:
        print(f"  ✅ Created label: '{name}'")
    else:
        print(f"  ⚠️  Could not create label '{name}': {r.status_code}")


def get_existing_issue_number(title):
    """Return the issue number if an open or closed issue with this title exists."""
    # Search first page of all issues (open + closed)
    for state in ("open", "closed"):
        r = api("GET", f"/repos/{REPO}/issues", params={
            "state": state, "per_page": 100
        })
        if r.ok:
            for issue in r.json():
                if issue.get("title") == title:
                    return issue["number"]
    return None


def create_issue(title, body, labels, milestone_number, assignees=None):
    """
    Create a GitHub issue (idempotent – skips if title already exists).
    Returns the issue number.
    """
    existing = get_existing_issue_number(title)
    if existing:
        print(f"  ✔ Issue already exists: '{title}' (#{existing})")
        return existing

    payload = {
        "title": title,
        "body": body,
        "labels": labels,
        "milestone": milestone_number,
        "assignees": assignees or TEAM_ASSIGNEES,
    }
    r = api("POST", f"/repos/{REPO}/issues", json=payload)
    if r.ok:
        num = r.json()["number"]
        print(f"  ✅ Created issue #{num}: '{title}'")
        time.sleep(0.3)   # gentle rate-limit protection
        return num
    sys.exit(f"Failed to create issue '{title}': {r.status_code} {r.text[:200]}")


def link_sub_issue(parent_number, child_id):
    """
    Attempt to link child_id as a sub-issue of parent_number using the
    GitHub sub-issues Beta API. Falls back gracefully if unavailable.
    """
    r = api("POST", f"/repos/{REPO}/issues/{parent_number}/sub_issues",
            json={"sub_issue_id": child_id})
    if r.ok:
        print(f"    🔗 Linked issue id={child_id} as sub-issue of #{parent_number}")
    else:
        print(f"    ℹ️  Sub-issues API returned {r.status_code} – "
              "manual linking may be required")


def get_issue_node_id(issue_number):
    """Return the REST id (integer) for linking sub-issues."""
    r = api("GET", f"/repos/{REPO}/issues/{issue_number}")
    if r.ok:
        return r.json().get("id")
    return None


# ─────────────────────────────────────────────────────────────────
# Issue content definitions
# ─────────────────────────────────────────────────────────────────

PARENT_ISSUES = [
    {
        "title": "[M2] Project Schedule",
        "labels": ["documentation", "scheduling"],
        "body": """\
## 🎯 Objective
Develop a comprehensive schedule for the overall project based on the user stories from Milestone 1.

## 📋 Tasks
- [ ] Identify all major deliverables and map them to user stories
- [ ] Define project phases (Discovery → Design → Development → Testing → Deployment)
- [ ] Estimate durations and set target dates for each phase
- [ ] Document in a Gantt-chart-friendly format (table or linked Gantt chart)

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **PM/SM:** Siddarth S
- **Contributors:** Pruthvi Prasad S, Gautham Krishna S

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] Overall project timeline documented
- [ ] Phases and milestones clearly identified
- [ ] Schedule reviewed and approved by the team
""",
    },
    {
        "title": "[M2] Sprint/Iteration Schedule",
        "labels": ["scheduling"],
        "body": """\
## 🎯 Objective
Detail schedules for sprints and scrum meetings. Provide links/attachments for Trello board, Gantt chart, and task/resource allocation.

## 📋 Tasks
- [ ] Define sprint length and cadence (e.g., 2-week sprints)
- [ ] Create sprint backlog for each sprint
- [ ] Link Trello board (Kanban) with sprint cards
- [ ] Attach or link Gantt chart showing tasks and owners
- [ ] Schedule recurring scrum stand-up and review meetings
- [ ] Document resource allocation per sprint

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **PM/SM:** Siddarth S (Scrum Master)
- **Contributors:** Pruthvi Prasad S, Gautham Krishna S

## 🔗 Attachments
- [ ] Trello board link
- [ ] Gantt chart screenshot/file
- [ ] Sprint calendar

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] Sprint schedule documented for all sprints
- [ ] Gantt chart attached/linked
- [ ] Trello board linked and populated
""",
    },
    {
        "title": "[M2] Scheduling Tools Documentation",
        "labels": ["documentation", "scheduling"],
        "body": """\
## 🎯 Objective
Document which scheduling tools are being used (or will be used) for this project.

## 📋 Tasks
- [ ] List all scheduling and project management tools in use (e.g., Jira, Pivotal Tracker, Trello, GitHub Projects)
- [ ] Describe how each tool is used (sprints, backlog, Kanban, etc.)
- [ ] Provide screenshots or links to the active boards
- [ ] Justify tool choices

## 🛠️ Tools to Document
- GitHub Projects / Kanban board
- Trello (if used)
- Jira or Pivotal Tracker (if applicable)
- Gantt chart tool (e.g., TeamGantt, GanttProject, or spreadsheet)

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **PM/SM:** Siddarth S

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] All tools listed and described
- [ ] Screenshots/links provided
- [ ] Section added to the Milestone 2 PDF report
""",
    },
    {
        "title": "[M2] Design of System Components",
        "labels": ["design"],
        "body": """\
## 🎯 Objective
Describe the system components of the Cargo-Core platform based on the user stories from previous milestones.

## 📋 Tasks
- [ ] Identify all major system components (Frontend, Backend, Database, AI Module, Maps API)
- [ ] Describe each component's responsibilities and interfaces
- [ ] Create a component interaction diagram
- [ ] Map components to user roles (Logistics Manager, Warehouse Manager, Dispatcher, Driver, Customer Support)
- [ ] Document APIs and data flow between components

## 🏗️ Components to Design
- Booking & Order Management Module
- Fleet & Route Optimization Module
- Inventory & Warehouse Module
- Driver Mobile App Module
- AI Customer Support Module
- Notifications & Real-time Updates Module

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Backend:** Gautham Krishna S
- **Frontend:** Pruthvi Prasad S

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] All components identified and described
- [ ] Component diagram created
- [ ] Components mapped to user stories from Milestone 1
""",
    },
    {
        "title": "[M2] Software Design – Class Diagrams",
        "labels": ["design"],
        "body": """\
## 🎯 Objective
Develop UML class diagrams for the proposed Cargo-Core system.

## 📋 Tasks
- [ ] Identify all major classes and entities
- [ ] Define attributes and methods for each class
- [ ] Define relationships (inheritance, composition, association)
- [ ] Create UML class diagrams for each module
- [ ] Review diagrams against user stories from Milestone 1

## 📐 Diagrams Required
- [ ] Order & Booking class diagram
- [ ] Fleet & Route class diagram
- [ ] User & Role Management class diagram
- [ ] Inventory & Warehouse class diagram
- [ ] Notification & Event class diagram

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Backend:** Gautham Krishna S
- **Contributors:** Pruthvi Prasad S

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] UML class diagrams completed for all modules
- [ ] Diagrams reviewed and approved by the team
- [ ] Diagrams included in the Milestone 2 PDF report
""",
    },
    {
        "title": "[M2] Database Design – Schema & ER Diagram",
        "labels": ["design", "backend"],
        "body": """\
## 🎯 Objective
Draft the initial database schema and entity-relationship (ER) diagram for the Cargo-Core platform.

## 📋 Tasks
- [ ] Identify all database entities and their attributes
- [ ] Define primary and foreign keys
- [ ] Design ER diagram
- [ ] Normalize the schema (3NF)
- [ ] Document indexes and performance considerations
- [ ] Review schema against user stories and use cases

## 🗃️ Key Entities
- Users / Roles (Logistics Manager, Warehouse Manager, Dispatcher, Driver, Customer)
- Orders / Bookings
- Routes / Stops
- Fleet / Vehicles
- Inventory / SKUs
- Payments / COD
- Notifications / Events

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Backend/DB:** Gautham Krishna S
- **Contributors:** Pruthvi Prasad S

## 🔗 References
- See `docs/Overviews-Blueprint/Database Schema Design.pdf` for initial draft
- See `docs/Overviews-Blueprint/Datebase Design.png` for visual reference

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] Full ER diagram created
- [ ] Schema documented with table definitions
- [ ] Schema reviewed and included in Milestone 2 PDF report
""",
    },
    {
        "title": "[M2] Scrum Meeting Details & Minutes",
        "labels": ["meeting", "documentation"],
        "body": """\
## 🎯 Objective
Document and maintain minutes/notes for scrum meetings conducted during Milestone 2.

## 📋 Tasks
- [ ] Record minutes for Sprint Planning meetings
- [ ] Record minutes for Sprint Review/Retrospective meetings
- [ ] Record minutes for daily stand-ups (at least 3)
- [ ] Format minutes using the MOM template (`docs/Minutes of Meeting/MOM_TEMPLATE.md`)
- [ ] Store all MOM files in `docs/Minutes of Meeting/`

## 📝 Meetings to Document
- [ ] Sprint 1 Planning
- [ ] Sprint 1 Review & Retrospective
- [ ] Sprint 2 Planning (if applicable)
- [ ] Stand-up meetings (minimum 3)

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Scrum Master:** Siddarth S
- **All members:** Pruthvi Prasad S, Gautham Krishna S

## 🔗 Existing MOM Files
- `docs/Minutes of Meeting/MOM_08-02-2026.md`
- `docs/Minutes of Meeting/MOM_11-02-2026.md`
- `docs/Minutes of Meeting/MOM_17-02-2026.md`
- `docs/Minutes of Meeting/MOM_21-02-2026.md`

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Scheduling & Design**.

## ✅ Definition of Done
- [ ] At least 3 meeting minutes documented for Milestone 2 period
- [ ] All MOM files committed to the repository
- [ ] Meeting notes included in Milestone 2 PDF report
""",
    },
    {
        "title": "[M2] Frontend Deliverables – UI Pages",
        "labels": ["frontend", "documentation"],
        "body": """\
## 🎯 Objective
List and design the UI pages for the Cargo-Core platform. Sub-issues track each page individually. Include screenshots of completed pages and note those still pending.

## 📋 Tasks
- [ ] Design all major UI pages (Vue.js / HTML-CSS-JS)
- [ ] Capture screenshots of completed pages
- [ ] Identify pages still pending design/implementation
- [ ] Ensure Frontend README (`frontend/README.md`) has install/run instructions
- [ ] Update this issue as pages are completed

## 🖥️ Mobile App Pages (Driver App) – Sub-issues below
| Page | Status |
|------|--------|
| Launch Splash Screen | 🔧 Pending |
| Secure Login Screen | 🔧 Pending |
| Driver Command Center | 🔧 Pending |
| Mission Manifest View | 🔧 Pending |
| Live Route Navigation | 🔧 Pending |
| Delivery Execution Tasklist | 🔧 Pending |
| Load Verification Gate | 🔧 Pending |
| Damage Reporting Flow | 🔧 Pending |
| COD Payment Capture | 🔧 Pending |
| Fuel Receipt Upload | 🔧 Pending |
| Geofence Arrival Automation | 🔧 Pending |
| Route Deviation Log | 🔧 Pending |
| Offline Sync Queue | 🔧 Pending |
| Safety Score Details | 🔧 Pending |
| AI Voice Assistant Overlay | 🔧 Pending |
| Crew Attendance Manager | 🔧 Pending |
| Crisis Management Mode | 🔧 Pending |
| Earnings & Performance Wallet | 🔧 Pending |
| Vehicle Binding Ritual | 🔧 Pending |
| Shift Summary & Close-out | 🔧 Pending |

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Frontend:** Pruthvi Prasad S
- **Contributors:** Gautham Krishna S

## 🔗 References
- Frontend README: `frontend/README.md`
- UI References: `docs/UI-references-Mobile/`

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Frontend Deliverables**.

## ✅ Definition of Done
- [ ] All major pages designed (wireframe or implementation)
- [ ] Screenshots captured for completed pages
- [ ] Frontend README updated with run instructions
- [ ] Pages included in Milestone 2 PDF report
""",
    },
    {
        "title": "[M2] Milestone 2 PDF Report – Consolidated Deliverables",
        "labels": ["documentation"],
        "body": """\
## 🎯 Objective
Compile all Milestone 2 components into a single consolidated PDF report for submission.

## 📋 PDF Structure
1. **Project Schedule** – Overall project timeline
2. **Sprint/Iteration Schedule** – Sprint plan, Trello board, Gantt chart screenshots
3. **Scheduling Tools** – Tools used and how they are configured
4. **Design of Components** – System component diagram and descriptions
5. **Software Design** – UML class diagrams for all modules
6. **Database Design** – ER diagram and schema documentation
7. **Scrum Meeting Minutes** – Notes from at least 3 meetings
8. **Frontend Deliverables** – Screenshots of all UI pages; zipped frontend code with README

## 📎 Attachments Required
- [ ] Screenshots of Gantt chart
- [ ] Screenshots of Kanban board
- [ ] Screenshots of all completed frontend pages
- [ ] Zipped frontend code with README

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **All members:** Siddarth S, Pruthvi Prasad S, Gautham Krishna S

## 📌 Kanban
Track progress on the Kanban/Project board under **Milestone 2 – Report Compilation**.

## ✅ Definition of Done
- [ ] All sections compiled into a single PDF
- [ ] Formatting checked against project requirements
- [ ] PDF exported and ready for submission
- [ ] All screenshots and attachments included
""",
    },
]

# ─────────────────────────────────────────────────────────────────
# Frontend sub-issues (20 UI pages)
# ─────────────────────────────────────────────────────────────────

FRONTEND_PAGES = [
    ("Launch Splash Screen",          "launch_splash_screen"),
    ("Secure Login Screen",           "secure_login_screen"),
    ("Driver Command Center",         "driver_command_center"),
    ("Mission Manifest View",         "mission_manifest_view"),
    ("Live Route Navigation",         "live_route_navigation"),
    ("Delivery Execution Tasklist",   "delivery_execution_tasklist"),
    ("Load Verification Gate",        "load_verification_gate"),
    ("Damage Reporting Flow",         "damage_reporting_flow"),
    ("COD Payment Capture",           "cod_payment_capture"),
    ("Fuel Receipt Upload",           "fuel_receipt_upload"),
    ("Geofence Arrival Automation",   "geofence_arrival_automation"),
    ("Route Deviation Log",           "route_deviation_log"),
    ("Offline Sync Queue",            "offline_sync_queue"),
    ("Safety Score Details",          "safety_score_details"),
    ("AI Voice Assistant Overlay",    "ai_voice_assistant_overlay"),
    ("Crew Attendance Manager",       "crew_attendance_manager"),
    ("Crisis Management Mode",        "crisis_management_mode"),
    ("Earnings & Performance Wallet", "earnings_&_performance_wallet"),
    ("Vehicle Binding Ritual",        "vehicle_binding_ritual"),
    ("Shift Summary & Close-out",     "shift_summary_&_close-out"),
]


def sub_issue_body(page_name, page_slug, parent_number):
    return f"""\
## 🖥️ UI Page: {page_name}

🔧 **Status: Pending**

## 📋 Tasks
- [ ] Create wireframe/mockup for **{page_name}**
- [ ] Implement page in Vue.js / HTML-CSS-JS
- [ ] Capture screenshot of completed page
- [ ] Review against user stories from Milestone 1
- [ ] Update status table in parent issue #{parent_number}

## 🔗 References
- UI Reference assets: `docs/UI-references-Mobile/{page_slug}/`
- Parent issue: #{parent_number}

## 👥 Team
- **Lead:** Yashvardhan (`singh-yash129`)
- **Frontend:** Pruthvi Prasad S

## 📌 Kanban
Track on the Kanban/Project board under **Milestone 2 – Frontend Deliverables**.

## ✅ Definition of Done
- [ ] Page implemented and functional
- [ ] Screenshot captured and added to parent issue #{parent_number}
- [ ] Code committed to the `frontend/` directory
"""


# ─────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────

def main():
    print(f"\n🚀 Creating Milestone 2 structure for {REPO}\n")

    # 1. Milestone
    print("── Step 1: Milestone ──────────────────────────")
    ms_number = get_or_create_milestone(
        title="Milestone 2",
        description=(
            "Focus: Scheduling and Design – project schedule, sprint schedules, "
            "system component design, class diagrams, database design, scrum meetings, "
            "frontend deliverables, and consolidated PDF report."
        ),
    )

    # 2. Labels
    print("\n── Step 2: Labels ─────────────────────────────")
    ensure_label("design",      "1d76db", "System, software, and database design tasks")
    ensure_label("frontend",    "e4e669", "UI/UX and frontend development tasks")
    ensure_label("backend",     "0075ca", "Backend and database development tasks")
    ensure_label("meeting",     "d93f0b", "Scrum meeting notes and minutes")
    ensure_label("scheduling",  "0e8a16", "Project and sprint scheduling tasks")

    # 3. Parent issues
    print("\n── Step 3: Parent issues ──────────────────────")
    parent_numbers = {}
    for issue_def in PARENT_ISSUES:
        num = create_issue(
            title=issue_def["title"],
            body=issue_def["body"],
            labels=issue_def["labels"],
            milestone_number=ms_number,
        )
        parent_numbers[issue_def["title"]] = num

    # 4. Frontend sub-issues
    print("\n── Step 4: Frontend sub-issues ────────────────")
    frontend_parent = parent_numbers.get("[M2] Frontend Deliverables – UI Pages")
    if not frontend_parent:
        print("  ⚠️  Could not find frontend parent issue – skipping sub-issues")
    else:
        for page_name, page_slug in FRONTEND_PAGES:
            sub_title = f"[M2][Frontend] UI Page: {page_name}"
            body = sub_issue_body(page_name, page_slug, frontend_parent)
            sub_num = create_issue(
                title=sub_title,
                body=body,
                labels=["frontend"],
                milestone_number=ms_number,
            )
            # Attempt to link as a GitHub sub-issue
            sub_id = get_issue_node_id(sub_num)
            if sub_id:
                link_sub_issue(frontend_parent, sub_id)

    # 5. Summary
    print("\n── Summary ────────────────────────────────────")
    print(f"  Milestone 2 → #{ms_number}")
    for title, num in parent_numbers.items():
        print(f"  #{num:4d}  {title}")

    print("\n✅ Done!\n")


if __name__ == "__main__":
    main()
