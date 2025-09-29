/**
 * SVG Rendering Routes
 * API endpoints for generating family tree SVGs
 */

import { Router } from 'express';
import { SVGRenderingService } from '../services/svg/SVGRenderingService';
import { ProjectService } from '../services/ProjectService';
import { FamilyMemberIntegrationService } from '../services/FamilyMemberIntegrationService';
import fs from 'fs/promises';

const router = Router();

// Initialize services
const svgService = new SVGRenderingService();
const projectService = new ProjectService();
const integrationService = new FamilyMemberIntegrationService();

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

/**
 * GET /api/projects/:id/tree/file
 * Serve the auto-generated SVG file (from family member operations)
 */
router.get('/:id/tree/file', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the project exists
    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Get the SVG file path
    const svgPath = integrationService.getSVGPath(id);

    try {
      // Read the SVG file
      const svgContent = await fs.readFile(svgPath, 'utf-8');

      // Set appropriate headers for SVG
      res.set({
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="${id}-family-tree.svg"`
      });

      res.send(svgContent);
    } catch (fileError) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'SVG file not found. Try adding or updating family members to generate it.',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error(`Error serving SVG file for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to serve SVG file',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/projects/:id/tree/status
 * Check SVG file status and metadata
 */
router.get('/:id/tree/status', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the project exists
    const project = await projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const svgExists = await integrationService.svgExists(id);
    const svgPath = integrationService.getSVGPath(id);

    let fileStats = null;
    if (svgExists) {
      try {
        const stats = await fs.stat(svgPath);
        fileStats = {
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString()
        };
      } catch (error) {
        // File might have been deleted between checks
      }
    }

    res.json({
      projectId: id,
      svgExists,
      svgPath,
      fileStats,
      memberCount: Object.keys(project.members).length,
      lastUpdated: project.metadata.senast_uppdaterad,
      message: svgExists
        ? 'SVG file is available'
        : 'SVG file not found. Add or update family members to generate it.'
    });
  } catch (error: any) {
    console.error(`Error checking SVG status for project ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to check SVG status',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/projects/:id/tree/regenerate-auto
 * Manually trigger SVG regeneration through integration service
 */
router.post('/:id/tree/regenerate-auto', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await integrationService.regenerateSVGManually(id);

    if (!result.data) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Project with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      projectId: id,
      svgPath: result.data,
      svgUpdated: result.svgUpdated,
      error: result.error,
      message: result.svgUpdated
        ? 'SVG regenerated successfully'
        : 'Failed to regenerate SVG',
      timestamp: new Date().toISOString()
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

export default router;