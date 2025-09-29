/**
 * Family Member data model for Herold application
 * Based on existing Halling family tree structure
 */

export type Gender = 'man' | 'kvinna' | 'other';
export type PersonStatus = 'levande' | 'död' | 'okänd';
export type CulturalTradition = 'nordic-dale' | 'sindarin-elvish' | 'bri-folk' | 'geographic' | 'other';

/**
 * Core family member interface
 */
export interface FamilyMember {
  id: string;
  namn: string; // Full name including titles and geographic identifiers
  kön: Gender;
  generation: number; // Can be fractional for intermediate generations
  föräldrar: string[]; // Array of parent IDs (usually 0-2 parents)
  barn: string[]; // Array of children IDs
  partner: string | null; // Current partner/spouse ID
  status: PersonStatus;
  anteckningar: string; // Notes about the person, cultural background, etc.

  // Optional fields
  birthDate?: string; // ISO date string
  deathDate?: string; // ISO date string
  culturalBackground?: CulturalTradition;
  titles?: string[]; // Additional titles or honors
  locations?: string[]; // Associated places or territories
}

/**
 * Relationship types for explicit relationship tracking
 */
export type RelationshipType = 'marriage' | 'parent-child' | 'sibling';
export type MarriageStatus = 'gift' | 'skild' | 'änka/änkling';

/**
 * Explicit relationship record
 */
export interface Relationship {
  type: RelationshipType;
  person1: string;
  person2: string;
  status?: MarriageStatus; // Only for marriage relationships
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
}

/**
 * Family member with computed relationships for easier UI handling
 */
export interface EnhancedFamilyMember extends FamilyMember {
  // Computed fields for UI convenience
  parents?: FamilyMember[];
  children?: FamilyMember[];
  spouse?: FamilyMember;
  siblings?: FamilyMember[];

  // Generation context
  generationLevel?: number; // Absolute generation level for layout
  familyGroup?: string; // Family unit identifier for layout
}

/**
 * Validation utilities for family members
 */
export const FamilyMemberValidation = {
  isValidId: (id: string): boolean => {
    return /^[a-z][a-z0-9_]*$/.test(id) && id.length >= 2;
  },

  isValidGeneration: (generation: number): boolean => {
    return Number.isFinite(generation) && generation >= -10 && generation <= 10;
  },

  validateMember: (member: Partial<FamilyMember>): string[] => {
    const errors: string[] = [];

    if (!member.id) {
      errors.push('ID is required');
    } else if (!FamilyMemberValidation.isValidId(member.id)) {
      errors.push('ID must be lowercase alphanumeric with underscores, starting with letter');
    }

    if (!member.namn || member.namn.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!member.kön || !['man', 'kvinna', 'other'].includes(member.kön)) {
      errors.push('Valid gender is required');
    }

    if (typeof member.generation !== 'number' || !FamilyMemberValidation.isValidGeneration(member.generation)) {
      errors.push('Generation must be a number between -10 and 10');
    }

    if (!member.status || !['levande', 'död', 'okänd'].includes(member.status)) {
      errors.push('Valid status is required');
    }

    return errors;
  }
};