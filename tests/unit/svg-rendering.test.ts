/**
 * Tests for SVG Rendering Engine
 */

import { LayoutEngine } from '../../src/server/services/svg/LayoutEngine';
import { SVGGenerator } from '../../src/server/services/svg/SVGGenerator';
import { SVGRenderingService } from '../../src/server/services/svg/SVGRenderingService';
import { FamilyProject, DEFAULT_PROJECT_SETTINGS } from '../../src/shared/types/FamilyProject';
import { FamilyMember } from '../../src/shared/types/FamilyMember';

describe('SVG Rendering Engine', () => {
  let layoutEngine: LayoutEngine;
  let svgGenerator: SVGGenerator;
  let renderingService: SVGRenderingService;

  beforeEach(() => {
    layoutEngine = new LayoutEngine();
    svgGenerator = new SVGGenerator();
    renderingService = new SVGRenderingService();
  });

  describe('LayoutEngine', () => {
    it('should create layout for simple family', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);

      expect(layout.people).toHaveLength(3);
      expect(layout.generations).toHaveLength(2);
      expect(layout.connections).toHaveLength(2); // 2 parent-child connections
      expect(layout.marriages).toHaveLength(1); // 1 marriage
      expect(layout.dimensions.width).toBeGreaterThan(0);
      expect(layout.dimensions.height).toBeGreaterThan(0);
    });

    it('should group people by generation correctly', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);

      const gen0 = layout.generations.find(g => g.generation === 0);
      const gen1 = layout.generations.find(g => g.generation === 1);

      expect(gen0).toBeDefined();
      expect(gen1).toBeDefined();
      expect(gen0!.members).toHaveLength(2); // parents
      expect(gen1!.members).toHaveLength(1); // child
    });

    it('should calculate positions correctly', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);

      // Check that Y positions increase with generation
      const parentY = layout.people.find(p => p.member.generation === 0)!.y;
      const childY = layout.people.find(p => p.member.generation === 1)!.y;

      expect(childY).toBeGreaterThan(parentY);
    });
  });

  describe('SVGGenerator', () => {
    it('should generate valid SVG markup', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);
      const svg = svgGenerator.generateSVG(project, layout);

      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('Dancing Script');
      expect(svg).toContain('parchment');
    });

    it('should include all family members in SVG', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);
      const svg = svgGenerator.generateSVG(project, layout);

      expect(svg).toContain('John');
      expect(svg).toContain('Jane');
      expect(svg).toContain('Child');
    });

    it('should include marriage symbols', () => {
      const project = createSimpleFamily();
      const layout = layoutEngine.generateLayout(project);
      const svg = svgGenerator.generateSVG(project, layout);

      expect(svg).toContain('⚭'); // Marriage symbol
    });

    it('should escape XML characters', () => {
      const project = createSimpleFamily();
      // Add a member with special characters
      project.members['special'] = {
        id: 'special',
        namn: 'Name & "Special" <Characters>',
        kön: 'other',
        generation: 2,
        föräldrar: ['child'],
        barn: [],
        partner: null,
        status: 'levande',
        anteckningar: ''
      };

      const layout = layoutEngine.generateLayout(project);
      const svg = svgGenerator.generateSVG(project, layout);

      expect(svg).toContain('&amp;');
      expect(svg).toContain('&quot;');
      expect(svg).toContain('&lt;');
      expect(svg).toContain('&gt;');
    });
  });

  describe('SVGRenderingService', () => {
    it('should render complete family tree', async () => {
      const project = createSimpleFamily();
      const result = await renderingService.renderFamilyTree(project);

      expect(result.svg).toBeDefined();
      expect(result.metadata.peopleCount).toBe(3);
      expect(result.metadata.generationCount).toBe(2);
      expect(result.metadata.renderTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.dimensions.width).toBeGreaterThan(0);
      expect(result.metadata.dimensions.height).toBeGreaterThan(0);
    });

    it('should validate project before rendering', () => {
      const invalidProject = createSimpleFamily();
      // Remove main person
      delete invalidProject.members[invalidProject.mainPersonId];

      const errors = renderingService.validateProject(invalidProject);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Main person not found'))).toBe(true);
    });

    it('should detect circular references', () => {
      const project = createSimpleFamily();
      // Create circular reference - make John his own parent
      project.members['john'].föräldrar = ['john'];

      const errors = renderingService.validateProject(project);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('cannot be their own parent'))).toBe(true);
    });

    it('should generate thumbnail with smaller dimensions', async () => {
      const project = createSimpleFamily();
      const thumbnailSvg = await renderingService.generateThumbnail(project);

      expect(thumbnailSvg).toContain('<svg');
      expect(thumbnailSvg).toContain('font-size="12"'); // Smaller font size
    });

    it('should calculate render time estimate', () => {
      const project = createSimpleFamily();
      const estimate = renderingService.estimateRenderTime(project);

      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(1000); // Should be reasonable for small family
    });

    it('should get layout statistics', async () => {
      const project = createSimpleFamily();
      const stats = await renderingService.getLayoutStats(project);

      expect(stats.peopleCount).toBe(3);
      expect(stats.generationCount).toBe(2);
      expect(stats.connectionCount).toBe(2);
      expect(stats.marriageCount).toBe(1);
      expect(stats.generations).toHaveLength(2);
    });
  });

  describe('Layout Configuration', () => {
    it('should apply spacing settings', async () => {
      const project = createSimpleFamily();
      project.settings.layout.spacing = 'spacious';

      const result = await renderingService.renderFamilyTree(project);
      expect(result.svg).toBeDefined();
    });

    it('should apply orientation settings', async () => {
      const project = createSimpleFamily();
      project.settings.orientation = 'landscape';

      const result = await renderingService.renderFamilyTree(project);
      expect(result.svg).toBeDefined();
    });

    it('should apply font settings', async () => {
      const project = createSimpleFamily();
      project.settings.font.family = 'Times New Roman';
      project.settings.font.size = { title: 24, names: 14, relationships: 10 };

      const result = await renderingService.renderFamilyTree(project);
      expect(result.svg).toContain('Times New Roman');
      expect(result.svg).toContain('font-size="14"');
    });
  });
});

/**
 * Create a simple test family for testing
 */
function createSimpleFamily(): FamilyProject {
  const members: Record<string, FamilyMember> = {
    'john': {
      id: 'john',
      namn: 'John',
      kön: 'man',
      generation: 0,
      föräldrar: [],
      barn: ['child'],
      partner: 'jane',
      status: 'levande',
      anteckningar: 'Father'
    },
    'jane': {
      id: 'jane',
      namn: 'Jane',
      kön: 'kvinna',
      generation: 0,
      föräldrar: [],
      barn: ['child'],
      partner: 'john',
      status: 'levande',
      anteckningar: 'Mother'
    },
    'child': {
      id: 'child',
      namn: 'Child',
      kön: 'other',
      generation: 1,
      föräldrar: ['john', 'jane'],
      barn: [],
      partner: null,
      status: 'levande',
      anteckningar: 'Child of John and Jane'
    }
  };

  return {
    id: 'test-family',
    name: 'Test Family',
    description: 'A test family for unit testing',
    mainPersonId: 'child',
    members,
    relationships: [
      {
        type: 'marriage',
        person1: 'john',
        person2: 'jane',
        status: 'gift'
      },
      {
        type: 'parent-child',
        person1: 'john',
        person2: 'child'
      },
      {
        type: 'parent-child',
        person1: 'jane',
        person2: 'child'
      }
    ],
    settings: DEFAULT_PROJECT_SETTINGS,
    metadata: {
      skapad: new Date().toISOString(),
      senast_uppdaterad: new Date().toISOString(),
      version: '1.0.0',
      struktur_version: '2.0.0',
      antal_personer: 3,
      antal_generationer: 2,
      dokumentation_uppdaterad: new Date().toISOString(),
    }
  };
}