/**
 * Integration tests for real-time SVG updates
 * Tests the complete flow from family member operations to SVG generation
 */

import fs from 'fs/promises';
import path from 'path';
import { FamilyMemberIntegrationService } from '../../src/server/services/FamilyMemberIntegrationService';
import { ProjectService } from '../../src/server/services/ProjectService';
import { FamilyProject } from '../../src/shared/types/FamilyProject';
import { CreateFamilyMemberData } from '../../src/server/services/FamilyMemberService';

// Test data directory
const TEST_DATA_DIR = './data/test-svg-integration';

describe('Real-time SVG Integration', () => {
  let integrationService: FamilyMemberIntegrationService;
  let projectService: ProjectService;
  let testProject: FamilyProject;

  beforeAll(async () => {
    // Initialize services
    integrationService = new FamilyMemberIntegrationService(TEST_DATA_DIR);
    projectService = new ProjectService(TEST_DATA_DIR);
    await projectService.initialize();
  });

  beforeEach(async () => {
    // Create a test project
    testProject = await projectService.createProject({
      name: 'SVG Integration Test Project',
      description: 'Testing real-time SVG updates'
    });
  });

  afterEach(async () => {
    // Clean up test files
    try {
      if (testProject) {
        await projectService.deleteProject(testProject.id);

        // Also clean up any SVG files
        const svgPath = integrationService.getSVGPath(testProject.id);
        try {
          await fs.unlink(svgPath);
        } catch {
          // SVG file might not exist, which is fine
        }
      }
    } catch (error) {
      // Project might not exist, which is fine
    }
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('SVG File Generation', () => {
    it('should not have SVG file initially', async () => {
      const svgExists = await integrationService.svgExists(testProject.id);
      expect(svgExists).toBe(false);
    });

    it('should generate SVG file when adding a family member', async () => {
      const memberData: CreateFamilyMemberData = {
        namn: 'Test Person',
        kön: 'man',
        generation: 1,
        status: 'levande',
        anteckningar: 'Added for SVG test'
      };

      const result = await integrationService.addMember(testProject.id, memberData);

      // Verify the member was added
      expect(result.data).not.toBeNull();
      expect(result.data!.namn).toBe('Test Person');

      // Verify SVG was generated
      expect(result.svgUpdated).toBe(true);
      expect(result.svgPath).toBeDefined();

      // Verify SVG file actually exists
      const svgExists = await integrationService.svgExists(testProject.id);
      expect(svgExists).toBe(true);

      // Verify SVG file has content
      const svgPath = integrationService.getSVGPath(testProject.id);
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('Test Person');
    });

    it('should update SVG file when updating a family member', async () => {
      // First, add a member
      const memberData: CreateFamilyMemberData = {
        namn: 'Original Name',
        kön: 'kvinna',
        generation: 0
      };

      const addResult = await integrationService.addMember(testProject.id, memberData);
      expect(addResult.svgUpdated).toBe(true);

      // Read the original SVG
      const svgPath = integrationService.getSVGPath(testProject.id);
      const originalSvg = await fs.readFile(svgPath, 'utf-8');
      expect(originalSvg).toContain('Original Name');

      // Update the member
      const updateResult = await integrationService.updateMember(
        testProject.id,
        addResult.data!.id,
        { namn: 'Updated Name' }
      );

      // Verify the update
      expect(updateResult.data).not.toBeNull();
      expect(updateResult.data!.namn).toBe('Updated Name');
      expect(updateResult.svgUpdated).toBe(true);

      // Verify SVG was updated
      const updatedSvg = await fs.readFile(svgPath, 'utf-8');
      expect(updatedSvg).toContain('Updated Name');
      expect(updatedSvg).not.toContain('Original Name');
    });

    it('should update SVG file when adding relationships', async () => {
      // Add two members
      const parentData: CreateFamilyMemberData = {
        namn: 'Parent Person',
        kön: 'man',
        generation: 0
      };

      const childData: CreateFamilyMemberData = {
        namn: 'Child Person',
        kön: 'kvinna',
        generation: 1
      };

      const parentResult = await integrationService.addMember(testProject.id, parentData);
      const childResult = await integrationService.addMember(testProject.id, childData);

      // Add parent-child relationship
      const relationshipResult = await integrationService.addRelationship(
        testProject.id,
        parentResult.data!.id,
        {
          type: 'parent',
          relatedPersonId: childResult.data!.id
        }
      );

      // Verify relationship was added and SVG updated
      expect(relationshipResult.data).toBe(true);
      expect(relationshipResult.svgUpdated).toBe(true);

      // Verify SVG contains both people
      const svgPath = integrationService.getSVGPath(testProject.id);
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      expect(svgContent).toContain('Parent Person');
      expect(svgContent).toContain('Child Person');
      // Should contain connection lines
      expect(svgContent).toContain('<path');
    });

    it('should update SVG file when removing a family member', async () => {
      // Add a member
      const memberData: CreateFamilyMemberData = {
        namn: 'To Be Removed',
        kön: 'other',
        generation: 2
      };

      const addResult = await integrationService.addMember(testProject.id, memberData);
      expect(addResult.svgUpdated).toBe(true);

      // Verify member is in SVG
      const svgPath = integrationService.getSVGPath(testProject.id);
      const originalSvg = await fs.readFile(svgPath, 'utf-8');
      expect(originalSvg).toContain('To Be Removed');

      // Remove the member
      const removeResult = await integrationService.removeMember(
        testProject.id,
        addResult.data!.id
      );

      // Verify removal and SVG update
      expect(removeResult.data).toBe(true);
      expect(removeResult.svgUpdated).toBe(true);

      // Verify member is no longer in SVG
      const updatedSvg = await fs.readFile(svgPath, 'utf-8');
      expect(updatedSvg).not.toContain('To Be Removed');
    });
  });

  describe('Manual SVG Regeneration', () => {
    it('should manually regenerate SVG for existing project', async () => {
      // Add some members first
      await integrationService.addMember(testProject.id, {
        namn: 'Person 1',
        kön: 'man',
        generation: 0
      });

      await integrationService.addMember(testProject.id, {
        namn: 'Person 2',
        kön: 'kvinna',
        generation: 1
      });

      // Manually regenerate
      const result = await integrationService.regenerateSVGManually(testProject.id);

      expect(result.data).toBeDefined();
      expect(result.svgUpdated).toBe(true);
      expect(result.svgPath).toBeDefined();

      // Verify SVG file exists and has content
      const svgExists = await integrationService.svgExists(testProject.id);
      expect(svgExists).toBe(true);

      const svgContent = await fs.readFile(result.svgPath!, 'utf-8');
      expect(svgContent).toContain('Person 1');
      expect(svgContent).toContain('Person 2');
    });

    it('should handle manual regeneration for non-existent project', async () => {
      const result = await integrationService.regenerateSVGManually('non-existent-project');

      expect(result.data).toBeNull();
      expect(result.svgUpdated).toBe(false);
      expect(result.error).toBe('Project not found');
    });
  });

  describe('SVG File Operations', () => {
    it('should get correct SVG file path', () => {
      const svgPath = integrationService.getSVGPath(testProject.id);
      expect(svgPath).toContain(testProject.id);
      expect(svgPath).toContain('_family_tree.svg');
      expect(typeof svgPath).toBe('string');
      expect(svgPath.length).toBeGreaterThan(0);
    });

    it('should correctly check SVG file existence', async () => {
      // Should not exist initially
      let exists = await integrationService.svgExists(testProject.id);
      expect(exists).toBe(false);

      // Add a member to generate SVG
      await integrationService.addMember(testProject.id, {
        namn: 'Test Person',
        kön: 'man',
        generation: 0
      });

      // Should exist now
      exists = await integrationService.svgExists(testProject.id);
      expect(exists).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle operations on non-existent projects gracefully', async () => {
      const memberData: CreateFamilyMemberData = {
        namn: 'Test Person',
        kön: 'man',
        generation: 0
      };

      const result = await integrationService.addMember('non-existent', memberData);

      expect(result.data).toBeNull();
      expect(result.svgUpdated).toBe(false);
    });

    it('should handle invalid member data gracefully', async () => {
      const invalidData: CreateFamilyMemberData = {
        namn: '', // Invalid empty name
        kön: 'man',
        generation: 0
      };

      await expect(integrationService.addMember(testProject.id, invalidData))
        .rejects.toThrow('Invalid family member data');
    });
  });
});