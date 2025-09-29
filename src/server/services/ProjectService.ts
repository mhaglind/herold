/**
 * Project Management Service
 * Handles CRUD operations for family tree projects with file system storage
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as FamilyProjectTypes from '../../shared/types/FamilyProject';
import type { FamilyProject, ProjectSummary } from '../../shared/types/FamilyProject';

export interface CreateProjectData {
  name: string;
  description: string;
  mainPersonId?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  culturalContext?: string;
}

export class ProjectService {
  private readonly dataDirectory: string;

  constructor(dataDirectory = './data/projects') {
    this.dataDirectory = dataDirectory;
  }

  /**
   * Initialize the data directory if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.dataDirectory, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to initialize data directory: ${error}`);
    }
  }

  /**
   * List all projects with summary information
   */
  async listProjects(): Promise<ProjectSummary[]> {
    try {
      await this.initialize();
      const files = await fs.readdir(this.dataDirectory);
      const projectFiles = files.filter(file => file.endsWith('.json'));

      const summaries: ProjectSummary[] = [];

      for (const file of projectFiles) {
        try {
          const filePath = path.join(this.dataDirectory, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const project: FamilyProject = JSON.parse(data);

          summaries.push({
            id: project.id,
            name: project.name,
            description: project.description,
            memberCount: Object.keys(project.members).length,
            lastModified: project.metadata.senast_uppdaterad
          });
        } catch (error) {
          // Skip invalid project files
          console.warn(`Skipping invalid project file ${file}:`, error);
        }
      }

      // Sort by last modified (newest first)
      return summaries.sort((a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    } catch (error) {
      throw new Error(`Failed to list projects: ${error}`);
    }
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<FamilyProject | null> {
    try {
      const filePath = this.getProjectFilePath(id);
      const data = await fs.readFile(filePath, 'utf-8');
      const project: FamilyProject = JSON.parse(data);

      // Validate the project structure
      const errors = FamilyProjectTypes.ProjectValidation.validateProject(project);
      if (errors.length > 0) {
        throw new Error(`Invalid project data: ${errors.join(', ')}`);
      }

      return project;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null; // Project not found
      }
      throw new Error(`Failed to get project ${id}: ${error.message}`);
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<FamilyProject> {
    try {
      await this.initialize();

      // Generate project ID from name, handling duplicates
      let id = this.generateProjectId(data.name);

      // Check if project already exists and generate unique ID if needed
      let existingProject = await this.getProject(id);
      let counter = 1;
      while (existingProject) {
        id = this.generateProjectId(data.name) + '-' + counter;
        existingProject = await this.getProject(id);
        counter++;
      }

      // Create main person if not provided
      const mainPersonId = data.mainPersonId || 'huvudperson';

      // Create the project structure
      const project: FamilyProject = {
        id,
        name: data.name,
        description: data.description,
        mainPersonId,
        members: {
          [mainPersonId]: {
            id: mainPersonId,
            namn: 'Namnlös Person',
            kön: 'other',
            generation: 0,
            föräldrar: [],
            barn: [],
            partner: null,
            status: 'levande',
            anteckningar: 'Huvudperson i släktträdet - ändra namn och detaljer'
          }
        },
        relationships: [],
        settings: {
          font: {
            family: 'Dancing Script',
            fallbacks: ['Lucida Handwriting', 'Apple Chancery', 'cursive', 'serif'],
            size: {
              title: 32,
              names: 16,
              relationships: 10,
            }
          },
          orientation: 'portrait',
          theme: {
            name: 'parchment',
            colors: {
              background: '#f4f1e8',
              text: '#5a4a3a',
              lines: '#8b7355',
              accent: '#d4c4a8',
            },
            decorations: {
              showBorder: true,
              showCornerDecorations: true,
              showShadows: true,
            }
          },
          layout: {
            algorithm: 'family-groups-separated',
            spacing: 'comfortable',
            showGenerationLabels: true,
            showMarriageSymbols: true,
            centerMainPerson: true,
          },
          dimensions: {
            width: 595, // A4 portrait width in pixels
            height: 842, // A4 portrait height in pixels
          },
          formats: ['svg', 'png'],
          quality: 300,
        },
        metadata: {
          skapad: new Date().toISOString(),
          senast_uppdaterad: new Date().toISOString(),
          version: '1.0.0',
          struktur_version: '2.0.0',
          antal_personer: 1,
          antal_generationer: 1,
          dokumentation_uppdaterad: new Date().toISOString(),
        }
      };

      // Validate the project
      const errors = FamilyProjectTypes.ProjectValidation.validateProject(project);
      if (errors.length > 0) {
        throw new Error(`Invalid project data: ${errors.join(', ')}`);
      }

      // Save to file
      await this.saveProject(project);

      return project;
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: UpdateProjectData): Promise<FamilyProject | null> {
    try {
      const project = await this.getProject(id);
      if (!project) {
        return null;
      }

      // Apply updates
      if (updates.name !== undefined) {
        project.name = updates.name;
      }
      if (updates.description !== undefined) {
        project.description = updates.description;
      }
      if (updates.culturalContext !== undefined) {
        project.culturalContext = updates.culturalContext;
      }

      // Update metadata
      project.metadata.senast_uppdaterad = new Date().toISOString();

      // Validate updated project
      const errors = FamilyProjectTypes.ProjectValidation.validateProject(project);
      if (errors.length > 0) {
        throw new Error(`Invalid project data after update: ${errors.join(', ')}`);
      }

      // Save updated project
      await this.saveProject(project);

      return project;
    } catch (error) {
      throw new Error(`Failed to update project ${id}: ${error}`);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    try {
      const filePath = this.getProjectFilePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return false; // Project not found
      }
      throw new Error(`Failed to delete project ${id}: ${error.message}`);
    }
  }

  /**
   * Save a project to file system
   */
  private async saveProject(project: FamilyProject): Promise<void> {
    const filePath = this.getProjectFilePath(project.id);
    const data = JSON.stringify(project, null, 2);
    await fs.writeFile(filePath, data, 'utf-8');
  }

  /**
   * Get the file path for a project
   */
  private getProjectFilePath(id: string): string {
    return path.join(this.dataDirectory, `${id}.json`);
  }

  /**
   * Generate a valid project ID from name
   */
  private generateProjectId(name: string): string {
    let id = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

    // Ensure it starts with a letter
    if (!id || !/^[a-z]/.test(id)) {
      id = 'project-' + id;
    }

    // Ensure minimum length
    if (id.length < 3) {
      id += '-' + uuidv4().substring(0, 8);
    }

    // Ensure maximum length
    if (id.length > 50) {
      id = id.substring(0, 47) + '-' + uuidv4().substring(0, 2);
    }

    return id;
  }
}