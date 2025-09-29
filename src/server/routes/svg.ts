/**
 * SVG Rendering Routes
 * API endpoints for generating family tree SVGs
 */

import { Router } from 'express';
import { SVGRenderingService } from '../services/svg/SVGRenderingService';
import { ProjectService } from '../services/ProjectService';

const router = Router();

// Initialize services
const svgService = new SVGRenderingService();
const projectService = new ProjectService();

/**
 * GET /api/projects/:id/tree/svg
 * Generate SVG for a family tree project
 */
router.get('/:id/tree/svg', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the project
    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate project can be rendered
    const validationErrors = svgService.validateProject(project);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Project has validation errors',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      });
    }

    // Render the SVG
    const result = await svgService.renderFamilyTree(project);

    // Set appropriate headers for SVG
    res.set({
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `inline; filename="${project.id}-family-tree.svg"`
    });

    res.send(result.svg);
  } catch (error: any) {
    console.error(`Error rendering SVG for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to render SVG',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/projects/:id/tree/thumbnail
 * Generate thumbnail SVG for a family tree project
 */
router.get('/:id/tree/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const thumbnailSvg = await svgService.generateThumbnail(project);

    res.set({
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `inline; filename="${project.id}-thumbnail.svg"`
    });

    res.send(thumbnailSvg);
  } catch (error: any) {
    console.error(`Error rendering thumbnail for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to render thumbnail',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/projects/:id/tree/regenerate
 * Force regeneration of SVG with custom options
 */
router.post('/:id/tree/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { layoutOptions } = req.body;

    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await svgService.renderFamilyTree(project, {
      layout: layoutOptions
    });

    res.json({
      svg: result.svg,
      metadata: result.metadata,
      message: 'SVG regenerated successfully'
    });
  } catch (error: any) {
    console.error(`Error regenerating SVG for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to regenerate SVG',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/projects/:id/tree/stats
 * Get layout statistics for debugging
 */
router.get('/:id/tree/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const stats = await svgService.getLayoutStats(project);
    const validationErrors = svgService.validateProject(project);

    res.json({
      projectId: id,
      stats,
      validation: {
        isValid: validationErrors.length === 0,
        errors: validationErrors
      },
      estimatedRenderTime: svgService.estimateRenderTime(project)
    });
  } catch (error: any) {
    console.error(`Error getting layout stats for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to get layout stats',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;