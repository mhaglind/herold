/**
 * SVG Rendering Service
 * Main service that coordinates layout calculation and SVG generation
 */

import { FamilyProject } from '../../../shared/types/FamilyProject';
import { LayoutEngine } from './LayoutEngine';
import { SVGGenerator } from './SVGGenerator';
import { LayoutConfig } from './LayoutTypes';

export interface SVGRenderOptions {
  layout?: Partial<LayoutConfig>;
  format?: 'svg' | 'png' | 'pdf';
  quality?: number;
}

export interface SVGRenderResult {
  svg: string;
  metadata: {
    dimensions: { width: number; height: number };
    peopleCount: number;
    generationCount: number;
    renderTime: number;
  };
}

export class SVGRenderingService {
  private layoutEngine: LayoutEngine;
  private svgGenerator: SVGGenerator;

  constructor() {
    this.layoutEngine = new LayoutEngine();
    this.svgGenerator = new SVGGenerator();
  }

  /**
   * Render a family tree project to SVG
   */
  async renderFamilyTree(
    project: FamilyProject,
    options: SVGRenderOptions = {}
  ): Promise<SVGRenderResult> {
    const startTime = Date.now();

    try {
      // Apply layout configuration from project settings and options
      const layoutConfig = this.buildLayoutConfig(project, options.layout);

      // Create layout engine with project-specific configuration
      const layoutEngine = new LayoutEngine(layoutConfig);
      const svgGenerator = new SVGGenerator(layoutConfig);

      // Generate layout
      const layout = layoutEngine.generateLayout(project);

      // Generate SVG
      const svg = svgGenerator.generateSVG(project, layout);

      const renderTime = Date.now() - startTime;

      return {
        svg,
        metadata: {
          dimensions: layout.dimensions,
          peopleCount: Object.keys(project.members).length,
          generationCount: layout.generations.length,
          renderTime
        }
      };
    } catch (error) {
      throw new Error(`Failed to render family tree: ${error}`);
    }
  }

  /**
   * Render SVG for a family tree with custom layout options
   */
  async renderWithCustomLayout(
    project: FamilyProject,
    layoutOverrides: Partial<LayoutConfig>
  ): Promise<SVGRenderResult> {
    return this.renderFamilyTree(project, { layout: layoutOverrides });
  }

  /**
   * Generate thumbnail SVG (smaller, simplified version)
   */
  async generateThumbnail(project: FamilyProject): Promise<string> {
    const thumbnailConfig: Partial<LayoutConfig> = {
      fontSize: 12,
      generationSpacing: 60,
      personSpacing: 80,
      marginTop: 60,
      marginBottom: 30,
      titleHeight: 50
    };

    const result = await this.renderFamilyTree(project, { layout: thumbnailConfig });
    return result.svg;
  }

  /**
   * Validate that a project can be rendered
   */
  validateProject(project: FamilyProject): string[] {
    const errors: string[] = [];

    // Check if main person exists
    if (!project.members[project.mainPersonId]) {
      errors.push('Main person not found in project members');
    }

    // Check for circular references
    Object.values(project.members).forEach(member => {
      if (member.föräldrar.includes(member.id)) {
        errors.push(`Member ${member.id} cannot be their own parent`);
      }
      if (member.barn.includes(member.id)) {
        errors.push(`Member ${member.id} cannot be their own child`);
      }
    });

    // Check for broken relationships
    Object.values(project.members).forEach(member => {
      // Check parent references
      member.föräldrar.forEach(parentId => {
        if (!project.members[parentId]) {
          errors.push(`Parent ${parentId} referenced by ${member.id} does not exist`);
        }
      });

      // Check child references
      member.barn.forEach(childId => {
        if (!project.members[childId]) {
          errors.push(`Child ${childId} referenced by ${member.id} does not exist`);
        }
      });

      // Check partner references
      if (member.partner && !project.members[member.partner]) {
        errors.push(`Partner ${member.partner} referenced by ${member.id} does not exist`);
      }
    });

    return errors;
  }

  /**
   * Build layout configuration from project settings and overrides
   */
  private buildLayoutConfig(
    project: FamilyProject,
    overrides?: Partial<LayoutConfig>
  ): Partial<LayoutConfig> {
    const baseConfig: Partial<LayoutConfig> = {
      fontSize: project.settings.font.size?.names || 16,
      fontFamily: project.settings.font.family,
      lineColor: project.settings.theme.colors.lines,
      lineWidth: 1
    };

    // Apply spacing based on layout algorithm
    if (project.settings.layout.spacing === 'tight') {
      baseConfig.generationSpacing = 60;
      baseConfig.personSpacing = 80;
      baseConfig.marriageSpacing = 30;
    } else if (project.settings.layout.spacing === 'spacious') {
      baseConfig.generationSpacing = 100;
      baseConfig.personSpacing = 150;
      baseConfig.marriageSpacing = 50;
    }
    // 'comfortable' is the default

    // Apply orientation adjustments
    if (project.settings.orientation === 'landscape') {
      baseConfig.generationSpacing = Math.floor((baseConfig.generationSpacing || 80) * 0.8);
      baseConfig.personSpacing = Math.floor((baseConfig.personSpacing || 120) * 1.2);
    }

    return {
      ...baseConfig,
      ...overrides
    };
  }

  /**
   * Calculate estimated render time based on project complexity
   */
  estimateRenderTime(project: FamilyProject): number {
    const memberCount = Object.keys(project.members).length;
    const relationshipCount = project.relationships.length;

    // Base time of 100ms + 10ms per member + 5ms per relationship
    return 100 + (memberCount * 10) + (relationshipCount * 5);
  }

  /**
   * Get layout statistics for debugging
   */
  async getLayoutStats(project: FamilyProject): Promise<any> {
    const layoutEngine = new LayoutEngine();
    const layout = layoutEngine.generateLayout(project);

    return {
      dimensions: layout.dimensions,
      peopleCount: layout.people.length,
      generationCount: layout.generations.length,
      connectionCount: layout.connections.length,
      marriageCount: layout.marriages.length,
      generations: layout.generations.map(gen => ({
        generation: gen.generation,
        memberCount: gen.members.length,
        yPosition: gen.yPosition
      }))
    };
  }
}