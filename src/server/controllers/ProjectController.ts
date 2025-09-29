/**
 * Project Controller
 * Handles HTTP requests for project management operations
 */

import { Request, Response } from 'express';
import { ProjectService, CreateProjectData, UpdateProjectData } from '../services/ProjectService';

export class ProjectController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  /**
   * GET /api/projects - List all projects
   */
  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.projectService.listProjects();
      res.json({ projects });
    } catch (error: any) {
      console.error('Error listing projects:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list projects',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/projects/:id - Get project details
   */
  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const project = await this.projectService.getProject(id);

      if (!project) {
        res.status(404).json({
          error: 'Not Found',
          message: `Project with ID '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({ project });
    } catch (error: any) {
      console.error(`Error getting project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get project',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/projects - Create new project
   */
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, mainPersonId } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project name is required and must be a non-empty string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!description || typeof description !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project description is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (mainPersonId && typeof mainPersonId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Main person ID must be a string if provided',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const projectData: CreateProjectData = {
        name: name.trim(),
        description: description.trim(),
        mainPersonId: mainPersonId?.trim()
      };

      const project = await this.projectService.createProject(projectData);

      res.status(201).json({
        project,
        message: 'Project created successfully'
      });
    } catch (error: any) {
      console.error('Error creating project:', error);

      if (error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to create project',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * PUT /api/projects/:id - Update project
   */
  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, culturalContext } = req.body;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate update data
      const updates: UpdateProjectData = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Name must be a non-empty string if provided',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.name = name.trim();
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Description must be a string if provided',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.description = description.trim();
      }

      if (culturalContext !== undefined) {
        if (typeof culturalContext !== 'string') {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Cultural context must be a string if provided',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.culturalContext = culturalContext.trim();
      }

      const project = await this.projectService.updateProject(id, updates);

      if (!project) {
        res.status(404).json({
          error: 'Not Found',
          message: `Project with ID '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        project,
        message: 'Project updated successfully'
      });
    } catch (error: any) {
      console.error(`Error updating project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update project',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DELETE /api/projects/:id - Delete project
   */
  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const deleted = await this.projectService.deleteProject(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: `Project with ID '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        message: `Project '${id}' deleted successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Error deleting project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete project',
        timestamp: new Date().toISOString(),
      });
    }
  }
}