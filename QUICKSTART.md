# Herold - Quick Start Guide

Basic operations for running the Herold family tree application.

## 🚀 Starting the System

### Development Mode (Recommended)
```bash
# Start both server and client in development mode
npm run dev

# OR start them separately:
npm run dev:server  # API server on http://localhost:3001
npm run dev:client  # React app on http://localhost:3000
```

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🛑 Stopping the System

- **Development mode**: Press `Ctrl+C` in the terminal
- **Background processes**: Use `ps aux | grep node` to find process IDs, then `kill <PID>`

## 🔍 Health Checks

### API Health
```bash
curl http://localhost:3001/health
```

### Quick Test
```bash
# Run all tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📁 Key Endpoints

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🗂️ Data Storage

Projects are stored as JSON files in:
```
./data/projects/
├── project-name-1.json
├── project-name-2.json
└── ...
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors
```bash
# Clean build
npm run build
```

## 🔧 Environment Variables

Create `.env` file (optional):
```bash
PORT=3001
NODE_ENV=development
DATA_DIRECTORY=./data/projects
```

---

**That's it!** For detailed documentation, see the implementation plan and API docs.