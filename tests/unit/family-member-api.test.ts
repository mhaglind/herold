/**
 * Tests for Family Member Management API
 */

import fs from 'fs/promises';
import path from 'path';
import { FamilyMemberService, CreateFamilyMemberData, UpdateFamilyMemberData, AddRelationshipData } from '../../src/server/services/FamilyMemberService';
import { ProjectService } from '../../src/server/services/ProjectService';
import { FamilyProject } from '../../src/shared/types/FamilyProject';
import { FamilyMember } from '../../src/shared/types/FamilyMember';

// Mock data directory for tests
const TEST_DATA_DIR = './data/test-family-members';

describe('Family Member Management API', () => {
  let familyMemberService: FamilyMemberService;
  let projectService: ProjectService;
  let testProject: FamilyProject;

  beforeAll(async () => {
    familyMemberService = new FamilyMemberService(TEST_DATA_DIR);
    projectService = new ProjectService(TEST_DATA_DIR);
    await projectService.initialize();
  });

  beforeEach(async () => {
    // Create a test project with a basic family structure
    testProject = await projectService.createProject({
      name: 'Test Family for Member Management',
      description: 'Test project for family member operations'
    });

    // Add some initial family members for testing relationships
    // Use proper generation hierarchy: parents (gen 0), child (gen 1)
    const father: FamilyMember = {
      id: 'father',
      namn: 'Test Father',
      kön: 'man',
      generation: 0,
      föräldrar: [],
      barn: [],
      partner: null,
      status: 'levande',
      anteckningar: 'Test father for relationship testing'
    };

    const mother: FamilyMember = {
      id: 'mother',
      namn: 'Test Mother',
      kön: 'kvinna',
      generation: 0,
      föräldrar: [],
      barn: [],
      partner: null,
      status: 'levande',
      anteckningar: 'Test mother for relationship testing'
    };

    // Update the default huvudperson to be generation 1 (child generation)
    testProject.members.huvudperson.generation = 1;

    testProject.members['father'] = father;
    testProject.members['mother'] = mother;
    testProject.metadata.antal_personer = Object.keys(testProject.members).length;

    // Save updated project
    const filePath = path.join(TEST_DATA_DIR, `${testProject.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(testProject, null, 2), 'utf-8');
  });

  afterEach(async () => {
    // Clean up test files after each test
    try {
      if (testProject) {
        await projectService.deleteProject(testProject.id);
      }
    } catch (error) {
      // Project might not exist, which is fine
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

  describe('FamilyMemberService', () => {
    describe('getMembers', () => {
      it('should return all family members in a project', async () => {
        const members = await familyMemberService.getMembers(testProject.id);

        expect(members).not.toBeNull();
        expect(members).toHaveLength(3); // huvudperson + father + mother
        expect(members!.some(m => m.id === 'huvudperson')).toBe(true);
        expect(members!.some(m => m.id === 'father')).toBe(true);
        expect(members!.some(m => m.id === 'mother')).toBe(true);
      });

      it('should return null for non-existent project', async () => {
        const members = await familyMemberService.getMembers('non-existent');
        expect(members).toBeNull();
      });
    });

    describe('getMember', () => {
      it('should return specific family member', async () => {
        const member = await familyMemberService.getMember(testProject.id, 'father');

        expect(member).not.toBeNull();
        expect(member!.id).toBe('father');
        expect(member!.namn).toBe('Test Father');
        expect(member!.kön).toBe('man');
      });

      it('should return null for non-existent member', async () => {
        const member = await familyMemberService.getMember(testProject.id, 'non-existent');
        expect(member).toBeNull();
      });

      it('should return null for non-existent project', async () => {
        const member = await familyMemberService.getMember('non-existent', 'father');
        expect(member).toBeNull();
      });
    });

    describe('addMember', () => {
      it('should add a new family member', async () => {
        const memberData: CreateFamilyMemberData = {
          namn: 'New Child',
          kön: 'other',
          generation: 1,
          status: 'levande',
          anteckningar: 'A new child member'
        };

        const newMember = await familyMemberService.addMember(testProject.id, memberData);

        expect(newMember).not.toBeNull();
        expect(newMember!.namn).toBe('New Child');
        expect(newMember!.kön).toBe('other');
        expect(newMember!.generation).toBe(1);
        expect(newMember!.id).toMatch(/^new_child/);

        // Verify it was actually saved
        const savedMember = await familyMemberService.getMember(testProject.id, newMember!.id);
        expect(savedMember).toEqual(newMember);
      });

      it('should generate unique IDs for members with same name', async () => {
        const memberData1: CreateFamilyMemberData = {
          namn: 'Same Name',
          kön: 'man',
          generation: 1
        };

        const memberData2: CreateFamilyMemberData = {
          namn: 'Same Name',
          kön: 'kvinna',
          generation: 1
        };

        const member1 = await familyMemberService.addMember(testProject.id, memberData1);
        const member2 = await familyMemberService.addMember(testProject.id, memberData2);

        expect(member1!.id).not.toBe(member2!.id);
        expect(member1!.id).toMatch(/^same_name/);
        expect(member2!.id).toMatch(/^same_name_\d+/);
      });

      it('should reject invalid member data', async () => {
        const invalidData: CreateFamilyMemberData = {
          namn: '', // Empty name
          kön: 'man',
          generation: 1
        };

        await expect(familyMemberService.addMember(testProject.id, invalidData))
          .rejects.toThrow('Invalid family member data');
      });

      it('should return null for non-existent project', async () => {
        const memberData: CreateFamilyMemberData = {
          namn: 'New Person',
          kön: 'other',
          generation: 0
        };

        const result = await familyMemberService.addMember('non-existent', memberData);
        expect(result).toBeNull();
      });
    });

    describe('updateMember', () => {
      it('should update member basic information', async () => {
        const updates: UpdateFamilyMemberData = {
          namn: 'Updated Father Name',
          anteckningar: 'Updated notes about father'
        };

        const updatedMember = await familyMemberService.updateMember(testProject.id, 'father', updates);

        expect(updatedMember).not.toBeNull();
        expect(updatedMember!.namn).toBe('Updated Father Name');
        expect(updatedMember!.anteckningar).toBe('Updated notes about father');
        expect(updatedMember!.kön).toBe('man'); // Unchanged
        expect(updatedMember!.generation).toBe(0); // Unchanged
      });

      it('should update member generation if valid', async () => {
        const updates: UpdateFamilyMemberData = {
          generation: -1 // Moving to older generation
        };

        const updatedMember = await familyMemberService.updateMember(testProject.id, 'father', updates);

        expect(updatedMember).not.toBeNull();
        expect(updatedMember!.generation).toBe(-1);
      });

      it('should reject generation changes that violate relationships', async () => {
        // First, create a parent-child relationship
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'huvudperson'
        });

        // Try to update father's generation to be equal to child's (invalid)
        const updates: UpdateFamilyMemberData = {
          generation: 1 // Same as huvudperson (which is generation 1)
        };

        await expect(familyMemberService.updateMember(testProject.id, 'father', updates))
          .rejects.toThrow('Generation change invalid');
      });

      it('should return null for non-existent member', async () => {
        const updates: UpdateFamilyMemberData = {
          namn: 'New Name'
        };

        const result = await familyMemberService.updateMember(testProject.id, 'non-existent', updates);
        expect(result).toBeNull();
      });
    });

    describe('removeMember', () => {
      it('should remove a family member and all relationships', async () => {
        // First add a relationship
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'partner',
          relatedPersonId: 'mother'
        });

        // Verify relationship exists
        let fatherMember = await familyMemberService.getMember(testProject.id, 'father');
        let motherMember = await familyMemberService.getMember(testProject.id, 'mother');
        expect(fatherMember!.partner).toBe('mother');
        expect(motherMember!.partner).toBe('father');

        // Remove father
        const removed = await familyMemberService.removeMember(testProject.id, 'father');
        expect(removed).toBe(true);

        // Verify father is gone
        const removedMember = await familyMemberService.getMember(testProject.id, 'father');
        expect(removedMember).toBeNull();

        // Verify mother's relationship was cleaned up
        motherMember = await familyMemberService.getMember(testProject.id, 'mother');
        expect(motherMember!.partner).toBeNull();
      });

      it('should not allow removal of main person', async () => {
        await expect(familyMemberService.removeMember(testProject.id, testProject.mainPersonId))
          .rejects.toThrow('Cannot remove the main person');
      });

      it('should return false for non-existent member', async () => {
        const result = await familyMemberService.removeMember(testProject.id, 'non-existent');
        expect(result).toBe(false);
      });
    });

    describe('addRelationship', () => {
      it('should add parent-child relationship', async () => {
        const success = await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'huvudperson'
        });

        expect(success).toBe(true);

        // Verify bidirectional relationship
        const father = await familyMemberService.getMember(testProject.id, 'father');
        const child = await familyMemberService.getMember(testProject.id, 'huvudperson');

        expect(father!.barn).toContain('huvudperson');
        expect(child!.föräldrar).toContain('father');
      });

      it('should add child-parent relationship', async () => {
        const success = await familyMemberService.addRelationship(testProject.id, 'huvudperson', {
          type: 'child',
          relatedPersonId: 'mother'
        });

        expect(success).toBe(true);

        // Verify bidirectional relationship
        const child = await familyMemberService.getMember(testProject.id, 'huvudperson');
        const mother = await familyMemberService.getMember(testProject.id, 'mother');

        expect(child!.föräldrar).toContain('mother');
        expect(mother!.barn).toContain('huvudperson');
      });

      it('should add partner relationship', async () => {
        const success = await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'partner',
          relatedPersonId: 'mother'
        });

        expect(success).toBe(true);

        // Verify bidirectional relationship
        const father = await familyMemberService.getMember(testProject.id, 'father');
        const mother = await familyMemberService.getMember(testProject.id, 'mother');

        expect(father!.partner).toBe('mother');
        expect(mother!.partner).toBe('father');
      });

      it('should reject invalid relationships', async () => {
        // Try to make someone their own parent
        await expect(familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'father'
        })).rejects.toThrow('Cannot create relationship with self');
      });

      it('should reject relationships that violate generation rules', async () => {
        // Try to make child a parent of their parent (would violate generation order)
        await expect(familyMemberService.addRelationship(testProject.id, 'huvudperson', {
          type: 'parent',
          relatedPersonId: 'father'
        })).rejects.toThrow('Parent generation');
      });

      it('should prevent multiple partners', async () => {
        // First, establish one partnership
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'partner',
          relatedPersonId: 'mother'
        });

        // Add a third person
        await familyMemberService.addMember(testProject.id, {
          namn: 'Third Person',
          kön: 'other',
          generation: 0
        });

        // Try to add father as partner to third person (should fail)
        await expect(familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'partner',
          relatedPersonId: 'third_person'
        })).rejects.toThrow('already has a partner');
      });
    });

    describe('removeRelationship', () => {
      beforeEach(async () => {
        // Set up some relationships for testing removal
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'partner',
          relatedPersonId: 'mother'
        });
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'huvudperson'
        });
      });

      it('should remove parent-child relationship', async () => {
        const success = await familyMemberService.removeRelationship(
          testProject.id, 'father', 'huvudperson', 'parent'
        );

        expect(success).toBe(true);

        // Verify relationship was removed bidirectionally
        const father = await familyMemberService.getMember(testProject.id, 'father');
        const child = await familyMemberService.getMember(testProject.id, 'huvudperson');

        expect(father!.barn).not.toContain('huvudperson');
        expect(child!.föräldrar).not.toContain('father');
      });

      it('should remove partner relationship', async () => {
        const success = await familyMemberService.removeRelationship(
          testProject.id, 'father', 'mother', 'partner'
        );

        expect(success).toBe(true);

        // Verify relationship was removed bidirectionally
        const father = await familyMemberService.getMember(testProject.id, 'father');
        const mother = await familyMemberService.getMember(testProject.id, 'mother');

        expect(father!.partner).toBeNull();
        expect(mother!.partner).toBeNull();
      });

      it('should return false for non-existent members', async () => {
        const success = await familyMemberService.removeRelationship(
          testProject.id, 'non-existent', 'mother', 'partner'
        );

        expect(success).toBe(false);
      });
    });

    describe('Validation and Edge Cases', () => {
      it('should prevent circular parent-child relationships', async () => {
        // Create A -> B parent-child relationship
        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'huvudperson'
        });

        // Try to create B -> A parent-child relationship (circular)
        await expect(familyMemberService.addRelationship(testProject.id, 'huvudperson', {
          type: 'parent',
          relatedPersonId: 'father'
        })).rejects.toThrow('circular');
      });

      it('should maintain generation consistency', async () => {
        // Try to make huvudperson (gen 1) parent of father (gen 0)
        // This should fail because parent generation (1) >= child generation (0)
        await expect(familyMemberService.addRelationship(testProject.id, 'huvudperson', {
          type: 'parent',
          relatedPersonId: 'father'
        })).rejects.toThrow('Parent generation');
      });

      it('should handle complex family structures', async () => {
        // Add grandparents
        await familyMemberService.addMember(testProject.id, {
          namn: 'Grandfather',
          kön: 'man',
          generation: -1
        });

        await familyMemberService.addMember(testProject.id, {
          namn: 'Grandmother',
          kön: 'kvinna',
          generation: -1
        });

        // Set up multi-generation relationships
        await familyMemberService.addRelationship(testProject.id, 'grandfather', {
          type: 'parent',
          relatedPersonId: 'father'
        });

        await familyMemberService.addRelationship(testProject.id, 'grandmother', {
          type: 'parent',
          relatedPersonId: 'father'
        });

        await familyMemberService.addRelationship(testProject.id, 'father', {
          type: 'parent',
          relatedPersonId: 'huvudperson'
        });

        // Verify the relationships
        const grandfather = await familyMemberService.getMember(testProject.id, 'grandfather');
        const grandmother = await familyMemberService.getMember(testProject.id, 'grandmother');
        const father = await familyMemberService.getMember(testProject.id, 'father');
        const child = await familyMemberService.getMember(testProject.id, 'huvudperson');

        expect(grandfather!.barn).toContain('father');
        expect(grandmother!.barn).toContain('father');
        expect(father!.föräldrar).toContain('grandfather');
        expect(father!.föräldrar).toContain('grandmother');
        expect(father!.barn).toContain('huvudperson');
        expect(child!.föräldrar).toContain('father');
      });
    });
  });
});