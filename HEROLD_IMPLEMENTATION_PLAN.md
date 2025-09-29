# Herold MVP Implementation Plan
## Family Tree Web Application - Complete Development Guide

### Project Overview
Transform the manual Halling family tree work into "Herold" - a full-featured web application for creating and managing family trees through natural language input and AI-powered data modeling.

---

## 🎯 Core Requirements Analysis

### Functional Requirements
1. **Project Management**
   - Multi-family project support
   - Create/Read/Update/Delete projects
   - Each project = family/lineage with own directory

2. **Family Tree Management**
   - Natural language input → AI processing → JSON updates → SVG rendering
   - Visual family tree display (center of interface)
   - Automatic layout generation from JSON data

3. **Customization Features**
   - Font selection and styling
   - Portrait/landscape orientation
   - Visual theme options

4. **User Interface**
   - Clean, intuitive design
   - Landing page with project gallery
   - Project workspace with tree + input field

### Non-Functional Requirements
- **Performance**: SVG rendering < 2 seconds for trees up to 100 people
- **Usability**: Natural language commands work 95% of time
- **Scalability**: Support multiple concurrent users
- **Reliability**: Data persistence and backup

---

## 🏗️ System Architecture

### Technology Stack
```
Frontend: React + TypeScript + TailwindCSS
Backend: Node.js + Express + TypeScript
AI: Claude API (Anthropic)
Storage: File system (JSON + SVG files)
Validation: Zod for schema validation
Testing: Jest + Cypress
```

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express API    │◄──►│  File System    │
│   (Frontend)    │    │   (Backend)     │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Claude API    │              │
         │              │ (NLP Processing)│              │
         │              └─────────────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │  SVG Renderer   │
                        │ (Layout Engine) │
                        └─────────────────┘
```

---

## 📁 Directory Structure

### Refactored Project Structure
```
herold/
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├──
├── src/
│   ├── client/                 # React frontend
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── project/
│   │   │   └── family-tree/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── server/                 # Express backend
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   └── utils/
│   │
│   ├── shared/                 # Shared types and utilities
│   │   ├── types/
│   │   ├── schemas/
│   │   ├── constants/
│   │   └── utils/
│   │
│   └── algorithms/             # Core family tree algorithms
│       ├── layout/
│       ├── svg-generator/
│       ├── relationship-parser/
│       └── validation/
│
├── data/                       # Project storage
│   ├── projects.json          # Project registry
│   └── families/              # Individual family directories
│       ├── halling/
│       │   ├── family.json
│       │   ├── tree.svg
│       │   └── metadata.json
│       └── [other-families]/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── templates/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/
    ├── API.md
    ├── ALGORITHMS.md
    └── USER_GUIDE.md
```

---

## 🔧 Data Model Redesign

### Core Types (TypeScript)
```typescript
// Family Member
interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  generation: number;
  birthDate?: string;
  deathDate?: string;
  parents: string[];
  children: string[];
  spouse?: string;
  status: 'living' | 'deceased' | 'unknown';
  notes: string;
  culturalBackground?: CulturalTradition;
}

// Family Project
interface FamilyProject {
  id: string;
  name: string;
  description: string;
  mainPersonId: string;
  members: Record<string, FamilyMember>;
  relationships: Relationship[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

// Visual Settings
interface ProjectSettings {
  font: FontConfig;
  orientation: 'portrait' | 'landscape';
  theme: ThemeConfig;
  layout: LayoutConfig;
}

// Relationships
interface Relationship {
  type: 'marriage' | 'parent-child' | 'sibling';
  person1: string;
  person2: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'divorced' | 'widowed';
}
```

### Enhanced JSON Schema
```json
{
  "project": {
    "id": "halling-family",
    "name": "Huset Halling",
    "description": "Släktträd för rollspelskampanj",
    "mainPersonId": "halvard",
    "culturalContext": "middle-earth-nordic"
  },
  "members": {
    "halvard": {
      "id": "halvard",
      "name": "Halvard Halling",
      "gender": "male",
      "generation": 2,
      "parents": ["holmfast", "tyra"],
      "children": ["harald", "halldis", "frode", "steorra"],
      "spouse": "aelswith",
      "status": "living",
      "notes": "Huvudperson i kampanjen",
      "culturalBackground": "nordic-dale"
    }
  },
  "settings": {
    "font": {
      "family": "Dancing Script",
      "fallbacks": ["Lucida Handwriting", "Apple Chancery"]
    },
    "orientation": "portrait",
    "theme": "parchment",
    "layout": {
      "algorithm": "family-groups-separated",
      "spacing": "comfortable"
    }
  }
}
```

---

## 🤖 AI Integration Strategy

### Natural Language Processing Pipeline
```
User Input: "Halvards far är Holmfast"
     ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Input Validation & Sanitization                     │
│    - Check for malicious content                       │
│    - Basic language validation                         │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Claude API Prompt Construction                      │
│    Prompt: "Analyze this family relationship and       │
│    generate JSON operations: [user input]              │
│    Current family data: [current JSON]"                │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Claude Response Processing                          │
│    Expected: {                                         │
│      "operations": [                                   │
│        {                                               │
│          "type": "update",                             │
│          "personId": "halvard",                        │
│          "field": "parents",                           │
│          "value": ["holmfast"]                         │
│        }                                               │
│      ],                                                │
│      "newMembers": [...],                              │
│      "validation": "success"                           │
│    }                                                   │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Operation Validation & Application                  │
│    - Validate all IDs exist or can be created          │
│    - Check for relationship conflicts                  │
│    - Apply changes to JSON model                       │
└─────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. SVG Regeneration                                    │
│    - Run layout algorithm                              │
│    - Generate new SVG                                  │
│    - Return updated family tree                        │
└─────────────────────────────────────────────────────────┘
```

### Claude Prompt Templates
```typescript
const RELATIONSHIP_PROMPT = `
You are a family tree data specialist. Analyze the user's input about family relationships and convert it to precise JSON operations.

Current Family Data:
{familyJSON}

User Input: "{userInput}"

Rules:
1. Identify all people mentioned
2. Determine relationship types (parent-child, marriage, sibling)
3. Check for cultural naming conventions
4. Generate JSON operations to update the family data
5. Create new person entries if needed
6. Validate for logical consistency

Return format:
{
  "operations": [
    {
      "type": "update|create|delete",
      "personId": "string",
      "field": "parents|children|spouse",
      "value": "new value"
    }
  ],
  "newMembers": [FamilyMember[]],
  "validation": {
    "status": "success|error",
    "message": "explanation"
  }
}
`;
```

---

## 🎨 SVG Layout Algorithm Design

### Core Algorithm Architecture
```typescript
class FamilyTreeLayoutEngine {

  // Main entry point
  generateLayout(familyData: FamilyProject): SVGLayoutResult {
    const generations = this.groupByGeneration(familyData.members);
    const familyGroups = this.identifyFamilyGroups(familyData);
    const positions = this.calculatePositions(generations, familyGroups);
    const connections = this.generateConnections(familyGroups, positions);

    return {
      elements: this.createSVGElements(positions, connections),
      dimensions: this.calculateOptimalDimensions(positions),
      metadata: this.generateLayoutMetadata()
    };
  }

  // Group people by generation for vertical layout
  private groupByGeneration(members: Record<string, FamilyMember>) {
    // Implementation details...
  }

  // Identify family units (parents + children)
  private identifyFamilyGroups(familyData: FamilyProject) {
    // Implementation details...
  }

  // Calculate optimal X,Y positions for each person
  private calculatePositions(generations: Generation[], familyGroups: FamilyGroup[]) {
    // Implementation details...
  }

  // Generate connection lines between family members
  private generateConnections(familyGroups: FamilyGroup[], positions: PositionMap) {
    // Implementation details...
  }
}
```

### Advanced Layout Features
1. **Collision Detection**: Prevent overlapping names and lines
2. **Dynamic Spacing**: Adjust based on name length and family size
3. **Orientation Support**: Portrait vs landscape optimizations
4. **Cultural Considerations**: Different spacing for different naming traditions
5. **Quality Metrics**: Readability scoring and automatic adjustments

### Layout Algorithm Pseudocode
```
ALGORITHM: FamilyTreeLayout

INPUT: FamilyProject data
OUTPUT: SVG element positions and connections

1. PREPROCESSING
   - Group members by generation (-4, -3, -2, -1, 0, 1, 2, 3...)
   - Identify marriage couples and family units
   - Calculate text width requirements for each name
   - Determine cultural naming conventions

2. POSITION CALCULATION
   - Calculate generation Y-coordinates with optimal spacing
   - For each generation:
     - Group into family units (couples + children)
     - Calculate required width for each family unit
     - Distribute family units horizontally with spacing
     - Center-align children under parent couples
     - Adjust for generation-to-generation alignment

3. CONNECTION ROUTING
   - Marriage connections: horizontal lines with ⚭ symbol
   - Parent-child connections:
     * Vertical from parent couple center
     * Horizontal distribution line for children
     * Individual vertical lines to each child
   - Sibling connections: horizontal line between siblings

4. COLLISION DETECTION & ADJUSTMENT
   - Check for text overlaps
   - Check for line crossings
   - Adjust positions iteratively to resolve conflicts
   - Maintain family relationship clarity

5. OPTIMIZATION
   - Minimize total connection line length
   - Maximize text readability
   - Balance visual composition
   - Respect cultural spacing preferences

6. SVG GENERATION
   - Create text elements with calculated positions
   - Create connection line elements
   - Apply styling (fonts, colors, decorations)
   - Add background and borders
   - Optimize for target orientation (portrait/landscape)
```

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Basic project structure and data model

**Tasks**:
1. **Project Setup**
   - [ ] Initialize Node.js + TypeScript project
   - [ ] Setup React frontend with Vite
   - [ ] Configure ESLint, Prettier, and testing framework
   - [ ] Create basic directory structure

2. **Data Model Implementation**
   - [ ] Define TypeScript interfaces for all data types
   - [ ] Implement Zod schemas for validation
   - [ ] Create data migration script for existing Halling family
   - [ ] Setup file-based storage system

3. **Basic Backend API**
   - [ ] Express server setup
   - [ ] REST endpoints for project CRUD operations
   - [ ] File system integration for data persistence
   - [ ] Basic error handling and logging

**Deliverables**:
- Working backend API with project management
- TypeScript data models and validation
- Migrated Halling family data

### Phase 2: Core Functionality (Weeks 3-4)
**Goal**: Basic family tree viewing and manual editing

**Tasks**:
1. **Frontend Foundation**
   - [ ] React component architecture
   - [ ] Project listing page
   - [ ] Project detail page with placeholder family tree
   - [ ] Basic routing and navigation

2. **SVG Rendering Engine**
   - [ ] Implement basic layout algorithm
   - [ ] SVG generation from JSON data
   - [ ] Handle simple family structures (parents → children)
   - [ ] Basic styling and font support

3. **Manual Data Entry**
   - [ ] Forms for adding/editing family members
   - [ ] Relationship management interface
   - [ ] Real-time SVG updates

**Deliverables**:
- Working web interface for family tree management
- Basic SVG rendering from JSON data
- Manual family member editing

### Phase 3: AI Integration (Weeks 5-6)
**Goal**: Natural language processing for family relationships

**Tasks**:
1. **Claude API Integration**
   - [ ] API client setup and authentication
   - [ ] Prompt engineering for relationship parsing
   - [ ] Response parsing and validation
   - [ ] Error handling for AI responses

2. **Natural Language Processing Pipeline**
   - [ ] Input sanitization and validation
   - [ ] Relationship extraction from natural language
   - [ ] JSON operation generation
   - [ ] Conflict detection and resolution

3. **User Interface for AI Input**
   - [ ] Text input component with suggestions
   - [ ] Processing status indicators
   - [ ] Error feedback and correction prompts
   - [ ] History of AI operations

**Deliverables**:
- Working natural language → family tree updates
- Robust error handling for AI processing
- User-friendly AI interaction interface

### Phase 4: Advanced Layout (Weeks 7-8)
**Goal**: Production-quality automatic layout generation

**Tasks**:
1. **Advanced Layout Algorithm**
   - [ ] Implement sophisticated positioning algorithm
   - [ ] Collision detection and resolution
   - [ ] Multi-generation optimization
   - [ ] Cultural naming consideration

2. **Visual Customization**
   - [ ] Font selection and management
   - [ ] Theme and styling options
   - [ ] Portrait/landscape orientation support
   - [ ] Export functionality (PNG, PDF)

3. **Quality Assurance**
   - [ ] Layout quality metrics
   - [ ] Automatic layout testing
   - [ ] Performance optimization
   - [ ] Cross-browser compatibility

**Deliverables**:
- Professional-quality automatic family tree layout
- Full customization options
- Export capabilities

### Phase 5: Polish & Production (Weeks 9-10)
**Goal**: Production-ready MVP

**Tasks**:
1. **User Experience Polish**
   - [ ] Responsive design for all screen sizes
   - [ ] Loading states and animations
   - [ ] Keyboard shortcuts and accessibility
   - [ ] User onboarding and help system

2. **Production Readiness**
   - [ ] Environment configuration (dev/prod)
   - [ ] Data backup and recovery
   - [ ] Performance monitoring
   - [ ] Security review and hardening

3. **Documentation and Testing**
   - [ ] Comprehensive test coverage (unit + integration)
   - [ ] User documentation and guides
   - [ ] API documentation
   - [ ] Deployment instructions

**Deliverables**:
- Production-ready Herold MVP
- Complete documentation
- Deployment scripts

---

## 🔍 Critical Technical Challenges

### 1. Automatic Layout Generation
**Problem**: Creating readable, aesthetically pleasing family trees automatically
**Approach**:
- Start with proven manual layout principles from Halling family
- Implement mathematical optimization for position calculation
- Use iterative improvement algorithms for conflict resolution
- Quality metrics to evaluate and improve layouts

**Key Algorithms Needed**:
```typescript
// Position optimization with constraints
function optimizePositions(
  members: FamilyMember[],
  constraints: LayoutConstraints
): PositionMap {
  // Genetic algorithm or simulated annealing
  // to find optimal positions
}

// Collision detection for text and lines
function detectCollisions(layout: Layout): Collision[] {
  // Check text bounding boxes
  // Check line intersections
  // Return list of conflicts to resolve
}

// Connection routing to avoid crossings
function routeConnections(
  positions: PositionMap,
  relationships: Relationship[]
): ConnectionPath[] {
  // A* pathfinding or similar
  // to route lines around obstacles
}
```

### 2. Natural Language Understanding
**Problem**: Converting "Halvards far är Holmfast" to precise JSON operations
**Approach**:
- Leverage Claude's strong language understanding
- Design robust prompt engineering
- Implement validation and error correction
- Handle ambiguous or incomplete information

**Prompt Strategy**:
```typescript
const COMPREHENSIVE_PROMPT = `
You are an expert genealogist and data modeler. Your task is to:

1. Parse family relationship statements in natural language
2. Identify all mentioned people and their relationships
3. Generate precise JSON operations to update family data
4. Handle cultural naming conventions appropriately
5. Validate for logical consistency

Context: This is a ${familyProject.culturalContext} family tree.
Current family contains ${Object.keys(familyProject.members).length} members.

Relationship patterns to recognize:
- "X's father is Y" → parent-child relationship
- "X married Y" → marriage relationship
- "X and Y are siblings" → sibling relationship
- "X's children are Y, Z" → parent-child relationships

Return structured JSON operations that can be safely applied.
`;
```

### 3. Performance and Scalability
**Problem**: Maintaining responsiveness with complex family trees
**Approach**:
- Efficient data structures for family relationships
- Incremental SVG updates instead of full regeneration
- Caching of layout calculations
- Progressive loading for large families

**Performance Targets**:
- SVG generation: < 2 seconds for trees up to 100 people
- API responses: < 500ms for most operations
- UI updates: < 100ms for interactive feedback

### 4. Cultural and Historical Accuracy
**Problem**: Respecting different naming traditions and family structures
**Approach**:
- Configurable cultural templates
- Historical period awareness
- Flexible relationship definitions
- Expert validation workflows

---

## 📋 API Design

### RESTful Endpoints
```typescript
// Projects
GET    /api/projects              // List all projects
POST   /api/projects              // Create new project
GET    /api/projects/:id          // Get project details
PUT    /api/projects/:id          // Update project
DELETE /api/projects/:id          // Delete project

// Family Members
GET    /api/projects/:id/members  // Get all family members
POST   /api/projects/:id/members  // Add family member
PUT    /api/projects/:id/members/:memberId  // Update member
DELETE /api/projects/:id/members/:memberId  // Remove member

// AI Processing
POST   /api/projects/:id/process-language  // Process natural language input
GET    /api/projects/:id/generation-status // Check AI processing status

// Family Tree Rendering
GET    /api/projects/:id/tree/svg // Get rendered SVG
POST   /api/projects/:id/tree/regenerate  // Force SVG regeneration
GET    /api/projects/:id/tree/export/:format  // Export (png, pdf, etc)

// Settings
GET    /api/projects/:id/settings // Get project settings
PUT    /api/projects/:id/settings // Update project settings
```

### Example API Responses
```typescript
// GET /api/projects
{
  "projects": [
    {
      "id": "halling-family",
      "name": "Huset Halling",
      "description": "Släktträd för rollspelskampanj",
      "memberCount": 34,
      "lastModified": "2025-09-28T18:30:00Z",
      "thumbnail": "/thumbnails/halling-family.jpg"
    }
  ]
}

// POST /api/projects/:id/process-language
{
  "input": "Halvards far är Holmfast",
  "operations": [
    {
      "type": "update",
      "personId": "halvard",
      "field": "parents",
      "value": ["holmfast"],
      "confidence": 0.95
    }
  ],
  "newMembers": [],
  "warnings": [],
  "success": true
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- Data model validation and transformation
- Layout algorithm components
- API endpoint functionality
- SVG generation utilities

### Integration Tests
- Full API workflow tests
- Claude API integration
- File system operations
- End-to-end data flow

### E2E Tests
- User journey through creating a family tree
- Natural language input → visual output
- Export functionality
- Multi-project management

### Performance Tests
- Layout generation speed with varying family sizes
- Memory usage with large datasets
- Concurrent user simulation
- API response time benchmarks

---

## 🚀 Deployment Strategy

### Development Environment
```bash
# Local development setup
npm install
npm run dev:server  # Start backend on :3001
npm run dev:client  # Start frontend on :3000
npm run test        # Run all tests
```

### Production Deployment
- **Backend**: Node.js application (PM2 or Docker)
- **Frontend**: Static build served by Nginx
- **Data**: File system with regular backups
- **Environment**: Ubuntu server or containerized deployment

### Environment Variables
```bash
# .env
NODE_ENV=production
PORT=3001
CLAUDE_API_KEY=your_claude_api_key
DATA_DIRECTORY=/var/herold/data
BACKUP_DIRECTORY=/var/herold/backups
```

---

## 📖 Documentation Requirements

### User Documentation
1. **Getting Started Guide**: Creating your first family tree
2. **Natural Language Reference**: Examples of supported relationship statements
3. **Customization Guide**: Fonts, themes, and layout options
4. **Export Guide**: Creating shareable family trees

### Developer Documentation
1. **API Reference**: Complete endpoint documentation
2. **Algorithm Documentation**: Layout engine internals
3. **Extension Guide**: Adding new features and cultural templates
4. **Troubleshooting Guide**: Common issues and solutions

### Example User Guide Section
```markdown
# Adding Family Members with Natural Language

Herold understands natural language statements about family relationships. Here are examples:

## Parent-Child Relationships
- "Halvard's father is Holmfast"
- "Tyra is the mother of Halvard"
- "Holmfast and Tyra have a son named Halvard"

## Marriages
- "Halvard married Aelswith"
- "Halvard and Aelswith are married"

## Siblings
- "Harald and Halldis are siblings"
- "Harald, Halldis, Frode, and Steorra are all children of Halvard"

## Complex Statements
- "Add Elanor as Galrandir's daughter and Halli's wife"
- "Grimward married Mithrellas and they had a son named Beregond"
```

---

## ⚡ Success Metrics

### Technical Metrics
- **Accuracy**: AI parsing success rate > 95%
- **Performance**: Layout generation < 2 seconds
- **Reliability**: 99.9% uptime for API
- **Quality**: User satisfaction score > 4.5/5

### User Metrics
- **Adoption**: Users create family trees within 10 minutes
- **Engagement**: Average session duration > 15 minutes
- **Retention**: 70% of users return within a week
- **Growth**: Family trees average 20+ members

### Business Metrics
- **MVP Completion**: All core features working
- **Scalability**: Support 100+ concurrent users
- **Maintainability**: Code coverage > 80%
- **Extensibility**: Easy to add new cultural templates

---

## 🔄 Migration Plan

### Existing Halling Data Migration
1. **Preserve Original Files**: Keep manual SVG and JSON as reference
2. **Data Transformation**: Convert to new schema format
3. **Validation**: Ensure all relationships are correctly migrated
4. **Visual Verification**: Compare auto-generated vs manual SVG

### Migration Script Outline
```typescript
async function migrateHallingFamily() {
  // 1. Load existing halling_slakt.json
  const originalData = await loadJson('halling_slakt.json');

  // 2. Transform to new schema
  const migratedProject = transformToNewSchema(originalData);

  // 3. Validate all relationships
  const validation = validateFamilyData(migratedProject);

  // 4. Generate SVG with new algorithm
  const generatedSVG = await generateFamilyTreeSVG(migratedProject);

  // 5. Compare with original SVG
  const comparison = compareLayouts(originalSVG, generatedSVG);

  // 6. Save to new project structure
  await saveProject('families/halling', migratedProject);

  return { validation, comparison };
}
```

---

## 🎯 Next Steps for Implementation

### Immediate Actions (Week 1)
1. **Setup Development Environment**
   - Initialize git repository
   - Setup Node.js + TypeScript project structure
   - Configure development tools and testing framework

2. **Create Core Data Types**
   - Define TypeScript interfaces
   - Implement Zod validation schemas
   - Create data transformation utilities

3. **Begin Backend API**
   - Setup Express server
   - Implement basic project CRUD endpoints
   - Create file system storage layer

### Week 1 Deliverables
- [ ] Working development environment
- [ ] Core data models implemented
- [ ] Basic API endpoints functional
- [ ] Halling family data migrated to new format

### Success Criteria for Phase 1
- All tests passing
- API endpoints return valid responses
- Data validation working correctly
- Clear path forward for Phase 2

---

## 📝 Implementation Notes

### Key Design Decisions
1. **File-based storage over database**: Simplifies deployment and backup
2. **React for frontend**: Wide ecosystem and team familiarity
3. **TypeScript throughout**: Type safety for complex data relationships
4. **Claude API for NLP**: Leverages existing language understanding capabilities

### Risk Mitigation
1. **AI Accuracy**: Extensive prompt testing and fallback validation
2. **Performance**: Early profiling and optimization planning
3. **Complexity**: Incremental development with working prototypes
4. **User Experience**: Regular user testing and feedback integration

### Extension Points for Future
1. **Database Integration**: Easy migration to PostgreSQL/MongoDB
2. **Multi-user Support**: Authentication and sharing capabilities
3. **Advanced Features**: Family chronicles, coat of arms, DNA integration
4. **Mobile App**: React Native or dedicated mobile interface

---

This implementation plan provides a comprehensive roadmap for transforming the manual Halling family tree work into a production-ready web application. The phased approach ensures steady progress while managing complexity, and the detailed technical specifications provide clear guidance for implementation teams.

The plan balances ambitious goals (AI-powered natural language processing, automatic layout generation) with practical constraints (file-based storage, MVP timeline) to deliver a working system that can evolve and scale over time.