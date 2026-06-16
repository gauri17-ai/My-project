Product Requirements Document (PRD)
Product Name: AI Website Development Mentor Chatbot
Version: 1.0
Document Type: Final Consolidated Product Requirements Document
Prepared For: Web Development Team
Status: Final Draft
Source Coverage: Consolidates all original PRD volumes and the additional AI conversation specification in English without removing sections.
Table of Contents
Part 1: Business & Product Requirements
Part 2: Functional Requirements, User Stories, Use Cases & Conversation Flows
Part 3: Frontend Specifications, Screens, Permissions, UI Components & Validation Rules
Part 4: Backend Architecture, APIs, Database Design, Security & System ArchitectureDetailed Database Schema Addendum
Detailed API Contracts Addendum
AI/LLM Implementation Specification
Security, Admin, Knowledge Base, and Deployment Addendums

Part 5: Testing, Edge Cases, Acceptance Criteria, QA & Final Handover
Part 6: Additional AI Conversation Specification
Part 1: Business & Product Requirements
1. Executive Summary
AI Website Development Mentor Chatbot is an AI-powered conversational assistant that will provide end-to-end guidance to users throughout the website and web application development lifecycle.
The chatbot will support users from idea validation through requirement gathering, project planning, feature identification, technology selection, documentation generation, testing guidance, and deployment guidance.
The primary objective of the system is to explain the website and web application development process to beginners, students, freelancers, startup founders, and developers in a professional and structured manner.
2. Problem Statement
Many users have an application or website idea, but they commonly face the following problems:
PS-001
They are unable to define requirements properly.
PS-002
The project scope is not clear.
PS-003
They are unable to prepare a feature list.
PS-004
They face difficulty selecting the technology stack.
PS-005
They are unable to prepare PRDs, user stories, and use cases.
PS-006
They do not understand the testing process.
PS-007
A development roadmap is not available.
3. Proposed Solution
The system will operate as an AI-powered mentor.
The user will provide a project idea.
Example:
"I want to build a Food Delivery App"
The chatbot will execute the following process:
Idea Analysis
Requirement Discovery
Smart Question Generation
Scope Definition
Feature Identification
Technology Recommendation
Documentation Generation
Development Guidance
Testing Guidance
4. Product Vision
Create the most comprehensive AI mentor for learning and planning website and web application development.
5. Product Mission
Provide intelligent guidance to users in every phase of the software development lifecycle.
6. Product Goals
PG-001
Collect project requirements.
PG-002
Identify business requirements.
PG-003
Provide technology recommendations.
PG-004
Create a development roadmap.
PG-005
Automate documentation generation.
PG-006
Increase testing awareness.
PG-007
Teach development best practices to users.
7. Project Scope
In Scope:
Website Planning
Web App Planning
Requirement Gathering
Feature Discovery
User Flow Creation
Technology Recommendations
PRD Guidance
SRS Guidance
User Stories Guidance
Testing Guidance
Deployment Guidance
Out of Scope:
Automatic Code Generation
Direct Software Deployment
Hosting Management
Payment Processing
Live Infrastructure Management
7.1 MVP Scope and Phase Plan
This section defines what must be built first and what can be deferred. It is intended to help developers estimate effort, create milestones, and avoid scope confusion.
MVP Version 1.0 - Must Build:
Landing page, login, registration, dashboard, new project screen, chat interface, project summary, documentation screen, roadmap screen, technology recommendation screen, profile screen, and admin dashboard.
User registration, login, logout, JWT authentication, refresh token handling, and protected routes.
Project create, read, update, delete, and save history.
AI chat with project context and one-question-at-a-time requirement discovery.
Requirement completion tracking with percentage.
Feature recommendation, technology recommendation, roadmap generation, PRD guidance, user stories, and use cases.
Export generated documents in Markdown at minimum.
Admin user listing, conversation analytics view, and basic knowledge base management.
Database tables defined in the detailed database schema addendum.
API contracts defined in the detailed API contracts addendum.
MVP Version 1.0 - Should Build If Time Allows:
PDF and DOCX export.
Forgot password and reset password flow.
Email verification after registration.
Admin user suspend/activate actions.
Knowledge base import from Markdown or text files.
Basic usage analytics.
Phase 2 - Future Build:
Team collaboration workspace.
Template library.
Learning center.
Project comparison engine.
Visual flow generator.
Architecture diagram generator.
Multi-project workspace enhancements.
Advanced AI mentor modes with mode switching UI.
Phase 3 - Advanced Build:
Organization accounts.
Shared projects and team permissions.
Advanced analytics dashboard.
Document version comparison.
Integration with external tools such as GitHub, Jira, Notion, or Google Docs.
Production-grade deployment automation.
8. Stakeholders
Primary Stakeholders:
Students
Beginner Developers
Freelancers
Startup Founders
Product Managers
Secondary Stakeholders:
Business Owners
Trainers
Software Teams
9. User Roles
UR-001 Guest User
Permissions:
Open chatbot
Ask limited questions
View basic responses
UR-002 Registered User
Permissions:
Create projects
Save chat history
Generate documentation
Access roadmap guidance
UR-003 Admin
Permissions:
Manage users
View conversations
Manage knowledge base
View analytics
Manage system settings
10. High-Level User Journey
Flow 1:
Project Planning Flow
User Opens Chatbot
->
User Describes Idea
->
AI Analyzes Idea
->
Requirement Discovery
->
Questions Generated
->
User Answers Questions
->
Requirements Finalized
->
Feature List Generated
->
Technology Stack Suggested
->
Roadmap Generated
->
Documentation Generated
11. Core Modules
M-001 User Management Module
Purpose:
Manage users and authentication.
M-002 Conversation Engine
Purpose:
Handle chat interactions.
M-003 Requirement Discovery Engine
Purpose:
Collect complete requirements through intelligent questioning.
M-004 Project Analysis Engine
Purpose:
Analyze project scope and complexity.
M-005 Feature Recommendation Engine
Purpose:
Recommend project features.
M-006 Technology Recommendation Engine
Purpose:
Suggest frontend, backend, database and infrastructure technologies.
M-007 Documentation Engine
Purpose:
Generate PRD, User Stories, Use Cases and SRS.
M-008 Development Guidance Engine
Purpose:
Guide development process.
M-009 Testing Guidance Engine
Purpose:
Provide testing recommendations.
M-010 Knowledge Base Engine
Purpose:
Store development knowledge.
M-011 Admin Management Module
Purpose:
Manage platform operations.
12. Functional Requirements
FR-001
System shall allow users to start a new project discussion.
FR-002
System shall analyze user project ideas.
FR-003
System shall identify missing requirements.
FR-004
System shall generate intelligent follow-up questions.
FR-005
System shall collect user responses.
FR-006
System shall create project scope.
FR-007
System shall identify user roles.
FR-008
System shall generate feature recommendations.
FR-009
System shall recommend technology stacks.
FR-010
System shall generate development roadmaps.
FR-011
System shall generate PRD guidance.
FR-012
System shall generate User Stories.
FR-013
System shall generate Use Cases.
FR-014
System shall provide testing guidance.
FR-015
System shall maintain conversation context.
13. Non-Functional Requirements
NFR-001
System should be easy to use.
NFR-002
System should support mobile and desktop devices.
NFR-003
System should provide responses within acceptable time limits.
NFR-004
System should support 5 languages (English, Hindi, Marathi, Hinglish, and Maranglish).
NFR-005
System should maintain chat history.
NFR-006
System should be scalable for future enhancements.
14. Success Metrics
Number of project plans generated
Number of documentation requests
User engagement rate
User satisfaction score
Roadmap generation count
15. Assumptions
User will provide project idea.
User will answer requirement gathering questions.
Knowledge base will contain software development knowledge.
16. Constraints
Recommendations depend on user-provided information.
AI-generated outputs require user review.
System cannot guarantee implementation success without development effort.
End of PRD Volume 1
Part 2: Functional Requirements, User Stories, Use Cases & Conversation Flows
1. Requirement Discovery Engine
Module ID
M-003
Purpose
Take an incomplete project idea from the user and convert it into complete project requirements.
Module Workflow:
User Idea
->
Idea Analysis
->
Requirement Gap Detection
->
Question Generation
->
User Answers
->
Requirement Validation
->
Project Scope Creation
->
Feature Identification
->
Technology Recommendation
->
Roadmap Generation
->
Documentation Generation
Functional Requirements:
FR-016
System shall analyze user project ideas.
FR-017
System shall detect missing requirements.
FR-018
System shall generate context-aware questions.
FR-019
System shall collect requirement answers.
FR-020
System shall validate collected requirements.
FR-021
System shall generate project scope.
FR-022
System shall identify project features.
FR-023
System shall identify project actors.
FR-024
System shall create project summary.
2. Conversation Engine
Module ID
M-002
Purpose
Provide natural conversational interaction.
Functional Requirements:
FR-025
System shall support multi-turn conversations.
FR-026
System shall remember project context.
FR-027
System shall generate contextual responses.
FR-028
System shall maintain session continuity.
FR-029
System shall support Marathi language.
FR-030
System shall support Hindi language.
FR-031
System shall support English language.
FR-031A
System shall support Hinglish (Hindi + English) language.
FR-031B
System shall support Maranglish (Marathi + English) language.
FR-032
System shall reply in the user's preferred or selected language (supporting English, Hindi, Marathi, Hinglish, and Maranglish for both input and output).
3. Technology Recommendation Engine
Module ID
M-006
Purpose
Suggest a suitable technology stack.
Functional Requirements:
FR-033
System shall recommend frontend technologies.
FR-034
System shall recommend backend technologies.
FR-035
System shall recommend databases.
FR-036
System shall recommend authentication methods.
FR-037
System shall recommend testing tools.
FR-038
System shall recommend deployment approaches.
4. Documentation Engine
Module ID
M-007
Purpose
Generate development documentation guidance.
Functional Requirements:
FR-039
System shall generate PRD guidance.
FR-040
System shall generate User Stories.
FR-041
System shall generate Use Cases.
FR-042
System shall generate Functional Requirements.
FR-043
System shall generate Testing Guidance.
FR-044
System shall generate Roadmap Documentation.
5. Development Guidance Engine
Module ID
M-008
Functional Requirements:
FR-045
System shall explain frontend development process.
FR-046
System shall explain backend development process.
FR-047
System shall explain database design concepts.
FR-048
System shall explain API architecture.
FR-049
System shall explain deployment workflow.
6. Testing Guidance Engine
Module ID
M-009
Functional Requirements:
FR-050
System shall explain testing process.
FR-051
System shall generate test scenarios.
FR-052
System shall generate test case templates.
FR-053
System shall explain bug reporting process.
7. Primary User Flow
UF-001 Project Planning Flow
User Opens Chatbot
->
User Enters Project Idea
->
Idea Analysis
->
Requirement Discovery
->
AI Questions
->
User Answers
->
Requirement Validation
->
Feature Generation
->
Technology Recommendation
->
Roadmap Creation
->
Documentation Guidance
->
Development Guidance
->
Testing Guidance
->
End
8. Food Delivery App Example Flow
UF-002
User:
"I want to build a Food Delivery App"
AI:
What platforms are required->
Website
Mobile App
Both
->
User Answer
->
AI:
Which user roles are required->
Customer
Restaurant
Delivery Partner
Admin
->
User Answer
->
AI:
Payment methods required->
->
User Answer
->
AI:
Real-time tracking required->
->
User Answer
->
Requirements Complete
->
Feature List Generated
->
Technology Recommendation
->
Roadmap Generated
9. User Stories
US-001
As a user,
I want to describe my project idea,
So that I can receive development guidance.
US-002
As a user,
I want the chatbot to ask follow-up questions,
So that missing requirements can be identified.
US-003
As a user,
I want feature recommendations,
So that I can define project scope.
US-004
As a user,
I want technology recommendations,
So that I can select suitable technologies.
US-005
As a user,
I want documentation guidance,
So that I can prepare project documents.
US-006
As a user,
I want roadmap generation,
So that I can plan development phases.
US-007
As a user,
I want testing guidance,
So that I can understand quality assurance.
US-008
As an admin,
I want to manage users,
So that platform usage can be monitored.
US-009
As an admin,
I want to view conversations,
So that chatbot performance can be reviewed.
10. Use Cases
UC-001 Project Requirement Discovery
Actor:
User
Precondition:
User opens chatbot.
Steps:
User enters project idea.
System analyzes idea.
System identifies missing requirements.
System asks questions.
User answers questions.
System validates requirements.
System creates project scope.
Postcondition:
Project requirements collected.
UC-002 Technology Recommendation
Actor:
User
Precondition:
Requirements available.
Steps:
System analyzes requirements.
System evaluates project complexity.
System recommends technology stack.
Postcondition:
Technology recommendations generated.
UC-003 Documentation Guidance
Actor:
User
Steps:
User requests documentation.
System identifies document type.
System generates guidance.
Postcondition:
Documentation guidance available.
11. Acceptance Criteria
AC-001
Given a project idea,
When user submits idea,
Then system shall analyze it successfully.
AC-002
Given incomplete requirements,
When analysis completes,
Then system shall ask follow-up questions.
AC-003
Given completed requirements,
When validation succeeds,
Then system shall generate project scope.
AC-004
Given project scope,
When recommendation process runs,
Then system shall generate feature suggestions.
AC-005
Given project requirements,
When technology analysis completes,
Then system shall provide technology recommendations.
12. Business Rules
BR-001
System must collect sufficient requirements before recommendations.
BR-002
System must maintain conversation context.
BR-003
System must respond in user language.
BR-004
System must not skip requirement gathering phase.
End of PRD Volume 2
Part 3: Frontend Specifications, Screens, Permissions, UI Components & Validation Rules
1. Frontend Overview
Frontend system shall provide a clean, responsive and beginner-friendly interface.
Supported Devices:
Desktop
Laptop
Tablet
Mobile
Framework Recommendation:
React.js
Next.js
TypeScript
Tailwind CSS
2. Screen Inventory
SCR-001 Landing Page
Purpose:
Introduce platform.
Components:
Logo
Hero Section
Features Section
About Section
Login Button
Signup Button
Start Chat Button
Buttons:
BTN-001 Login
BTN-002 Signup
BTN-003 Start Chat
SCR-002 Login Page
Fields:
Email
Password
Buttons:
BTN-004 Login
BTN-005 Forgot Password
BTN-006 Back
Validation:
Email required
Password required
SCR-003 Registration Page
Fields:
Full Name
Email
Password
Confirm Password
Buttons:
BTN-007 Register
BTN-008 Login Instead
Validation:
Name required
Email unique
Password minimum 8 characters
Confirm password match
SCR-003A Forgot Password Page
Fields:
Email
Buttons:
BTN-008A Send Reset Link
BTN-008B Back To Login
Validation:
Email required
Email must follow valid email format
Expected Behavior:
User enters registered email.
System sends password reset link or OTP.
System displays a generic success message even if email does not exist, to prevent account enumeration.
SCR-003B Reset Password Page
Fields:
New Password
Confirm New Password
Buttons:
BTN-008C Reset Password
BTN-008D Back To Login
Validation:
Reset token required
New password minimum 8 characters
Confirm password must match
Reset token must not be expired
SCR-003C Email Verification Screen
Components:
Verification status message
Resend verification email action
Buttons:
BTN-008E Resend Verification Email
BTN-008F Continue To Login
Expected Behavior:
User receives verification link after registration.
User can resend verification email.
System marks email_verified_at after successful verification.
SCR-004 Dashboard
Purpose:
Main user workspace.
Components:
Sidebar
Recent Projects
Chat History
New Project Button
Buttons:
BTN-009 New Project
BTN-010 Open Project
BTN-011 Delete Project
BTN-012 Profile
SCR-005 New Project Screen
Fields:
Project Name
Project Category
Project Description
Buttons:
BTN-013 Create Project
BTN-014 Cancel
Validation:
Project Name Required
Description Required
SCR-006 Chat Interface
Purpose:
Main AI interaction screen.
Components:
Chat Window
User Input Box
Send Button
Suggested Questions
AI Response Area
Buttons:
BTN-015 Send
BTN-016 New Chat
BTN-017 Export Chat
BTN-018 Save Project
BTN-019 Clear Chat
SCR-007 Project Summary Screen
Components:
Project Overview
Requirements
Features
User Roles
Recommendations
Buttons:
BTN-020 Edit Requirements
BTN-021 Generate Roadmap
BTN-022 Generate Documentation
SCR-008 Documentation Screen
Components:
PRD Section
User Stories
Use Cases
Functional Requirements
Buttons:
BTN-023 Generate PRD
BTN-024 Generate User Stories
BTN-025 Generate Use Cases
BTN-026 Download
SCR-009 Roadmap Screen
Components:
Development Phases
Timeline
Tasks
Buttons:
BTN-027 Generate Roadmap
BTN-028 Export Roadmap
SCR-010 Technology Recommendation Screen
Components:
Frontend Recommendation
Backend Recommendation
Database Recommendation
Testing Recommendation
Buttons:
BTN-029 Generate Stack
BTN-030 Regenerate Recommendation
SCR-011 User Profile Screen
Components:
User Details
Saved Projects
Preferences
Buttons:
BTN-031 Edit Profile
BTN-032 Save Changes
BTN-033 Logout
SCR-012 Admin Dashboard
Components:
User Management
Conversation Analytics
Knowledge Base
Reports
Buttons:
BTN-034 Manage Users
BTN-035 View Analytics
BTN-036 Manage Knowledge Base
SCR-013 Admin User Management Screen
Components:
User list
Search and filters
User role
User status
Last login
Buttons:
BTN-037 View User
BTN-038 Suspend User
BTN-039 Activate User
BTN-040 Change Role
SCR-014 Knowledge Base Management Screen
Components:
Knowledge base article list
Category filter
Article editor
Published/Draft status
Buttons:
BTN-041 Add Article
BTN-042 Edit Article
BTN-043 Delete Article
BTN-044 Publish Article
BTN-045 Import Content
SCR-015 Analytics Dashboard Screen
Components:
Total users
Total projects
Total conversations
Documentation generation count
AI failure count
Most common project categories
Buttons:
BTN-046 Export Report
BTN-047 Filter Date Range
3. Navigation Flow
Landing Page
->
Login / Signup
->
Dashboard
->
Create Project
->
Chat Interface
->
Requirement Gathering
->
Project Summary
->
Technology Recommendation
->
Roadmap
->
Documentation
->
Save Project
4. Role-Based Permission Matrix
Feature    Guest    User    Admin
View Landing Page    Yes    Yes    Yes
Register    Yes    No    No
Login    Yes    No    No
Start Chat    Limited    Yes    Yes
Create Project    No    Yes    Yes
Save Project    No    Yes    Yes
Export Documentation    No    Yes    Yes
Manage Users    No    No    Yes
Analytics Access    No    No    Yes
Manage Knowledge Base    No    No    Yes
5. UI Components
CMP-001 Header
Contains:
Logo
Navigation Menu
Profile
CMP-002 Sidebar
Contains:
Dashboard
Projects
Documentation
Settings
CMP-003 Chat Window
Contains:
User Messages
AI Messages
Typing Indicator
CMP-004 Input Box
Contains:
Text Input
Send Button
CMP-005 Recommendation Card
Contains:
Recommendation Title
Description
Action Button
CMP-006 Project Card
Contains:
Project Name
Status
Last Updated
CMP-007 Loading State
Contains:
Spinner or skeleton loader
Short contextual loading message
CMP-008 Empty State
Contains:
Empty state title
Helpful short message
Primary action button
CMP-009 Error State
Contains:
Error title
Error message
Retry button where applicable
CMP-010 Document Preview
Contains:
Generated document content
Version number
Export buttons
Regenerate button
CMP-011 Confirmation Modal
Contains:
Action title
Risk explanation
Confirm button
Cancel button
6. Validation Rules
VR-001
Email must follow valid email format.
VR-002
Password minimum 8 characters.
VR-003
Project name cannot be empty.
VR-004
Project description minimum 20 characters.
VR-005
Chat message cannot be empty.
VR-006
Requirement response cannot be blank.
VR-007
Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.
VR-008
Reset password token must be valid and not expired.
VR-009
Document export format must be one of md, pdf, docx, or json.
7. Error Messages
ERR-001
Invalid Email Address
ERR-002
Password Too Short
ERR-003
Project Name Required
ERR-004
Project Description Required
ERR-005
Unable To Generate Response
ERR-006
Session Expired
ERR-007
Network Error
ERR-008
Reset Link Expired
ERR-009
Email Verification Required
ERR-010
Rate Limit Exceeded
ERR-011
Access Denied
7.1 UI State Requirements
UISTATE-001
Chat interface shall show a typing indicator while AI response is being generated.
UISTATE-002
Chat interface shall disable the Send button while a message is being submitted.
UISTATE-003
Dashboard shall show an empty state when the user has no saved projects.
UISTATE-004
Documentation screen shall show generation progress while a document is being created.
UISTATE-005
Regenerate actions shall show a confirmation modal before replacing the latest output.
UISTATE-006
Mobile layout shall collapse sidebar into a menu drawer.
UISTATE-007
All destructive actions shall require confirmation.
8. Requirement Discovery UI Flow
User enters:
"I want to build a Food Delivery App"
->
AI creates Question Card
->
User answers Question
->
Next Question Generated
->
Requirement Completion Progress Updated
->
100% Completion
->
Generate Project Summary
9. Progress Tracking Component
Purpose:
Show requirement completion status.
Example:
Requirement Completion
20%
40%
60%
80%
100%
10. Accessibility Requirements
ACC-001
System shall support keyboard navigation.
ACC-002
System shall provide readable font sizes.
ACC-003
System shall support responsive layouts.
ACC-004
System shall provide visible error messages.
11. Frontend Functional Requirements
FEFR-001
System shall display chat interface.
FEFR-002
System shall allow message submission.
FEFR-003
System shall display AI responses.
FEFR-004
System shall display project summaries.
FEFR-005
System shall display roadmap recommendations.
FEFR-006
System shall display documentation outputs.
FEFR-007
System shall display technology recommendations.
12. Future Screens
Notification Center
Learning Center
Template Library
Saved Roadmaps
Saved PRDs
Project Comparison Screen
End of PRD Volume 3
Part 4: Backend Architecture, APIs, Database Design, Security & System Architecture
1. Technical Architecture Overview
System Architecture Type:
Monolithic Modular Architecture
Future Upgrade:
Microservices Ready Architecture
Architecture Layers:
Presentation Layer (Frontend)
API Layer
Business Logic Layer
AI Processing Layer
Database Layer
2. Technology Stack
Frontend
React.js
Next.js
TypeScript
Tailwind CSS
Backend
Node.js
Express.js
Database
PostgreSQL
Alternative:
MySQL
Authentication
JWT Authentication
Refresh Token Strategy
API Documentation
OpenAPI
Swagger
Testing
Jest
Postman
3. System Architecture
User
->
Frontend UI
->
API Gateway Layer
->
Backend Services
->
Business Logic Engine
->
AI Mentor Engine
->
Database
4. Backend Modules
BM-001 Authentication Service
Responsibilities:
Registration
Login
Logout
Session Management
BM-002 User Management Service
Responsibilities:
User Profile
User Preferences
User Settings
BM-003 Project Service
Responsibilities:
Create Project
Update Project
Delete Project
Project History
BM-004 Chat Service
Responsibilities:
Chat Processing
Conversation Storage
Session Context
BM-005 Requirement Discovery Service
Responsibilities:
Requirement Analysis
Question Generation
Scope Generation
BM-006 Documentation Service
Responsibilities:
PRD Generation
User Stories
Use Cases
BM-007 Recommendation Service
Responsibilities:
Feature Recommendations
Technology Recommendations
BM-008 Admin Service
Responsibilities:
User Management
Analytics
Reports
BM-009 Knowledge Base Service
Responsibilities:
Create, update, delete, and publish knowledge base articles
Store categories and tags
Provide searchable knowledge content for AI context
BM-010 Notification Service
Responsibilities:
Email verification
Forgot password email
Password reset confirmation
5. Database Schema
Table: users
Field    Type
id    UUID
full_name    VARCHAR
email    VARCHAR
password_hash    VARCHAR
role    VARCHAR
created_at    TIMESTAMP
Table: projects
Field    Type
id    UUID
user_id    UUID
project_name    VARCHAR
project_type    VARCHAR
description    TEXT
created_at    TIMESTAMP
Table: conversations
Field    Type
id    UUID
user_id    UUID
project_id    UUID
message    TEXT
sender_type    VARCHAR
created_at    TIMESTAMP
Table: requirements
Field    Type
id    UUID
project_id    UUID
requirement_type    VARCHAR
requirement_value    TEXT
Table: recommendations
Field    Type
id    UUID
project_id    UUID
recommendation_type    VARCHAR
recommendation_text    TEXT
Table: generated_documents
Field    Type
id    UUID
project_id    UUID
document_type    VARCHAR
content    TEXT
Table: user_sessions
Field    Type
id    UUID
user_id    UUID
token    TEXT
expires_at    TIMESTAMP
5.1 Detailed Database Schema Addendum
This addendum completes the implementation-level database definition for the MVP. The developer shall use this section together with the base schema above.
DB-001 Common Field Rules:
All primary keys shall use UUID.
All main business tables shall include created_at and updated_at.
Soft-deletable records shall include deleted_at.
All timestamps shall be stored in UTC.
Foreign keys shall enforce relational integrity.
User-specific data queries shall always filter by authenticated user_id unless the requester is Admin.
Table: users
Field	Type	Required	Notes
id	UUID	Yes	Primary key
full_name	VARCHAR(150)	Yes	User display name
email	VARCHAR(255)	Yes	Unique, lowercase
password_hash	TEXT	Yes	Hashed password only
role	VARCHAR(30)	Yes	guest, user, admin
preferred_language	VARCHAR(20)	No	en, mr, hi, hinglish
status	VARCHAR(30)	Yes	active, inactive, suspended
email_verified_at	TIMESTAMP	No	Null until verified
last_login_at	TIMESTAMP	No	Updated after successful login
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC
deleted_at	TIMESTAMP	No	Soft delete

Table: projects
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	Yes	FK to users.id
project_name	VARCHAR(200)	Yes	Project title
project_type	VARCHAR(80)	Yes	Website, web app, SaaS, ecommerce, etc.
category	VARCHAR(100)	No	Business category
description	TEXT	Yes	Initial user idea
status	VARCHAR(30)	Yes	draft, in_progress, completed, archived
requirement_completion_percentage	INTEGER	Yes	0 to 100
current_phase	VARCHAR(80)	No	Discovery, roadmap, documentation, etc.
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC
deleted_at	TIMESTAMP	No	Soft delete

Table: conversations
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	Yes	FK to users.id
project_id	UUID	Yes	FK to projects.id
session_id	UUID	Yes	Groups one chat session
sender_type	VARCHAR(20)	Yes	user, ai, system
message	TEXT	Yes	Message content
detected_language	VARCHAR(20)	No	Language detected for message
mentor_mode	VARCHAR(50)	No	Active mentor mode
metadata	JSONB	No	Tokens, model, latency, intent
created_at	TIMESTAMP	Yes	UTC

Table: requirements
Field	Type	Required	Notes
id	UUID	Yes	Primary key
project_id	UUID	Yes	FK to projects.id
category	VARCHAR(80)	Yes	Platform, users, auth, payment, notifications, etc.
requirement_key	VARCHAR(120)	Yes	Machine-readable key
requirement_value	TEXT	No	User-provided answer
status	VARCHAR(30)	Yes	pending, answered, skipped, validated
is_mandatory	BOOLEAN	Yes	Used for completion calculation
source_message_id	UUID	No	FK to conversations.id
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC

Table: requirement_questions
Field	Type	Required	Notes
id	UUID	Yes	Primary key
project_id	UUID	Yes	FK to projects.id
requirement_key	VARCHAR(120)	Yes	Related requirement
question_text	TEXT	Yes	One question at a time
answer_type	VARCHAR(40)	Yes	text, single_choice, multi_choice, yes_no
options	JSONB	No	Choice options
status	VARCHAR(30)	Yes	pending, answered, skipped
display_order	INTEGER	Yes	Question sequence
created_at	TIMESTAMP	Yes	UTC
answered_at	TIMESTAMP	No	UTC

Table: recommendations
Field	Type	Required	Notes
id	UUID	Yes	Primary key
project_id	UUID	Yes	FK to projects.id
recommendation_type	VARCHAR(80)	Yes	features, technology, roadmap, testing
recommendation_text	TEXT	Yes	User-facing recommendation
confidence_score	DECIMAL(4,2)	No	0.00 to 1.00
rationale	TEXT	No	Why this recommendation was made
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC

Table: generated_documents
Field	Type	Required	Notes
id	UUID	Yes	Primary key
project_id	UUID	Yes	FK to projects.id
document_type	VARCHAR(60)	Yes	prd, user_stories, use_cases, roadmap, srs
title	VARCHAR(200)	Yes	Document title
content	TEXT	Yes	Markdown content
version_number	INTEGER	Yes	Starts at 1
export_format	VARCHAR(20)	No	md, pdf, docx, json
generated_by	UUID	Yes	FK to users.id
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC

Table: user_sessions
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	Yes	FK to users.id
refresh_token_hash	TEXT	Yes	Store hash, not raw token
ip_address	VARCHAR(80)	No	Security audit
user_agent	TEXT	No	Security audit
expires_at	TIMESTAMP	Yes	UTC
revoked_at	TIMESTAMP	No	Token revocation
created_at	TIMESTAMP	Yes	UTC

Table: ai_interactions
Field	Type	Required	Notes
id	UUID	Yes	Primary key
project_id	UUID	No	FK to projects.id
conversation_id	UUID	No	FK to conversations.id
provider	VARCHAR(80)	Yes	AI provider name
model_name	VARCHAR(120)	Yes	Model used
prompt_type	VARCHAR(80)	Yes	analysis, question, recommendation, document
input_tokens	INTEGER	No	Usage tracking
output_tokens	INTEGER	No	Usage tracking
latency_ms	INTEGER	No	Performance tracking
status	VARCHAR(30)	Yes	success, failed, fallback_used
error_message	TEXT	No	Failure reason
created_at	TIMESTAMP	Yes	UTC

Table: password_reset_tokens
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	Yes	FK to users.id
token_hash	TEXT	Yes	Store hashed reset token only
expires_at	TIMESTAMP	Yes	Default 15 minutes
used_at	TIMESTAMP	No	Set after password reset
created_at	TIMESTAMP	Yes	UTC

Table: email_verification_tokens
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	Yes	FK to users.id
token_hash	TEXT	Yes	Store hashed verification token only
expires_at	TIMESTAMP	Yes	Default 24 hours
used_at	TIMESTAMP	No	Set after successful verification
created_at	TIMESTAMP	Yes	UTC

Table: knowledge_base_articles
Field	Type	Required	Notes
id	UUID	Yes	Primary key
title	VARCHAR(200)	Yes	Article title
category	VARCHAR(100)	Yes	Requirements, frontend, backend, testing, deployment, etc.
tags	JSONB	No	Search tags
content	TEXT	Yes	Knowledge content
status	VARCHAR(30)	Yes	draft, published, archived
created_by	UUID	Yes	FK to users.id
updated_by	UUID	No	FK to users.id
created_at	TIMESTAMP	Yes	UTC
updated_at	TIMESTAMP	Yes	UTC
deleted_at	TIMESTAMP	No	Soft delete

Table: analytics_events
Field	Type	Required	Notes
id	UUID	Yes	Primary key
user_id	UUID	No	FK to users.id
project_id	UUID	No	FK to projects.id
event_name	VARCHAR(120)	Yes	project_created, doc_generated, ai_failed, etc.
event_properties	JSONB	No	Event metadata
created_at	TIMESTAMP	Yes	UTC

Required Indexes:
users.email unique index.
projects.user_id, projects.created_at index.
conversations.project_id, conversations.created_at index.
requirements.project_id, requirements.category index.
generated_documents.project_id, generated_documents.document_type index.
user_sessions.user_id, user_sessions.expires_at index.
password_reset_tokens.user_id, password_reset_tokens.expires_at index.
email_verification_tokens.user_id, email_verification_tokens.expires_at index.
knowledge_base_articles.category, knowledge_base_articles.status index.
analytics_events.event_name, analytics_events.created_at index.
Data Retention Rules:
Chat history shall be retained until the user deletes the project or account.
Soft-deleted projects shall be restorable by Admin for 30 days.
AI interaction logs shall retain metadata but must not expose hidden prompts to normal users.
Password hashes, refresh token hashes, and secrets shall never be returned by any API.
Password reset tokens shall expire within 15 minutes.
Email verification tokens shall expire within 24 hours.
6. Entity Relationships
users
->
projects
->
requirements
->
recommendations
->
generated_documents
users
->
conversations
users
->
user_sessions
7. API Specifications
Authentication APIs
POST /api/auth/register
Purpose:
Create account
Request:
name
email
password
Response:
success
user_id
POST /api/auth/login
Request:
email
password
Response:
access_token
refresh_token
POST /api/auth/logout
Response:
success
8. Project APIs
POST /api/projects
Purpose:
Create project
GET /api/projects
Purpose:
Fetch projects
GET /api/projects/{id}
Purpose:
Project details
PUT /api/projects/{id}
Purpose:
Update project
DELETE /api/projects/{id}
Purpose:
Delete project
9. Chat APIs
POST /api/chat/message
Purpose:
Send message
Request:
{
message
project_id
}
Response:
{
ai_response
}
GET /api/chat/history/{project_id}
Purpose:
Fetch conversation history
10. Requirement Discovery APIs
POST /api/requirements/analyze
Purpose:
Analyze project idea
POST /api/requirements/question
Purpose:
Generate next question
POST /api/requirements/validate
Purpose:
Validate requirements
11. Documentation APIs
POST /api/docs/prd
Generate PRD
POST /api/docs/userstories
Generate User Stories
POST /api/docs/usecases
Generate Use Cases
POST /api/docs/roadmap
Generate Roadmap
12. Recommendation APIs
POST /api/recommend/technology
Generate technology recommendations
POST /api/recommend/features
Generate feature recommendations
12.1 Detailed API Contracts Addendum
All API responses shall use a consistent JSON envelope.
Standard Success Response:
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
Standard Error Response:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required",
    "details": []
  }
}
Authentication Header:
Authorization: Bearer <access_token>
API-CON-001 Register User
Endpoint: POST /api/auth/register
Auth: Public
Request:
{
  "full_name": "Amit Patil",
  "email": "amit@example.com",
  "password": "Password@123"
}
Success Response 201:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "amit@example.com",
    "role": "user"
  },
  "message": "Account created successfully"
}
Validation: email required, valid email, unique email, password minimum 8 characters.
API-CON-002 Login User
Endpoint: POST /api/auth/login
Auth: Public
Request:
{
  "email": "amit@example.com",
  "password": "Password@123"
}
Success Response 200:
{
  "success": true,
  "data": {
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "user": {
      "id": "uuid",
      "full_name": "Amit Patil",
      "email": "amit@example.com",
      "role": "user"
    }
  },
  "message": "Login successful"
}
API-CON-002A Request Password Reset
Endpoint: POST /api/auth/forgot-password
Auth: Public
Request:
{
  "email": "amit@example.com"
}
Success Response 200:
{
  "success": true,
  "data": {},
  "message": "If the email exists, a password reset link has been sent"
}
Security Rule: response message must be generic to avoid account enumeration.
API-CON-002B Reset Password
Endpoint: POST /api/auth/reset-password
Auth: Public
Request:
{
  "token": "reset_token",
  "new_password": "NewPassword@123",
  "confirm_password": "NewPassword@123"
}
Success Response 200:
{
  "success": true,
  "data": {},
  "message": "Password reset successfully"
}
API-CON-002C Verify Email
Endpoint: POST /api/auth/verify-email
Auth: Public
Request:
{
  "token": "email_verification_token"
}
Success Response 200:
{
  "success": true,
  "data": {
    "email_verified": true
  },
  "message": "Email verified successfully"
}
API-CON-002D Resend Verification Email
Endpoint: POST /api/auth/resend-verification
Auth: Registered User
Request:
{
  "email": "amit@example.com"
}
Success Response 200:
{
  "success": true,
  "data": {},
  "message": "Verification email sent"
}
API-CON-003 Create Project
Endpoint: POST /api/projects
Auth: Registered User/Admin
Request:
{
  "project_name": "Food Delivery App",
  "project_type": "Web App",
  "category": "Food Tech",
  "description": "A platform for customers to order food from restaurants"
}
Success Response 201:
{
  "success": true,
  "data": {
    "project_id": "uuid",
    "status": "draft",
    "requirement_completion_percentage": 0
  },
  "message": "Project created successfully"
}
API-CON-004 List Projects
Endpoint: GET /api/projects?page=1&limit=10&status=in_progress
Auth: Registered User/Admin
Success Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "project_name": "Food Delivery App",
        "project_type": "Web App",
        "status": "in_progress",
        "requirement_completion_percentage": 60,
        "updated_at": "2026-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  },
  "message": "Projects fetched successfully"
}
API-CON-005 Send Chat Message
Endpoint: POST /api/chat/message
Auth: Registered User/Admin; Guest allowed only for limited session.
Request:
{
  "project_id": "uuid",
  "message": "I want to build a food delivery app",
  "mentor_mode": "business_analyst",
  "language": "auto"
}
Success Response 200:
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "ai_response": "Which platforms are required?",
    "detected_language": "en",
    "next_action": "answer_requirement_question",
    "requirement_completion_percentage": 10,
    "pending_requirement_key": "platform",
    "suggested_options": ["Website", "Mobile App", "Both"]
  },
  "message": "AI response generated successfully"
}
Business Rule: AI shall ask only one requirement discovery question at a time.
API-CON-006 Get Chat History
Endpoint: GET /api/chat/history/{project_id}?page=1&limit=50
Auth: Project owner/Admin
Success Response 200:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender_type": "user",
        "message": "I want to build a food delivery app",
        "created_at": "2026-06-15T10:00:00Z"
      }
    ]
  },
  "message": "Chat history fetched successfully"
}
API-CON-007 Analyze Requirements
Endpoint: POST /api/requirements/analyze
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid",
  "idea": "Food delivery app for restaurants and customers"
}
Success Response 200:
{
  "success": true,
  "data": {
    "project_summary": "Food delivery marketplace web app",
    "detected_project_type": "Marketplace",
    "missing_categories": ["platform", "user_roles", "payment", "delivery_tracking"],
    "completion_percentage": 0
  },
  "message": "Requirement analysis completed"
}
API-CON-008 Generate Next Requirement Question
Endpoint: POST /api/requirements/question
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid"
}
Success Response 200:
{
  "success": true,
  "data": {
    "question_id": "uuid",
    "requirement_key": "platform",
    "question": "What platforms are required?",
    "answer_type": "single_choice",
    "options": ["Website", "Mobile App", "Both"]
  },
  "message": "Next question generated"
}
API-CON-009 Save Requirement Answer
Endpoint: POST /api/requirements/answer
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid",
  "question_id": "uuid",
  "requirement_key": "platform",
  "answer": "Website"
}
Success Response 200:
{
  "success": true,
  "data": {
    "requirement_key": "platform",
    "status": "answered",
    "completion_percentage": 20,
    "next_required": true
  },
  "message": "Requirement answer saved"
}
API-CON-010 Validate Requirements
Endpoint: POST /api/requirements/validate
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid"
}
Success Response 200:
{
  "success": true,
  "data": {
    "is_ready_for_recommendation": false,
    "completion_percentage": 60,
    "missing_mandatory_requirements": ["payment", "notifications"]
  },
  "message": "Requirements validated"
}
API-CON-011 Generate Document
Endpoint: POST /api/docs/{document_type}
Supported document types: prd, userstories, usecases, roadmap, srs
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid",
  "format": "markdown"
}
Success Response 200:
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "document_type": "prd",
    "version_number": 1,
    "content": "# Product Requirements Document..."
  },
  "message": "Document generated successfully"
}
API-CON-012 Export Document
Endpoint: GET /api/docs/{document_id}/export?format=pdf
Supported formats: md, pdf, docx, json
Auth: Project owner/Admin
Success Response 200: file download stream or signed download URL.
API-CON-013 Generate Technology Recommendation
Endpoint: POST /api/recommend/technology
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid",
  "constraints": {
    "budget": "low",
    "team_skill": "beginner",
    "deployment_preference": "cloud"
  }
}
Success Response 200:
{
  "success": true,
  "data": {
    "frontend": "Next.js + TypeScript + Tailwind CSS",
    "backend": "Node.js + Express.js",
    "database": "PostgreSQL",
    "authentication": "JWT + Refresh Token",
    "deployment": "Vercel frontend, Render backend, managed PostgreSQL",
    "rationale": "Recommended for beginner-friendly development and scalable deployment"
  },
  "message": "Technology recommendation generated"
}
API-CON-014 Generate Feature Recommendations
Endpoint: POST /api/recommend/features
Auth: Project owner/Admin
Request:
{
  "project_id": "uuid"
}
Success Response 200:
{
  "success": true,
  "data": {
    "must_have": ["User registration", "Project creation", "AI chat", "Requirement tracking"],
    "should_have": ["Document export", "Technology recommendation"],
    "future": ["Team collaboration", "Template library"]
  },
  "message": "Feature recommendations generated"
}
API-CON-015 Admin User Management
Endpoint: GET /api/admin/users?page=1&limit=20
Auth: Admin only
Success Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "full_name": "Amit Patil",
        "email": "amit@example.com",
        "role": "user",
        "status": "active",
        "created_at": "2026-06-15T10:00:00Z"
      }
    ]
  },
  "message": "Users fetched successfully"
}
API-CON-016 Admin Update User Status
Endpoint: PATCH /api/admin/users/{user_id}/status
Auth: Admin only
Request:
{
  "status": "suspended",
  "reason": "Policy violation"
}
Success Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "status": "suspended"
  },
  "message": "User status updated"
}
API-CON-017 Admin Knowledge Base Create/Update
Endpoint: POST /api/admin/knowledge-base
Auth: Admin only
Request:
{
  "title": "How to choose a frontend framework",
  "category": "frontend",
  "tags": ["react", "nextjs", "frontend"],
  "content": "Use Next.js when SEO, routing, and production structure are required.",
  "status": "published"
}
Success Response 201:
{
  "success": true,
  "data": {
    "article_id": "uuid",
    "status": "published"
  },
  "message": "Knowledge base article saved"
}
API-CON-018 Admin Analytics Summary
Endpoint: GET /api/admin/analytics/summary?from=2026-06-01&to=2026-06-15
Auth: Admin only
Success Response 200:
{
  "success": true,
  "data": {
    "total_users": 120,
    "total_projects": 85,
    "total_conversations": 430,
    "documents_generated": 210,
    "ai_failure_count": 3
  },
  "message": "Analytics summary fetched"
}
Required HTTP Status Codes:
200: Success.
201: Created.
400: Validation error.
401: Missing or invalid authentication.
403: Permission denied.
404: Resource not found.
409: Duplicate resource or conflict.
429: Rate limit exceeded.
500: Internal server error.
13. Security Requirements
SEC-001
Passwords must be hashed.
SEC-002
JWT authentication required.
SEC-003
Protected APIs require authorization.
SEC-004
Input validation required.
SEC-005
SQL Injection prevention required.
SEC-006
XSS protection required.
SEC-007
CSRF protection required.
SEC-008
Rate limiting required for authentication, chat, AI generation, and document export APIs.
SEC-009
Account shall be temporarily locked after 5 failed login attempts within 15 minutes.
SEC-010
Refresh token rotation required after every token refresh.
SEC-011
Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.
SEC-012
Sensitive values such as passwords, tokens, API keys, and hidden prompts must be masked in logs.
SEC-013
Users shall only access their own projects, conversations, requirements, recommendations, and documents.
SEC-014
Admin-only endpoints must enforce role-based authorization.
SEC-015
System shall not expose AI hidden prompts or internal system instructions to users.
SEC-016
All production traffic shall use HTTPS.
13.1 Rate Limiting Rules
Login API: maximum 5 failed attempts per email/IP within 15 minutes.
Forgot password API: maximum 3 requests per email/IP per hour.
Chat message API: maximum 30 messages per user per hour for MVP.
Document generation API: maximum 10 document generations per user per day for MVP.
Admin APIs: maximum 100 requests per admin per hour.
Rate limit exceeded response shall use HTTP 429.
13.2 Privacy and Data Protection Rules
User passwords and tokens shall never be stored in plain text.
Conversation data shall be visible only to the project owner and authorized Admin users.
Admin access to conversations shall be audit logged.
Logs shall not store raw passwords, refresh tokens, reset tokens, or API keys.
User account deletion shall soft-delete projects and related generated documents.
Exported documents shall include only the selected project data.
13.3 Admin Workflow Requirements
ADM-001
Admin shall view a paginated list of users.
ADM-002
Admin shall filter users by role, status, and created date.
ADM-003
Admin shall suspend and activate users.
ADM-004
Admin shall view project and conversation analytics.
ADM-005
Admin shall manage knowledge base articles.
ADM-006
Admin shall export analytics reports.
ADM-007
All admin actions shall be stored in audit logs.
13.4 Knowledge Base Workflow Requirements
KB-001
Admin shall create, edit, publish, archive, and delete knowledge base articles.
KB-002
Knowledge base articles shall support category, tags, title, content, and status.
KB-003
Only published knowledge base articles shall be used by AI context.
KB-004
Knowledge base content shall be searchable by category, tag, and keyword.
KB-005
AI shall use knowledge base content only as supporting context and shall not expose internal article IDs to users.
KB-006
Knowledge base changes shall be audit logged.
14. Logging Requirements
LOG-001
User login logs.
LOG-002
Project creation logs.
LOG-003
Conversation logs.
LOG-004
API error logs.
LOG-005
Admin activity logs.
15. Audit Requirements
AUD-001
Track project changes.
AUD-002
Track user actions.
AUD-003
Track admin operations.
16. Performance Requirements
PERF-001
API response under 3 seconds.
PERF-002
Support concurrent users.
PERF-003
Efficient database queries.
PERF-004
Chat AI response should be generated within 5 seconds for requirement questions.
PERF-005
Document generation should complete within 20 seconds for MVP-sized projects.
PERF-006
System should support at least 100 registered users and 20 concurrent active chat sessions in MVP.
PERF-007
Dashboard project list should load within 3 seconds for up to 100 projects per user.
17. Scalability Requirements
SCALE-001
Support future AI modules.
SCALE-002
Support future integrations.
SCALE-003
Support increasing user volume.
17.1 Deployment Plan and Environment Requirements
DEP-001
MVP shall support local development deployment for developer testing.
DEP-002
MVP shall support staging deployment for client/demo review.
DEP-003
Production deployment is recommended after MVP approval and QA completion.
DEP-004
Frontend may be deployed on Vercel or similar platform.
DEP-005
Backend may be deployed on Render, Railway, AWS, Azure, GCP, or similar platform.
DEP-006
Database shall use managed PostgreSQL for staging/production.
DEP-007
Environment variables shall be used for secrets and provider keys.
DEP-008
Database backups shall be enabled in staging/production.
DEP-009
Application health check endpoint shall be available at GET /api/health.
DEP-010
Deployment shall include frontend build, backend build, database migration, environment validation, and smoke testing.
18. Error Handling
EH-001
Invalid Login Credentials
HTTP 401
EH-002
Project Not Found
HTTP 404
EH-003
Unauthorized Access
HTTP 403
EH-004
Internal Server Error
HTTP 500
19. AI Mentor Architecture
User Input
->
Intent Detection
->
Project Analysis
->
Requirement Discovery
->
Context Management
->
Knowledge Processing
->
Recommendation Engine
->
Response Generation
->
User Response
19.1 AI/LLM Implementation Specification
This section defines how the AI Mentor Engine shall behave so that chatbot output is consistent, safe, and useful for project planning.
AI-IMP-001 AI Provider Configuration:
The system shall support configurable AI provider settings through environment variables.
The AI provider and model name shall not be hardcoded in business logic.
Required environment variables:AI_PROVIDER
AI_MODEL
AI_API_KEY
AI_TIMEOUT_SECONDS
AI_MAX_INPUT_TOKENS
AI_MAX_OUTPUT_TOKENS

If the AI provider fails, the system shall return a graceful error message and save the failed interaction in ai_interactions.
AI-IMP-002 AI Mentor Responsibilities:
Analyze the user's project idea.
Detect missing requirement categories.
Ask one requirement question at a time.
Maintain project context.
Recommend features, technology stack, roadmap, testing approach, and documentation.
Respond in the user's current language unless the user explicitly requests another language.
AI-IMP-003 Prompt Structure:
Every AI request shall be built using the following prompt layers:
System instruction: defines AI identity, boundaries, language behavior, and safety rules.
Mentor mode instruction: Business Analyst, Product Manager, Solution Architect, Development Mentor, or Testing Mentor.
Project context: project name, description, answered requirements, pending requirements, completion percentage.
User message: latest user input.
Output contract: required JSON or text structure for the specific operation.
AI-IMP-004 Base System Instruction:
The AI shall act as a professional website and web application development mentor. It shall guide users through requirement discovery, scope definition, feature planning, technology selection, documentation, development guidance, and testing guidance. It shall not claim that the project is ready for development until mandatory requirements are collected. During requirement discovery, it shall ask only one question at a time.
AI-IMP-005 Mandatory Requirement Categories:
The system shall not generate final roadmap or complete recommendations until the following mandatory categories are collected:
Project platform: website, web app, mobile app, or both.
Target users and user roles.
Core business goal.
Main features.
Authentication requirement.
Data storage requirement.
Admin panel requirement.
Payment requirement, if applicable.
Notification requirement, if applicable.
Deployment preference or assumption.
AI-IMP-006 Requirement Question Selection Logic:
The AI shall prioritize mandatory unanswered requirements first.
The AI shall skip irrelevant requirements based on previous answers.
The AI shall generate dependency-based questions.
Example: if payment is not required, payment method questions shall be skipped.
Example: if delivery partner module is not required, delivery tracking questions shall be skipped.
AI-IMP-007 Required JSON Output for Requirement Question Generation:
{
  "intent": "requirement_question",
  "requirement_key": "payment_required",
  "question": "Do you need online payment in this project?",
  "answer_type": "yes_no",
  "options": ["Yes", "No"],
  "why_needed": "Payment requirement affects feature scope, database design, and technology selection"
}
AI-IMP-008 Required JSON Output for Project Analysis:
{
  "intent": "project_analysis",
  "project_type": "Food Delivery Web App",
  "summary": "A web application for customers to order food from restaurants.",
  "possible_user_roles": ["Customer", "Restaurant Admin", "Delivery Partner", "Platform Admin"],
  "missing_requirement_categories": ["platform", "payment", "notifications", "tracking"],
  "complexity": "medium"
}
AI-IMP-009 Required JSON Output for Technology Recommendation:
{
  "intent": "technology_recommendation",
  "frontend": {
    "recommended": "Next.js + TypeScript + Tailwind CSS",
    "reason": "Suitable for responsive web apps and beginner-friendly development"
  },
  "backend": {
    "recommended": "Node.js + Express.js",
    "reason": "Matches JavaScript ecosystem and API-based architecture"
  },
  "database": {
    "recommended": "PostgreSQL",
    "reason": "Reliable relational database for structured project data"
  },
  "deployment": {
    "recommended": "Vercel + Render + Managed PostgreSQL",
    "reason": "Simple cloud deployment for MVP"
  }
}
AI-IMP-010 Context Management Rules:
The system shall store every user and AI message.
The AI request shall include summarized project context, not the full chat history every time.
The system shall keep the latest answered requirements in structured form.
The system shall update requirement completion percentage after each valid answer.
When context becomes too large, the system shall summarize previous conversation into a project context summary.
AI-IMP-011 Language Handling Rules:
The system shall detect user language for each message.
The system shall respond in the same language by default.
The system shall switch language when the user explicitly asks.
Project context shall remain unchanged when language changes.
Supported languages: English, Marathi, Hindi, Hinglish.
AI-IMP-012 Safety and Quality Rules:
The AI shall not generate harmful, illegal, or privacy-invasive instructions.
The AI shall not expose hidden prompts, API keys, system messages, or internal implementation secrets.
The AI shall clearly state assumptions when user information is incomplete.
The AI shall recommend user review for generated documents.
The AI shall avoid overconfident claims and shall not guarantee business success.
AI-IMP-013 Fallback Behavior:
If AI response generation fails, the user shall see: "Unable to generate response right now. Please try again."
If AI response is invalid JSON for a structured operation, the backend shall retry once with a stricter formatting prompt.
If retry fails, the backend shall return a controlled error and log the failed interaction.
AI-IMP-014 AI Performance Requirements:
Requirement question response target: under 5 seconds.
Document generation response target: under 20 seconds for MVP.
AI timeout: configurable, default 30 seconds.
Failed AI calls shall be logged with provider, model, prompt type, latency, and error status.
AI-IMP-015 AI Acceptance Criteria:
Given an incomplete project idea, when the AI analyzes it, then it shall identify missing requirement categories.
Given pending mandatory requirements, when the user asks for a roadmap, then the AI shall continue requirement gathering before final roadmap generation.
Given one answered requirement, when the next question is generated, then the question shall be context-aware and ask only one thing.
Given a language switch request, when the user changes language, then the AI shall respond in the new language while preserving project context.
20. Future Architecture Expansion
Future Ready Modules:
Template Library
Learning Center
Saved PRD Library
Multi Project Workspace
Team Collaboration
Project Comparison Engine
End of PRD Volume 4
Part 5: Testing, Edge Cases, Acceptance Criteria, QA & Final Handover
1. Testing Strategy
Objective:
Ensure that the system works according to the documented requirements.
Testing Types:
Functional Testing
Integration Testing
System Testing
UI Testing
API Testing
Validation Testing
User Acceptance Testing (UAT)
2. Test Cases
TC-001 User Registration
Module:
Authentication
Test Steps:
Open Registration Page
Enter Valid Name
Enter Valid Email
Enter Valid Password
Click Register
Expected Result:
User account successfully created.
Status:
Pass / Fail
TC-002 Login
Module:
Authentication
Steps:
Enter Email
Enter Password
Click Login
Expected Result:
User redirected to Dashboard.
TC-003 Create Project
Module:
Project Management
Steps:
Click New Project
Enter Project Name
Enter Description
Save
Expected Result:
Project created successfully.
TC-004 Send Chat Message
Module:
Conversation Engine
Steps:
Open Chat
Enter Message
Click Send
Expected Result:
AI response displayed.
TC-005 Requirement Discovery
Steps:
User enters project idea
AI analyzes idea
Expected Result:
Follow-up questions generated.
TC-006 Technology Recommendation
Expected Result:
Suitable technology stack displayed.
TC-007 Generate PRD
Expected Result:
PRD content generated successfully.
TC-008 Generate User Stories
Expected Result:
User stories generated.
TC-009 Generate Use Cases
Expected Result:
Use cases generated.
TC-010 Save Project
Expected Result:
Project stored successfully.
TC-011 Forgot Password
Module:
Authentication
Steps:
Open Forgot Password Page
Enter registered email
Click Send Reset Link
Expected Result:
Generic reset email confirmation message displayed.
TC-012 Reset Password
Module:
Authentication
Steps:
Open reset password link
Enter new password
Confirm new password
Submit form
Expected Result:
Password reset successfully and user can login with new password.
TC-013 Email Verification
Module:
Authentication
Steps:
Register new account
Open verification link
Verify email
Expected Result:
User email verification status updated.
TC-014 AI One Question At A Time
Module:
AI Mentor Engine
Steps:
User enters incomplete project idea
AI analyzes idea
AI generates next requirement question
Expected Result:
AI asks only one requirement discovery question in a single response.
TC-015 Requirement Completion Percentage
Module:
Requirement Discovery Engine
Steps:
User answers requirement question
System saves answer
System recalculates progress
Expected Result:
Requirement completion percentage updates correctly.
TC-016 Document Export
Module:
Documentation Module
Steps:
Generate PRD
Select export format
Download file
Expected Result:
Document downloads in selected supported format.
TC-017 Admin User Suspension
Module:
Admin Module
Steps:
Admin opens user management
Admin suspends user
Suspended user attempts login
Expected Result:
User status changes to suspended and login is blocked.
TC-018 Knowledge Base Article Publish
Module:
Knowledge Base Module
Steps:
Admin creates article
Admin publishes article
System saves article status
Expected Result:
Published article becomes available for AI supporting context.
TC-019 Rate Limit Enforcement
Module:
Security
Steps:
User exceeds configured API request limit
System evaluates rate limit
Expected Result:
System returns HTTP 429 Rate Limit Exceeded.
3. API Test Cases
API-TC-001
Endpoint:
POST /api/auth/login
Expected:
200 Success
API-TC-002
Endpoint:
POST /api/projects
Expected:
Project created
API-TC-003
Endpoint:
POST /api/chat/message
Expected:
AI response returned
API-TC-004
Endpoint:
POST /api/docs/prd
Expected:
PRD generated
API-TC-005
Endpoint:
POST /api/auth/forgot-password
Expected:
200 Success with generic response
API-TC-006
Endpoint:
POST /api/auth/reset-password
Expected:
Password reset successfully
API-TC-007
Endpoint:
POST /api/requirements/answer
Expected:
Requirement answer saved and completion percentage returned
API-TC-008
Endpoint:
GET /api/docs/{document_id}/export?format=pdf
Expected:
Document export returned
API-TC-009
Endpoint:
PATCH /api/admin/users/{user_id}/status
Expected:
Admin can update user status
API-TC-010
Endpoint:
POST /api/admin/knowledge-base
Expected:
Knowledge base article saved
4. Edge Cases
EC-001
User submits empty project description.
Expected:
Validation error.
EC-002
User submits empty chat message.
Expected:
Message blocked.
EC-003
User provides incomplete requirements.
Expected:
AI asks additional questions.
EC-004
User changes project scope midway.
Expected:
Requirements recalculated.
EC-005
User enters unsupported project type.
Expected:
AI requests clarification.
EC-006
User refreshes browser during conversation.
Expected:
Conversation restored.
EC-007
Network interruption occurs.
Expected:
Retry mechanism.
EC-008
User sends extremely long message.
Expected:
System handles input safely.
EC-009
AI provider timeout occurs.
Expected:
System shows graceful fallback error and logs failed interaction.
EC-010
AI returns invalid JSON for structured response.
Expected:
System retries once with stricter prompt and returns controlled error if retry fails.
EC-011
User tries to access another user's project.
Expected:
System returns HTTP 403 Unauthorized Access.
EC-012
Password reset token is expired.
Expected:
System blocks reset and shows reset link expired message.
EC-013
Admin-only API is requested by normal user.
Expected:
System returns HTTP 403 Permission Denied.
5. Validation Matrix
Validation ID    Description
VAL-001    Email Required
VAL-002    Valid Email Format
VAL-003    Password Min 8 Characters
VAL-004    Project Name Required
VAL-005    Description Required
VAL-006    Chat Message Required
VAL-007    Role Selection Required
VAL-008    Password Complexity Required
VAL-009    Reset Token Required
VAL-010    Export Format Required
6. Acceptance Criteria
AC-006
Given valid registration data
When user submits form
Then account should be created.
AC-007
Given valid login credentials
When user logs in
Then dashboard should open.
AC-008
Given project idea
When AI analyzes input
Then requirements questions should be generated.
AC-009
Given completed requirements
When analysis finishes
Then project summary should be created.
AC-010
Given project summary
When recommendation runs
Then technology stack should be suggested.
AC-011
Given completed project requirements
When documentation requested
Then PRD guidance should be generated.
AC-012
Given incomplete mandatory requirements
When user asks for final roadmap
Then system should continue requirement discovery before final roadmap generation.
AC-013
Given AI provider failure
When AI response generation fails
Then system should return graceful fallback response and log the failure.
AC-014
Given admin user
When admin suspends a user
Then suspended user should not be able to login.
AC-015
Given a generated document
When user exports the document
Then system should provide the selected supported file format.
AC-016
Given published knowledge base content
When AI needs supporting context
Then system should use only published knowledge base articles.
7. QA Checklist
Authentication
Registration Working
Login Working
Logout Working
Project Module
Create Project
Update Project
Delete Project
Chat Module
Send Message
Receive Response
Save History
Documentation Module
PRD Generation
User Story Generation
Use Case Generation
Recommendation Module
Feature Recommendation
Technology Recommendation
Security Module
Rate Limiting Working
Authorization Working
Token Rotation Working
Sensitive Log Masking Working
Admin Module
User List Working
Suspend/Activate User Working
Analytics Summary Working
Knowledge Base Module
Create Article Working
Publish Article Working
Search Article Working
8. UAT Scenarios
UAT-001 Student User
Goal:
Generate website project plan.
Expected:
AI provides complete guidance.
UAT-002 Freelancer User
Goal:
Prepare client project requirements.
Expected:
AI gathers complete requirements.
UAT-003 Startup Founder
Goal:
Build SaaS roadmap.
Expected:
AI generates roadmap.
9. Business Rules
BR-005
System must collect requirements before recommendations.
BR-006
System must maintain project context.
BR-007
System must respond in user language.
BR-008
System must store project history.
BR-009
System must validate user inputs.
10. Requirement Traceability Matrix (RTM)
Requirement    Test Case
FR-001    TC-003
FR-002    TC-005
FR-003    TC-005
FR-008    TC-006
FR-010    TC-006
FR-011    TC-007
FR-012    TC-008
FR-013    TC-009
FR-014    TC-010
FR-015    TC-004
FR-018    TC-014
FR-019    TC-015
FR-020    TC-015
FR-033    TC-006
FR-039    TC-007
FR-LANG-001    TC-014
FR-CONV-001    TC-004
FR-RCT-001    TC-015
FR-QF-001    TC-014
FR-DP-001    TC-014
DB-001    API-TC-002
API-CON-001    API-TC-001
API-CON-002A    API-TC-005
API-CON-002B    API-TC-006
API-CON-009    API-TC-007
API-CON-012    API-TC-008
API-CON-016    API-TC-009
API-CON-017    API-TC-010
AI-IMP-001    TC-013
AI-IMP-006    TC-014
AI-IMP-010    TC-015
AI-IMP-013    EC-009
SEC-008    TC-019
SEC-013    EC-011
ADM-003    TC-017
KB-003    TC-018
11. Future Enhancements
FE-001
Project Templates Library
FE-002
Multiple AI Mentor Modes
FE-003
Visual Flow Generator
FE-004
Architecture Diagram Generator
FE-005
Database Schema Generator
FE-006
API Specification Generator
FE-007
Learning Center
FE-008
Saved PRD Repository
FE-009
Project Comparison Engine
FE-010
Team Collaboration Workspace
12. Deployment Assumptions
MVP shall support local development deployment and staging/demo deployment.
Production deployment shall be treated as a post-MVP activity unless explicitly approved.
Deployment planning is included in scope; direct hosting management and live infrastructure operation remain out of scope.
Frontend, backend, database, and AI provider secrets shall be configured through environment variables.
Database backup, health check, and smoke testing are required for staging/production readiness.
13. Project Completion Criteria
Project shall be considered complete when:
All Functional Requirements documented.
All User Flows documented.
All Modules defined.
All APIs specified.
Database schema completed.
Test cases prepared.
Edge cases documented.
Acceptance criteria defined.
QA checklist completed.
Part 6: Additional AI Conversation Specification
AI Conversation & Language Management Specifications
Functional Requirements:
FR-LANG-001
System shall automatically detect the language used by the user.
FR-LANG-002
System shall respond in the same language used by the user.
FR-LANG-003
System shall maintain language consistency throughout the conversation.
FR-LANG-004
System shall automatically switch response language when the user changes language.
Example:
User:
I want to build a website.
AI:
Marathi response.
User:
Now explain in English.
AI:
English response.
FR-LANG-005
System shall support Marathi, Hindi, English and Hinglish conversations.
FR-LANG-006
System shall preserve project context even when the conversation language changes.
AI Conversation State Management
FR-CONV-001
System shall maintain conversation state throughout the requirement gathering process.
FR-CONV-002
System shall track answered questions.
FR-CONV-003
System shall track pending questions.
FR-CONV-004
System shall determine the next question based on previous user responses.
FR-CONV-005
System shall maintain project context across multiple conversation turns.
Requirement Completion Tracking
FR-RCT-001
System shall calculate requirement completion percentage.
FR-RCT-002
System shall identify completed requirement categories.
FR-RCT-003
System shall identify missing requirement categories.
FR-RCT-004
System shall continue requirement gathering until all mandatory requirements are collected.
FR-RCT-005
System shall prevent roadmap generation until minimum requirements are collected.
Example Requirement Tracking
Platform = Complete
User Roles = Complete
Authentication = Complete
Payment = Pending
Notifications = Pending
Requirement Completion = 60%
AI Question Flow Engine
FR-QF-001
System shall ask only one requirement discovery question at a time.
FR-QF-002
System shall wait for user input before asking the next question.
FR-QF-003
System shall not ask multiple unrelated questions in a single message.
FR-QF-004
System shall prioritize unanswered requirements.
FR-QF-005
System shall generate contextual follow-up questions.
Requirement Dependency Logic
FR-DP-001
System shall generate dependency-based questions.
Example:
If Payment = Yes
Then Ask:
Which payment methods are required->
UPI
Credit Card
Debit Card
Net Banking
Wallet
FR-DP-002
System shall dynamically generate questions based on previous answers.
FR-DP-003
System shall skip irrelevant questions.
Example:
If Delivery Partner Module = No
Then Delivery Tracking Questions should be skipped.
AI Mentor Modes
MM-001 Business Analyst Mode
Responsibilities:
Requirement Gathering
Business Analysis
Scope Definition
MM-002 Product Manager Mode
Responsibilities:
Feature Planning
User Flow Planning
Roadmap Creation
MM-003 Solution Architect Mode
Responsibilities:
System Design Guidance
Technology Recommendations
Architecture Suggestions
MM-004 Development Mentor Mode
Responsibilities:
Frontend Guidance
Backend Guidance
API Guidance
Database Guidance
MM-005 Testing Mentor Mode
Responsibilities:
Test Case Guidance
Testing Strategy
Bug Reporting Guidance
Business Rules
BR-AI-001
AI chatbot shall ask only one requirement discovery question at a time.
BR-AI-002
AI chatbot shall wait for the user's response before asking the next question.
BR-AI-003
AI chatbot shall not ask multiple requirement discovery questions in a single message.
BR-AI-004
AI chatbot shall maintain project context throughout the conversation.
BR-AI-005
AI chatbot shall not generate final recommendations until mandatory requirements are collected.
BR-AI-006
AI chatbot shall always respond in the user's preferred language.
BR-AI-007
AI chatbot shall automatically switch language when the user changes language.
BR-AI-008
AI chatbot shall maintain conversation history and requirement progress during the session.