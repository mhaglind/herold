/**
 * Tests for Project Management API
 */

import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { ProjectService } from '../../src/server/services/ProjectService';
import { FamilyProject } from '../../src/shared/types/FamilyProject';

// Mock data directory for tests
const TEST_DATA_DIR = './data/test-projects';

describe('Project Management API', () => {
  let projectService: ProjectService;

  beforeAll(async () => {
    projectService = new ProjectService(TEST_DATA_DIR);
    await projectService.initialize();
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      const files = await fs.readdir(TEST_DATA_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(TEST_DATA_DIR, file));
        }
      }
    } catch (error) {
      // Directory doesn't exist or is empty, which is fine
    }
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.rmdir(TEST_DATA_DIR);
    } catch (error) {
      // Directory doesn't exist, which is fine
    }
  });

  describe('ProjectService', () => {
    describe('listProjects', () => {
      it('should return empty array when no projects exist', async () => {
        const projects = await projectService.listProjects();
        expect(projects).toEqual([]);
      });

      it('should list existing projects with summary information', async () => {
        // Create a test project
        const project1 = await projectService.createProject({
          name: 'Test Family',
          description: 'A test family tree'
        });

        const projects = await projectService.listProjects();
        expect(projects).toHaveLength(1);
        expect(projects[0]).toEqual({
          id: project1.id,
          name: 'Test Family',
          description: 'A test family tree',
          memberCount: 1,
          lastModified: project1.metadata.senast_uppdaterad
        });
      });
    });

    describe('createProject', () => {
      it('should create a new project with valid data', async () => {
        const projectData = {
          name: 'Huset Halling',
          description: 'Släktträd för rollspelskampanj'
        };

        const project = await projectService.createProject(projectData);

        expect(project.id).toBe('huset-halling');
        expect(project.name).toBe('Huset Halling');
        expect(project.description).toBe('Släktträd för rollspelskampanj');
        expect(project.mainPersonId).toBe('huvudperson');
        expect(project.members).toHaveProperty('huvudperson');
        expect(project.metadata.antal_personer).toBe(1);
      });

      it('should generate unique IDs for projects with same name', async () => {
        await projectService.createProject({
          name: 'Test Project',
          description: 'First project'
        });

        // This should not throw because the service should handle duplicate names
        const project2 = await projectService.createProject({
          name: 'Test Project',
          description: 'Second project'
        });

        expect(project2.id).not.toBe('test-project');
        expect(project2.id).toMatch(/^test-project-/);
      });

      it('should create project with custom main person ID', async () => {
        const project = await projectService.createProject({
          name: 'Custom Main Person',
          description: 'Test project with custom main person',
          mainPersonId: 'halvard'
        });

        expect(project.mainPersonId).toBe('halvard');
        expect(project.members).toHaveProperty('halvard');
      });
    });

    describe('getProject', () => {
      it('should return null for non-existent project', async () => {
        const project = await projectService.getProject('non-existent');
        expect(project).toBeNull();
      });

      it('should return project for existing ID', async () => {
        const created = await projectService.createProject({
          name: 'Test Project',
          description: 'Test description'
        });

        const retrieved = await projectService.getProject(created.id);
        expect(retrieved).toEqual(created);
      });
    });

    describe('updateProject', () => {
      it('should return null for non-existent project', async () => {
        const result = await projectService.updateProject('non-existent', {
          name: 'New Name'
        });
        expect(result).toBeNull();
      });

      it('should update project name and description', async () => {
        const project = await projectService.createProject({
          name: 'Original Name',
          description: 'Original description'
        });

        // Add a small delay to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));

        const updated = await projectService.updateProject(project.id, {
          name: 'Updated Name',
          description: 'Updated description'
        });

        expect(updated).not.toBeNull();
        expect(updated!.name).toBe('Updated Name');
        expect(updated!.description).toBe('Updated description');
        expect(updated!.metadata.senast_uppdaterad).not.toBe(project.metadata.senast_uppdaterad);
      });

      it('should update only specified fields', async () => {
        const project = await projectService.createProject({
          name: 'Original Name',
          description: 'Original description'
        });

        const updated = await projectService.updateProject(project.id, {
          name: 'Updated Name'
          // description not provided
        });

        expect(updated!.name).toBe('Updated Name');
        expect(updated!.description).toBe('Original description');
      });
    });

    describe('deleteProject', () => {
      it('should return false for non-existent project', async () => {
        const result = await projectService.deleteProject('non-existent');
        expect(result).toBe(false);
      });

      it('should delete existing project and return true', async () => {
        const project = await projectService.createProject({
          name: 'To Be Deleted',
          description: 'This will be deleted'
        });

        const deleted = await projectService.deleteProject(project.id);
        expect(deleted).toBe(true);

        // Verify project is actually deleted
        const retrieved = await projectService.getProject(project.id);
        expect(retrieved).toBeNull();
      });
    });

    describe('generateProjectId', () => {
      it('should generate valid project IDs', async () => {
        const testCases = [
          { input: 'Simple Name', expected: 'simple-name' },
          { input: 'Name with Special!@# Characters', expected: 'name-with-special-characters' },
          { input: 'Multiple   Spaces', expected: 'multiple-spaces' },
          { input: '123 Starting with number', expected: 'project-123-starting-with-number' },
          { input: 'åäö Swedish Characters éèê', expected: 'project-swedish-characters' }
        ];

        for (const testCase of testCases) {
          const project = await projectService.createProject({
            name: testCase.input,
            description: 'Test'
          });

          expect(project.id).toMatch(/^[a-z][a-z0-9-]*$/);
          expect(project.id.length).toBeGreaterThanOrEqual(3);
          expect(project.id.length).toBeLessThanOrEqual(50);
        }
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate project structure on creation', async () => {
      const project = await projectService.createProject({
        name: 'Validation Test',
        description: 'Testing validation'
      });

      // Check that all required fields are present
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('mainPersonId');
      expect(project).toHaveProperty('members');
      expect(project).toHaveProperty('relationships');
      expect(project).toHaveProperty('settings');
      expect(project).toHaveProperty('metadata');

      // Check that settings have default values
      expect(project.settings.font.family).toBe('Dancing Script');
      expect(project.settings.orientation).toBe('portrait');
      expect(project.settings.theme.name).toBe('parchment');
      expect(project.settings.layout.algorithm).toBe('family-groups-separated');
    });

    it('should create valid main person', async () => {
      const project = await projectService.createProject({
        name: 'Main Person Test',
        description: 'Testing main person creation'
      });

      const mainPerson = project.members[project.mainPersonId];
      expect(mainPerson).toBeDefined();
      expect(mainPerson.id).toBe(project.mainPersonId);
      expect(mainPerson.namn).toBe('Namnlös Person');
      expect(mainPerson.kön).toBe('other');
      expect(mainPerson.generation).toBe(0);
      expect(mainPerson.föräldrar).toEqual([]);
      expect(mainPerson.barn).toEqual([]);
      expect(mainPerson.partner).toBeNull();
      expect(mainPerson.status).toBe('levande');
    });
  });
});