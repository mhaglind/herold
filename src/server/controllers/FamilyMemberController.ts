/**
 * Family Member Controller
 * Handles HTTP requests for family member management operations
 */

import { Request, Response } from 'express';
import { FamilyMemberService, CreateFamilyMemberData, UpdateFamilyMemberData, AddRelationshipData } from '../services/FamilyMemberService';

export class FamilyMemberController {
  private familyMemberService: FamilyMemberService;

  constructor(familyMemberService: FamilyMemberService) {
    this.familyMemberService = familyMemberService;
  }

  /**
   * GET /api/projects/:id/members - Get all family members
   */
  async getMembers(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId } = req.params;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const members = await this.familyMemberService.getMembers(projectId);

      if (members === null) {
        res.status(404).json({
          error: 'Not Found',
          message: `Project with ID '${projectId}' not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({ members });
    } catch (error: any) {
      console.error(`Error getting members for project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get family members',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/projects/:id/members/:memberId - Get specific family member
   */
  async getMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId, memberId } = req.params;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!memberId || typeof memberId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Member ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const member = await this.familyMemberService.getMember(projectId, memberId);

      if (member === null) {
        res.status(404).json({
          error: 'Not Found',
          message: `Member with ID '${memberId}' not found in project '${projectId}'`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({ member });
    } catch (error: any) {
      console.error(`Error getting member ${req.params.memberId} from project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to get family member',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/projects/:id/members - Add new family member
   */
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId } = req.params;
      const { namn, kön, generation, status, anteckningar, birthDate, deathDate, culturalBackground, titles, locations } = req.body;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate required fields
      if (!namn || typeof namn !== 'string' || namn.trim().length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'namn (name) is required and must be a non-empty string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!kön || !['man', 'kvinna', 'other'].includes(kön)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'kön (gender) must be one of: man, kvinna, other',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (typeof generation !== 'number') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'generation must be a number',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const memberData: CreateFamilyMemberData = {
        namn: namn.trim(),
        kön,
        generation,
        status: status || 'levande',
        anteckningar: anteckningar || '',
        birthDate,
        deathDate,
        culturalBackground,
        titles: Array.isArray(titles) ? titles : undefined,
        locations: Array.isArray(locations) ? locations : undefined
      };

      const newMember = await this.familyMemberService.addMember(projectId, memberData);

      if (!newMember) {
        res.status(404).json({
          error: 'Not Found',
          message: `Project with ID '${projectId}' not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(201).json({
        member: newMember,
        message: 'Family member added successfully'
      });
    } catch (error: any) {
      console.error(`Error adding member to project ${req.params.id}:`, error);

      if (error.message.includes('Invalid family member data')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to add family member',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * PUT /api/projects/:id/members/:memberId - Update family member
   */
  async updateMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId, memberId } = req.params;
      const { namn, kön, generation, status, anteckningar, birthDate, deathDate, culturalBackground, titles, locations } = req.body;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!memberId || typeof memberId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Member ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate update data
      const updates: UpdateFamilyMemberData = {};

      if (namn !== undefined) {
        if (typeof namn !== 'string' || namn.trim().length === 0) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'namn (name) must be a non-empty string if provided',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.namn = namn.trim();
      }

      if (kön !== undefined) {
        if (!['man', 'kvinna', 'other'].includes(kön)) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'kön (gender) must be one of: man, kvinna, other',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.kön = kön;
      }

      if (generation !== undefined) {
        if (typeof generation !== 'number') {
          res.status(400).json({
            error: 'Bad Request',
            message: 'generation must be a number if provided',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.generation = generation;
      }

      if (status !== undefined) {
        if (!['levande', 'död', 'okänd'].includes(status)) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'status must be one of: levande, död, okänd',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updates.status = status;
      }

      if (anteckningar !== undefined) updates.anteckningar = anteckningar;
      if (birthDate !== undefined) updates.birthDate = birthDate;
      if (deathDate !== undefined) updates.deathDate = deathDate;
      if (culturalBackground !== undefined) updates.culturalBackground = culturalBackground;
      if (Array.isArray(titles)) updates.titles = titles;
      if (Array.isArray(locations)) updates.locations = locations;

      const updatedMember = await this.familyMemberService.updateMember(projectId, memberId, updates);

      if (!updatedMember) {
        res.status(404).json({
          error: 'Not Found',
          message: `Member with ID '${memberId}' not found in project '${projectId}'`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        member: updatedMember,
        message: 'Family member updated successfully'
      });
    } catch (error: any) {
      console.error(`Error updating member ${req.params.memberId} in project ${req.params.id}:`, error);

      if (error.message.includes('Generation change invalid') || error.message.includes('Invalid updated member data')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update family member',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DELETE /api/projects/:id/members/:memberId - Remove family member
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId, memberId } = req.params;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!memberId || typeof memberId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Member ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const removed = await this.familyMemberService.removeMember(projectId, memberId);

      if (!removed) {
        res.status(404).json({
          error: 'Not Found',
          message: `Member with ID '${memberId}' not found in project '${projectId}'`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        message: `Family member '${memberId}' removed successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Error removing member ${req.params.memberId} from project ${req.params.id}:`, error);

      if (error.message.includes('Cannot remove the main person')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to remove family member',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * POST /api/projects/:id/members/:memberId/relationships - Add relationship
   */
  async addRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId, memberId } = req.params;
      const { type, relatedPersonId, notes } = req.body;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!memberId || typeof memberId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Member ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!type || !['parent', 'child', 'partner'].includes(type)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'type must be one of: parent, child, partner',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!relatedPersonId || typeof relatedPersonId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'relatedPersonId is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const relationshipData: AddRelationshipData = {
        type,
        relatedPersonId,
        notes
      };

      const success = await this.familyMemberService.addRelationship(projectId, memberId, relationshipData);

      if (!success) {
        res.status(404).json({
          error: 'Not Found',
          message: `Member with ID '${memberId}' or '${relatedPersonId}' not found in project '${projectId}'`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        message: `Relationship added successfully: ${memberId} is ${type} of ${relatedPersonId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Error adding relationship for member ${req.params.memberId} in project ${req.params.id}:`, error);

      if (error.message.includes('Invalid relationship')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to add relationship',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * DELETE /api/projects/:id/members/:memberId/relationships/:relatedPersonId - Remove relationship
   */
  async removeRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { id: projectId, memberId, relatedPersonId } = req.params;
      const { type } = req.query;

      if (!projectId || typeof projectId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!memberId || typeof memberId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Member ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!relatedPersonId || typeof relatedPersonId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Related person ID is required and must be a string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!type || !['parent', 'child', 'partner'].includes(type as string)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'type query parameter must be one of: parent, child, partner',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await this.familyMemberService.removeRelationship(
        projectId,
        memberId,
        relatedPersonId,
        type as 'parent' | 'child' | 'partner'
      );

      if (!success) {
        res.status(404).json({
          error: 'Not Found',
          message: `Member with ID '${memberId}' or '${relatedPersonId}' not found in project '${projectId}'`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        message: `Relationship removed successfully: ${memberId} is no longer ${type} of ${relatedPersonId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Error removing relationship for member ${req.params.memberId} in project ${req.params.id}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Failed to remove relationship',
        timestamp: new Date().toISOString(),
      });
    }
  }
}