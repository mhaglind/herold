/**
 * Family Member Integration Service
 * Provides family member operations with automatic SVG regeneration
 */

import { FamilyMemberService, CreateFamilyMemberData, UpdateFamilyMemberData, AddRelationshipData } from './FamilyMemberService';
import { SVGRenderingService } from './svg/SVGRenderingService';
import { ProjectService } from './ProjectService';
import { FamilyMember } from '../../shared/types/FamilyMember';
import fs from 'fs/promises';
import path from 'path';

export interface FamilyMemberOperationResult<T> {
  data: T;
  svgUpdated: boolean;
  svgPath?: string;
  error?: string;
}

export class FamilyMemberIntegrationService {
  private familyMemberService: FamilyMemberService;
  private svgRenderingService: SVGRenderingService;
  private projectService: ProjectService;
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
    this.familyMemberService = new FamilyMemberService(dataDir);
    this.svgRenderingService = new SVGRenderingService();
    this.projectService = new ProjectService(dataDir);
  }

  /**
   * Add a family member and regenerate SVG
   */
  async addMember(
    projectId: string,
    memberData: CreateFamilyMemberData
  ): Promise<FamilyMemberOperationResult<FamilyMember | null>> {
    try {
      const newMember = await this.familyMemberService.addMember(projectId, memberData);

      if (!newMember) {
        return { data: null, svgUpdated: false };
      }

      const svgResult = await this.regenerateSVG(projectId);

      return {
        data: newMember,
        svgUpdated: svgResult.success,
        svgPath: svgResult.path,
        error: svgResult.error
      };
    } catch (error: any) {
      throw error; // Re-throw to maintain existing error handling
    }
  }

  /**
   * Update a family member and regenerate SVG
   */
  async updateMember(
    projectId: string,
    memberId: string,
    updates: UpdateFamilyMemberData
  ): Promise<FamilyMemberOperationResult<FamilyMember | null>> {
    try {
      const updatedMember = await this.familyMemberService.updateMember(projectId, memberId, updates);

      if (!updatedMember) {
        return { data: null, svgUpdated: false };
      }

      const svgResult = await this.regenerateSVG(projectId);

      return {
        data: updatedMember,
        svgUpdated: svgResult.success,
        svgPath: svgResult.path,
        error: svgResult.error
      };
    } catch (error: any) {
      throw error; // Re-throw to maintain existing error handling
    }
  }

  /**
   * Remove a family member and regenerate SVG
   */
  async removeMember(
    projectId: string,
    memberId: string
  ): Promise<FamilyMemberOperationResult<boolean>> {
    try {
      const removed = await this.familyMemberService.removeMember(projectId, memberId);

      if (!removed) {
        return { data: false, svgUpdated: false };
      }

      const svgResult = await this.regenerateSVG(projectId);

      return {
        data: true,
        svgUpdated: svgResult.success,
        svgPath: svgResult.path,
        error: svgResult.error
      };
    } catch (error: any) {
      throw error; // Re-throw to maintain existing error handling
    }
  }

  /**
   * Add a relationship and regenerate SVG
   */
  async addRelationship(
    projectId: string,
    memberId: string,
    relationshipData: AddRelationshipData
  ): Promise<FamilyMemberOperationResult<boolean>> {
    try {
      const success = await this.familyMemberService.addRelationship(projectId, memberId, relationshipData);

      if (!success) {
        return { data: false, svgUpdated: false };
      }

      const svgResult = await this.regenerateSVG(projectId);

      return {
        data: true,
        svgUpdated: svgResult.success,
        svgPath: svgResult.path,
        error: svgResult.error
      };
    } catch (error: any) {
      throw error; // Re-throw to maintain existing error handling
    }
  }

  /**
   * Remove a relationship and regenerate SVG
   */
  async removeRelationship(
    projectId: string,
    memberId: string,
    relatedPersonId: string,
    relationshipType: 'parent' | 'child' | 'partner'
  ): Promise<FamilyMemberOperationResult<boolean>> {
    try {
      const success = await this.familyMemberService.removeRelationship(
        projectId,
        memberId,
        relatedPersonId,
        relationshipType
      );

      if (!success) {
        return { data: false, svgUpdated: false };
      }

      const svgResult = await this.regenerateSVG(projectId);

      return {
        data: true,
        svgUpdated: svgResult.success,
        svgPath: svgResult.path,
        error: svgResult.error
      };
    } catch (error: any) {
      throw error; // Re-throw to maintain existing error handling
    }
  }

  /**
   * Get all members (no SVG regeneration needed)
   */
  async getMembers(projectId: string): Promise<FamilyMember[] | null> {
    return await this.familyMemberService.getMembers(projectId);
  }

  /**
   * Get a specific member (no SVG regeneration needed)
   */
  async getMember(projectId: string, memberId: string): Promise<FamilyMember | null> {
    return await this.familyMemberService.getMember(projectId, memberId);
  }

  /**
   * Manually regenerate SVG for a project
   */
  async regenerateSVGManually(projectId: string): Promise<FamilyMemberOperationResult<string | null>> {
    const svgResult = await this.regenerateSVG(projectId);

    return {
      data: svgResult.success ? svgResult.path || null : null,
      svgUpdated: svgResult.success,
      svgPath: svgResult.path,
      error: svgResult.error
    };
  }

  /**
   * Get the current SVG file path for a project
   */
  getSVGPath(projectId: string): string {
    return path.join(this.dataDir, `${projectId}_family_tree.svg`);
  }

  /**
   * Check if SVG file exists for a project
   */
  async svgExists(projectId: string): Promise<boolean> {
    try {
      const svgPath = this.getSVGPath(projectId);
      await fs.access(svgPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Private method to regenerate SVG
   */
  private async regenerateSVG(projectId: string): Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }> {
    try {
      // Get the updated project
      const project = await this.projectService.getProject(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      // Render the SVG
      const renderResult = await this.svgRenderingService.renderFamilyTree(project);

      // Save the SVG to file
      const svgPath = this.getSVGPath(projectId);
      await fs.writeFile(svgPath, renderResult.svg, 'utf-8');

      return { success: true, path: svgPath };
    } catch (error: any) {
      console.error(`Failed to regenerate SVG for project ${projectId}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to regenerate SVG'
      };
    }
  }
}