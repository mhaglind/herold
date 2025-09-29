# Herold - AI-Powered Family Tree Web Application

**PROJECT STATUS: Design & Planning Phase**

This project has evolved from a manual family tree system to a comprehensive web application called "Herold" that uses AI to create and manage family trees through natural language processing.

## 🎯 Current Phase: Implementation Planning

**PRIMARY DOCUMENT**: `HEROLD_IMPLEMENTATION_PLAN.md` - Complete technical specification for building the web application.

**LEGACY DATA**: The Halling family tree serves as reference data and test case for the automated systems being developed.

## 🏗️ Architecture Overview

### Web Application Stack
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **AI**: Claude API for natural language processing
- **Storage**: File system (JSON + SVG files)
- **Testing**: Jest + Cypress

### Core Features
1. **Multi-Project Management**: Handle multiple family trees
2. **Natural Language Input**: "Halvards far är Holmfast" → automatic JSON updates
3. **AI-Powered Processing**: Claude API analyzes relationships and updates data model
4. **Automatic SVG Generation**: Algorithm creates family tree layouts from JSON
5. **Customization**: Fonts, themes, orientation (portrait/landscape)

## 📁 New Project Structure (Planned)

```
herold/
├── src/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   ├── shared/          # Shared types and utilities
│   └── algorithms/      # Family tree layout algorithms
├── data/
│   ├── projects.json   # Project registry
│   └── families/       # Individual family directories
└── docs/               # API and algorithm documentation
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup with Node.js + TypeScript
- Data model implementation and validation
- Basic backend API for project CRUD
- Migration of existing Halling family data

### Phase 2: Core Functionality (Weeks 3-4)
- React frontend with project management
- Basic SVG rendering engine
- Manual family member editing interface
- Real-time SVG updates

### Phase 3: AI Integration (Weeks 5-6)
- Claude API integration for natural language processing
- Relationship parsing pipeline
- AI-powered JSON operation generation
- Error handling and validation

### Phase 4: Advanced Layout (Weeks 7-8)
- Sophisticated automatic layout algorithm
- Collision detection and resolution
- Visual customization options
- Export functionality (PNG, PDF)

### Phase 5: Production (Weeks 9-10)
- User experience polish and responsive design
- Performance optimization and testing
- Documentation and deployment

## 🧮 Key Technical Challenges

### 1. Automatic Layout Generation
Converting our manual SVG layout experience into algorithmic form:
- Position optimization with collision detection
- Family group identification and routing
- Cultural naming consideration
- Quality metrics for layout evaluation

### 2. Natural Language Processing
From "Halvards far är Holmfast" to precise JSON operations:
- Robust prompt engineering for Claude API
- Relationship extraction and validation
- Handling ambiguous or incomplete information
- Error correction and user feedback

### 3. Performance & Scalability
- SVG generation < 2 seconds for trees up to 100 people
- Incremental updates instead of full regeneration
- Caching of layout calculations
- Progressive loading for large families

## 📋 Legacy Halling Family Data

The existing files serve specific roles in the new system:

### Reference Data
- **`halling_slakt.json`** → Template for new data model
- **`halling_slakttrad.svg`** → Reference for layout quality standards
- **Font and styling work** → Templates for visual customization

### Migration Target
The Halling family will be the first project in the new system:
- Validate data model transformation
- Test automated layout algorithms
- Benchmark visual quality vs manual SVG
- Demonstrate natural language updates

## 🎯 Next Steps for New Claude Sessions

### If working on Implementation:
1. **READ FIRST**: `HEROLD_IMPLEMENTATION_PLAN.md` - Complete technical specification
2. **FOLLOW**: Phase-by-phase implementation plan
3. **TEST WITH**: Halling family data as reference case
4. **VALIDATE**: All changes against existing manual SVG quality

### If working on Halling Family (Legacy):
- Continue using existing manual process documented in `README_slakttrad.md`
- Consider how changes will translate to automated system
- Document any new layout patterns for algorithm development

## 🔧 Development Environment (Planned)

```bash
# Development setup (when implemented)
npm install
npm run dev:server  # Backend on :3001
npm run dev:client  # Frontend on :3000
npm run test        # All tests
npm run migrate     # Migrate legacy data
```

## 💡 Core Innovation

**From Manual to AI-Powered**: Transform hours of manual SVG editing into seconds of natural language input:

**Current**: Edit JSON → manually calculate positions → manually draw SVG lines
**Future**: Type "Add Elanor as Galrandir's daughter" → automatic JSON update → automatic SVG regeneration

## 🎲 Rollspelskampanj Context (Preserved)

The Middle-earth setting and cultural naming conventions remain central:
- **Fornnordiska**: Kraftfulla, gudsrelaterade namn
- **Sindarin**: Eleganta, älviska traditioner
- **Bri-folk**: Praktiska engelska namn
- **Geografiska**: Territoriell markering

The web application will support these cultural templates and expand to other fantasy/historical contexts.

---

**💡 Vision**: Herold will democratize family tree creation, making it as easy to build complex genealogies as it is to have a conversation about family relationships. The Halling family serves as our proof of concept and quality benchmark.