🎨 Draft-Layer
Visual Email Builder for Structured Layout Design & HTML Export

Draft-Layer is a web-based visual email editor that enables users to design structured email templates using an intuitive drag-and-drop interface. It allows users to create, edit, and manage email layouts visually and export them as email-compatible HTML, eliminating the need for manual coding.

The system focuses on layout control, content management, and production-ready export, making it suitable for design prototyping, email template creation, and frontend experimentation.

1. Problem Context

Designing HTML emails is challenging due to:

Limited support for modern CSS in email clients
Need for table-based layouts
Requirement of inline styles for compatibility
Manual coding complexity

Most existing tools either abstract too much or lack flexibility in layout control.

2. Problem Statement

Design a visual editor that allows users to:

Create structured email layouts using reusable content blocks
Control layout, styling, and positioning visually
Generate email-compatible HTML output suitable for real-world use
3. Objectives
Provide a visual drag-and-drop email design interface
Support structured layout editing with precise control
Enable real-time content and style editing
Allow export of layouts as production-ready HTML
Maintain a modular and scalable architecture
4. Key Features
4.1 Visual Layout Editor
Drag-and-drop block placement
Resizable and movable components
Structured layout management
4.2 Block-Based Content System

Supports multiple content blocks:

Text blocks
Image blocks (with cloud upload support)
Button blocks
Divider and spacer blocks

Each block is independently editable and configurable.

4.3 Image Upload & Cloud Storage
Image uploads handled via secure backend routes
Stored in Supabase cloud storage
Public URLs generated for email compatibility
Ensures better deliverability in email clients
4.4 Styling & Inspector Panel
Real-time editing of layout and styles
Typography, spacing, colors, and borders
Context-aware controls based on block type
4.5 Interaction System
Multi-select support
Group movement of blocks
Keyboard-based precision control
Block duplication and deletion
Undo / Redo history system
4.6 Export System
Converts visual layout into email-compatible HTML
Uses table-based structure for maximum compatibility
Inline styling for cross-client support
Downloadable HTML output
5. Technology Stack
Application Layer
Next.js (App Router) – frontend and backend routes
React.js – component-based UI
TypeScript – type-safe development
State Management
Redux Toolkit – centralized state handling
Snapshot-based history system for undo/redo
Styling & UI
Emotion (CSS-in-JS)
Custom UI components (Inspector, Inputs, Sliders, Toggles)
Backend & Storage
Supabase – cloud storage for images
Secure API routes using .env.local secrets
6. System Architecture

Draft-Layer follows a modular Engine–UI architecture:

Engine Layer → Layout logic, state management, export system
UI Layer → Canvas, Inspector, interaction controls
Backend Layer → Secure file handling and cloud integration

This separation ensures scalability and maintainability.

7. System Scope & Non-Goals
In Scope
Visual email layout design
Block-based content editing
HTML email export
Cloud-based media handling
Out of Scope
Real-time email sending systems
Advanced animation support
Backend template management (future scope)
AI-based design automation
8. Target Users
Frontend developers
Email template designers
Students and researchers
Product prototyping teams
9. Repository Structure
/frontend        → Next.js application  
/store           → Redux state and reducers  
/components      → UI and block components  
/export          → HTML export engine  
/utils           → helper functions  
10. Practical Considerations
Output is optimized for email client compatibility
Layout is converted to table-based structure
Images are externally hosted to avoid spam filtering issues
System prioritizes control and predictability over abstraction
11. Disclaimer

Draft-Layer is designed for development, prototyping, and educational purposes.
While the exported HTML aims to be email-compatible, behavior may vary across different email clients.
