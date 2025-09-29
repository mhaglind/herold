/**
 * Project Service
 * Frontend API client for project management operations
 */

import { BaseApiClient, API_CONFIG } from './api-config';
import { FamilyProject } from '../../shared/types/FamilyProject';

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

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastModified: string;
}

export interface CreateProjectResponse {
  project: FamilyProject;
  message: string;
}

export interface UpdateProjectResponse {
  project: FamilyProject;
  message: string;
}

export interface ProjectListResponse {
  projects: ProjectSummary[];
  total: number;
}

export class ProjectService extends BaseApiClient {
  /**
   * Get list of all projects
   */
  async getProjects(): Promise<ProjectSummary[]> {
    const response = await this.get<ProjectListResponse>(API_CONFIG.endpoints.projects);
    return response.projects;
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<FamilyProject> {
    return this.get<FamilyProject>(`${API_CONFIG.endpoints.projects}/${projectId}`);
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<FamilyProject> {
    const response = await this.post<CreateProjectResponse>(
      API_CONFIG.endpoints.projects,
      data
    );
    return response.project;
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, data: UpdateProjectData): Promise<FamilyProject> {
    const response = await this.put<UpdateProjectResponse>(
      `${API_CONFIG.endpoints.projects}/${projectId}`,
      data
    );
    return response.project;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.delete(`${API_CONFIG.endpoints.projects}/${projectId}`);
  }

  /**
   * Check if server is healthy
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    return this.get(API_CONFIG.endpoints.health);
  }
}

// Create singleton instance
export const projectService = new ProjectService();