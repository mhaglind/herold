/**
 * Project Routes
 * RESTful API endpoints for project management
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectService } from '../services/ProjectService';

const router = Router();

// Initialize service and controller
const projectService = new ProjectService();
const projectController = new ProjectController(projectService);

/**
 * GET /api/projects
 * List all projects with summary information
 */
router.get('/', async (req, res) => {
  await projectController.listProjects(req, res);
});

/**
 * POST /api/projects
 * Create a new project
 * Body: { name: string, description: string, mainPersonId?: string }
 */
router.post('/', async (req, res) => {
  await projectController.createProject(req, res);
});

/**
 * GET /api/projects/:id
 * Get project details by ID
 */
router.get('/:id', async (req, res) => {
  await projectController.getProject(req, res);
});

/**
 * PUT /api/projects/:id
 * Update project details
 * Body: { name?: string, description?: string, culturalContext?: string }
 */
router.put('/:id', async (req, res) => {
  await projectController.updateProject(req, res);
});

/**
 * DELETE /api/projects/:id
 * Delete a project by ID
 */
router.delete('/:id', async (req, res) => {
  await projectController.deleteProject(req, res);
});

export default router;