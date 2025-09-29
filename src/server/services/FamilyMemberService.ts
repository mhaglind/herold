/**
 * Family Member Service
 * Handles CRUD operations for family members within projects
 */

import { ProjectService } from './ProjectService';
import { SVGRenderingService } from './svg/SVGRenderingService';
import { FamilyMember, FamilyMemberValidation } from '../../shared/types/FamilyMember';
import { FamilyProject } from '../../shared/types/FamilyProject';
import fs from 'fs/promises';
import path from 'path';

export interface CreateFamilyMemberData {
  namn: string;
  kön: 'man' | 'kvinna' | 'other';
  generation: number;
  status?: 'levande' | 'död' | 'okänd';
  anteckningar?: string;
  birthDate?: string;
  deathDate?: string;
  culturalBackground?: string;
  titles?: string[];
  locations?: string[];
}

export interface UpdateFamilyMemberData {
  namn?: string;
  kön?: 'man' | 'kvinna' | 'other';
  generation?: number;
  status?: 'levande' | 'död' | 'okänd';
  anteckningar?: string;
  birthDate?: string;
  deathDate?: string;
  culturalBackground?: string;
  titles?: string[];
  locations?: string[];
}

export interface AddRelationshipData {
  type: 'parent' | 'child' | 'partner';
  relatedPersonId: string;
  notes?: string;
}

export class FamilyMemberService {
  private projectService: ProjectService;
  private svgService: SVGRenderingService;
  private dataDirectory: string;

  constructor(dataDirectory = './data/projects') {
    this.dataDirectory = dataDirectory;
    this.projectService = new ProjectService(dataDirectory);
    this.svgService = new SVGRenderingService();
  }

  /**
   * Get all family members in a project
   */
  async getMembers(projectId: string): Promise<FamilyMember[] | null> {
    const project = await this.projectService.getProject(projectId);
    if (!project) return null;

    return Object.values(project.members);
  }

  /**
   * Get a specific family member
   */
  async getMember(projectId: string, memberId: string): Promise<FamilyMember | null> {
    const project = await this.projectService.getProject(projectId);
    if (!project) return null;

    return project.members[memberId] || null;
  }

  /**
   * Add a new family member to a project
   */
  async addMember(
    projectId: string,
    memberData: CreateFamilyMemberData
  ): Promise<FamilyMember | null> {
    const project = await this.projectService.getProject(projectId);
    if (!project) return null;

    // Generate unique ID for the new member
    const memberId = this.generateMemberId(memberData.namn, project);

    // Create the new family member
    const newMember: FamilyMember = {
      id: memberId,
      namn: memberData.namn,
      kön: memberData.kön,
      generation: memberData.generation,
      föräldrar: [],
      barn: [],
      partner: null,
      status: memberData.status || 'levande',
      anteckningar: memberData.anteckningar || '',
      birthDate: memberData.birthDate,
      deathDate: memberData.deathDate,
      culturalBackground: memberData.culturalBackground as any,
      titles: memberData.titles,
      locations: memberData.locations
    };

    // Validate the new member
    const validationErrors = FamilyMemberValidation.validateMember(newMember);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid family member data: ${validationErrors.join(', ')}`);
    }

    // Add to project
    project.members[memberId] = newMember;

    // Update project metadata
    project.metadata.antal_personer = Object.keys(project.members).length;
    project.metadata.senast_uppdaterad = new Date().toISOString();
    project.metadata.senaste_tillagg = newMember.namn;

    // Recalculate generation count
    const generations = new Set(Object.values(project.members).map(m => m.generation));
    project.metadata.antal_generationer = generations.size;

    // Save the updated project
    await this.saveProject(project);

    return newMember;
  }

  /**
   * Update an existing family member
   */
  async updateMember(
    projectId: string,
    memberId: string,
    updates: UpdateFamilyMemberData
  ): Promise<FamilyMember | null> {
    const project = await this.projectService.getProject(projectId);
    if (!project || !project.members[memberId]) return null;

    const member = project.members[memberId];

    // Apply updates
    if (updates.namn !== undefined) member.namn = updates.namn;
    if (updates.kön !== undefined) member.kön = updates.kön;
    if (updates.generation !== undefined) {
      const oldGeneration = member.generation;
      member.generation = updates.generation;

      // If generation changed, validate consistency with relationships
      const generationErrors = this.validateGenerationConsistency(project, memberId);
      if (generationErrors.length > 0) {
        // Revert the change
        member.generation = oldGeneration;
        throw new Error(`Generation change invalid: ${generationErrors.join(', ')}`);
      }
    }
    if (updates.status !== undefined) member.status = updates.status;
    if (updates.anteckningar !== undefined) member.anteckningar = updates.anteckningar;
    if (updates.birthDate !== undefined) member.birthDate = updates.birthDate;
    if (updates.deathDate !== undefined) member.deathDate = updates.deathDate;
    if (updates.culturalBackground !== undefined) member.culturalBackground = updates.culturalBackground as any;
    if (updates.titles !== undefined) member.titles = updates.titles;
    if (updates.locations !== undefined) member.locations = updates.locations;

    // Validate the updated member
    const validationErrors = FamilyMemberValidation.validateMember(member);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid updated member data: ${validationErrors.join(', ')}`);
    }

    // Update project metadata
    project.metadata.senast_uppdaterad = new Date().toISOString();

    // Recalculate generation count if generation was changed
    if (updates.generation !== undefined) {
      const generations = new Set(Object.values(project.members).map(m => m.generation));
      project.metadata.antal_generationer = generations.size;
    }

    // Save the updated project
    await this.saveProject(project);

    return member;
  }

  /**
   * Remove a family member from a project
   */
  async removeMember(projectId: string, memberId: string): Promise<boolean> {
    const project = await this.projectService.getProject(projectId);
    if (!project || !project.members[memberId]) return false;

    // Prevent removal of main person
    if (project.mainPersonId === memberId) {
      throw new Error('Cannot remove the main person from the family tree');
    }

    const member = project.members[memberId];

    // Remove all relationships involving this member
    this.removeAllRelationships(project, memberId);

    // Remove the member
    delete project.members[memberId];

    // Update relationships array
    project.relationships = project.relationships.filter(rel =>
      rel.person1 !== memberId && rel.person2 !== memberId
    );

    // Update project metadata
    project.metadata.antal_personer = Object.keys(project.members).length;
    project.metadata.senast_uppdaterad = new Date().toISOString();

    // Recalculate generation count
    const generations = new Set(Object.values(project.members).map(m => m.generation));
    project.metadata.antal_generationer = generations.size;

    // Save the updated project
    await this.saveProject(project);

    return true;
  }

  /**
   * Add a relationship between two family members
   */
  async addRelationship(
    projectId: string,
    memberId: string,
    relationshipData: AddRelationshipData
  ): Promise<boolean> {
    const project = await this.projectService.getProject(projectId);
    if (!project || !project.members[memberId] || !project.members[relationshipData.relatedPersonId]) {
      return false;
    }

    const member = project.members[memberId];
    const relatedMember = project.members[relationshipData.relatedPersonId];

    // Validate the relationship
    const validationErrors = this.validateRelationship(
      project,
      memberId,
      relationshipData.relatedPersonId,
      relationshipData.type
    );
    if (validationErrors.length > 0) {
      throw new Error(`Invalid relationship: ${validationErrors.join(', ')}`);
    }

    // Add the relationship (bidirectional)
    switch (relationshipData.type) {
      case 'parent':
        // memberId is parent of relatedPersonId
        if (!member.barn.includes(relationshipData.relatedPersonId)) {
          member.barn.push(relationshipData.relatedPersonId);
        }
        if (!relatedMember.föräldrar.includes(memberId)) {
          relatedMember.föräldrar.push(memberId);
        }
        break;

      case 'child':
        // memberId is child of relatedPersonId
        if (!member.föräldrar.includes(relationshipData.relatedPersonId)) {
          member.föräldrar.push(relationshipData.relatedPersonId);
        }
        if (!relatedMember.barn.includes(memberId)) {
          relatedMember.barn.push(memberId);
        }
        break;

      case 'partner':
        // Set mutual partnership
        member.partner = relationshipData.relatedPersonId;
        relatedMember.partner = memberId;
        break;
    }

    // Add to relationships array
    const relationshipType = relationshipData.type === 'partner' ? 'marriage' : 'parent-child';
    const existingRel = project.relationships.find(rel =>
      (rel.person1 === memberId && rel.person2 === relationshipData.relatedPersonId) ||
      (rel.person1 === relationshipData.relatedPersonId && rel.person2 === memberId)
    );

    if (!existingRel) {
      project.relationships.push({
        type: relationshipType as any,
        person1: memberId,
        person2: relationshipData.relatedPersonId,
        notes: relationshipData.notes
      });
    }

    // Update project metadata
    project.metadata.senast_uppdaterad = new Date().toISOString();

    // Save the updated project
    await this.saveProject(project);

    return true;
  }

  /**
   * Remove a relationship between two family members
   */
  async removeRelationship(
    projectId: string,
    memberId: string,
    relatedPersonId: string,
    relationshipType: 'parent' | 'child' | 'partner'
  ): Promise<boolean> {
    const project = await this.projectService.getProject(projectId);
    if (!project || !project.members[memberId] || !project.members[relatedPersonId]) {
      return false;
    }

    const member = project.members[memberId];
    const relatedMember = project.members[relatedPersonId];

    // Remove the relationship (bidirectional)
    switch (relationshipType) {
      case 'parent':
        member.barn = member.barn.filter(id => id !== relatedPersonId);
        relatedMember.föräldrar = relatedMember.föräldrar.filter(id => id !== memberId);
        break;

      case 'child':
        member.föräldrar = member.föräldrar.filter(id => id !== relatedPersonId);
        relatedMember.barn = relatedMember.barn.filter(id => id !== memberId);
        break;

      case 'partner':
        if (member.partner === relatedPersonId) member.partner = null;
        if (relatedMember.partner === memberId) relatedMember.partner = null;
        break;
    }

    // Remove from relationships array
    project.relationships = project.relationships.filter(rel =>
      !((rel.person1 === memberId && rel.person2 === relatedPersonId) ||
        (rel.person1 === relatedPersonId && rel.person2 === memberId))
    );

    // Update project metadata
    project.metadata.senast_uppdaterad = new Date().toISOString();

    // Save the updated project
    await this.saveProject(project);

    return true;
  }

  /**
   * Validate that a relationship is valid
   */
  private validateRelationship(
    project: FamilyProject,
    personId1: string,
    personId2: string,
    relationshipType: 'parent' | 'child' | 'partner'
  ): string[] {
    const errors: string[] = [];
    const person1 = project.members[personId1];
    const person2 = project.members[personId2];

    // Can't have relationship with self
    if (personId1 === personId2) {
      errors.push('Cannot create relationship with self');
      return errors;
    }

    switch (relationshipType) {
      case 'parent':
      case 'child':
        // Check for circular references
        if (this.wouldCreateCircularReference(project, personId1, personId2, relationshipType)) {
          errors.push('Would create circular parent-child relationship');
        }

        // Check generation consistency
        const parentId = relationshipType === 'parent' ? personId1 : personId2;
        const childId = relationshipType === 'parent' ? personId2 : personId1;
        const parent = project.members[parentId];
        const child = project.members[childId];

        if (parent.generation >= child.generation) {
          errors.push(`Parent generation (${parent.generation}) must be less than child generation (${child.generation})`);
        }
        break;

      case 'partner':
        // Check if either person already has a partner
        if (person1.partner && person1.partner !== personId2) {
          errors.push(`${person1.namn} already has a partner`);
        }
        if (person2.partner && person2.partner !== personId1) {
          errors.push(`${person2.namn} already has a partner`);
        }

        // Partners should generally be in the same generation
        if (Math.abs(person1.generation - person2.generation) > 1) {
          errors.push('Partners should be in similar generations');
        }
        break;
    }

    return errors;
  }

  /**
   * Check if adding a relationship would create a circular reference
   */
  private wouldCreateCircularReference(
    project: FamilyProject,
    personId1: string,
    personId2: string,
    relationshipType: 'parent' | 'child'
  ): boolean {
    const parentId = relationshipType === 'parent' ? personId1 : personId2;
    const childId = relationshipType === 'parent' ? personId2 : personId1;

    // Use BFS to check if childId is already an ancestor of parentId
    const visited = new Set<string>();
    const queue = [childId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const current = project.members[currentId];
      if (!current) continue;

      // If we reach the parent through the child's descendants, it's circular
      if (current.barn.includes(parentId)) {
        return true;
      }

      // Add all children to queue
      queue.push(...current.barn);
    }

    return false;
  }

  /**
   * Validate generation consistency after a generation change
   */
  private validateGenerationConsistency(project: FamilyProject, memberId: string): string[] {
    const errors: string[] = [];
    const member = project.members[memberId];

    // Check that all parents have lower generation numbers
    member.föräldrar.forEach(parentId => {
      const parent = project.members[parentId];
      if (parent && parent.generation >= member.generation) {
        errors.push(`Parent ${parent.namn} (gen ${parent.generation}) must have lower generation than ${member.namn} (gen ${member.generation})`);
      }
    });

    // Check that all children have higher generation numbers
    member.barn.forEach(childId => {
      const child = project.members[childId];
      if (child && child.generation <= member.generation) {
        errors.push(`Child ${child.namn} (gen ${child.generation}) must have higher generation than ${member.namn} (gen ${member.generation})`);
      }
    });

    return errors;
  }

  /**
   * Remove all relationships involving a specific member
   */
  private removeAllRelationships(project: FamilyProject, memberId: string): void {
    const member = project.members[memberId];

    // Remove from all parents' children lists
    member.föräldrar.forEach(parentId => {
      const parent = project.members[parentId];
      if (parent) {
        parent.barn = parent.barn.filter(id => id !== memberId);
      }
    });

    // Remove from all children's parent lists
    member.barn.forEach(childId => {
      const child = project.members[childId];
      if (child) {
        child.föräldrar = child.föräldrar.filter(id => id !== memberId);
      }
    });

    // Remove partner relationship
    if (member.partner) {
      const partner = project.members[member.partner];
      if (partner) {
        partner.partner = null;
      }
    }
  }

  /**
   * Generate a unique ID for a new family member
   */
  private generateMemberId(name: string, project: FamilyProject): string {
    // Convert name to valid ID format
    let baseId = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

    // Ensure it starts with a letter
    if (!baseId || !/^[a-z]/.test(baseId)) {
      baseId = 'person_' + baseId;
    }

    // Ensure minimum length
    if (baseId.length < 2) {
      baseId += '_' + Math.random().toString(36).substring(2, 6);
    }

    // Make it unique by adding numbers if needed
    let id = baseId;
    let counter = 1;
    while (project.members[id]) {
      id = `${baseId}_${counter}`;
      counter++;
    }

    return id;
  }

  /**
   * Save updated project (wrapper around ProjectService)
   */
  private async saveProject(project: FamilyProject): Promise<void> {
    // Ensure directory exists
    try {
      await fs.mkdir(this.dataDirectory, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }

    const filePath = path.join(this.dataDirectory, `${project.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }
}