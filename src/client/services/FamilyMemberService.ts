/**
 * Family Member Service
 * Frontend API client for family member management operations
 */

import { BaseApiClient, API_CONFIG } from './api-config';
import { FamilyMember } from '../../shared/types/FamilyMember';

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

export interface FamilyMemberResponse {
  member: FamilyMember;
  message: string;
  svg?: {
    updated: boolean;
    path?: string;
    error?: string;
  };
}

export interface MembersListResponse {
  members: FamilyMember[];
}

export interface RelationshipResponse {
  message: string;
  timestamp: string;
  svg?: {
    updated: boolean;
    path?: string;
    error?: string;
  };
}

export interface RemoveMemberResponse {
  message: string;
  timestamp: string;
  svg?: {
    updated: boolean;
    path?: string;
    error?: string;
  };
}

export class FamilyMemberService extends BaseApiClient {
  /**
   * Get all family members in a project
   */
  async getMembers(projectId: string): Promise<FamilyMember[]> {
    const response = await this.get<MembersListResponse>(
      API_CONFIG.endpoints.members(projectId)
    );
    return response.members;
  }

  /**
   * Get a specific family member
   */
  async getMember(projectId: string, memberId: string): Promise<FamilyMember> {
    const response = await this.get<{ member: FamilyMember }>(
      `${API_CONFIG.endpoints.members(projectId)}/${memberId}`
    );
    return response.member;
  }

  /**
   * Add a new family member
   */
  async addMember(projectId: string, data: CreateFamilyMemberData): Promise<FamilyMemberResponse> {
    return this.post<FamilyMemberResponse>(
      API_CONFIG.endpoints.members(projectId),
      data
    );
  }

  /**
   * Update a family member
   */
  async updateMember(
    projectId: string,
    memberId: string,
    data: UpdateFamilyMemberData
  ): Promise<FamilyMemberResponse> {
    return this.put<FamilyMemberResponse>(
      `${API_CONFIG.endpoints.members(projectId)}/${memberId}`,
      data
    );
  }

  /**
   * Remove a family member
   */
  async removeMember(projectId: string, memberId: string): Promise<RemoveMemberResponse> {
    return this.delete<RemoveMemberResponse>(
      `${API_CONFIG.endpoints.members(projectId)}/${memberId}`
    );
  }

  /**
   * Add a relationship between two family members
   */
  async addRelationship(
    projectId: string,
    memberId: string,
    relationshipData: AddRelationshipData
  ): Promise<RelationshipResponse> {
    return this.post<RelationshipResponse>(
      `${API_CONFIG.endpoints.members(projectId)}/${memberId}/relationships`,
      relationshipData
    );
  }

  /**
   * Remove a relationship between two family members
   */
  async removeRelationship(
    projectId: string,
    memberId: string,
    relatedPersonId: string,
    type: 'parent' | 'child' | 'partner'
  ): Promise<RelationshipResponse> {
    return this.delete<RelationshipResponse>(
      `${API_CONFIG.endpoints.members(projectId)}/${memberId}/relationships/${relatedPersonId}?type=${type}`
    );
  }
}

// Create singleton instance
export const familyMemberService = new FamilyMemberService();