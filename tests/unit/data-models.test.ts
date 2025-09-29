/**
 * Unit tests for family data models and validation
 */

import { FamilyMemberValidation, type FamilyMember, type Gender, type PersonStatus } from '../../src/shared/types/FamilyMember';
import { ProjectValidation, type FamilyProject, DEFAULT_PROJECT_SETTINGS } from '../../src/shared/types/FamilyProject';

describe('FamilyMember Validation', () => {
  describe('isValidId', () => {
    it('should accept valid IDs', () => {
      expect(FamilyMemberValidation.isValidId('halvard')).toBe(true);
      expect(FamilyMemberValidation.isValidId('halli_av_dal')).toBe(true);
      expect(FamilyMemberValidation.isValidId('a1')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(FamilyMemberValidation.isValidId('1invalid')).toBe(false); // starts with number
      expect(FamilyMemberValidation.isValidId('Invalid')).toBe(false); // uppercase
      expect(FamilyMemberValidation.isValidId('a')).toBe(false); // too short
      expect(FamilyMemberValidation.isValidId('')).toBe(false); // empty
    });
  });

  describe('isValidGeneration', () => {
    it('should accept valid generations', () => {
      expect(FamilyMemberValidation.isValidGeneration(0)).toBe(true);
      expect(FamilyMemberValidation.isValidGeneration(-4)).toBe(true);
      expect(FamilyMemberValidation.isValidGeneration(3)).toBe(true);
      expect(FamilyMemberValidation.isValidGeneration(-1.5)).toBe(true);
    });

    it('should reject invalid generations', () => {
      expect(FamilyMemberValidation.isValidGeneration(-11)).toBe(false);
      expect(FamilyMemberValidation.isValidGeneration(11)).toBe(false);
      expect(FamilyMemberValidation.isValidGeneration(NaN)).toBe(false);
      expect(FamilyMemberValidation.isValidGeneration(Infinity)).toBe(false);
    });
  });

  describe('validateMember', () => {
    const validMember: FamilyMember = {
      id: 'halvard',
      namn: 'Halvard Halling',
      kön: 'man' as Gender,
      generation: 2,
      föräldrar: ['holmfast'],
      barn: ['harald', 'halldis'],
      partner: 'aelswith',
      status: 'levande' as PersonStatus,
      anteckningar: 'Huvudperson i släktträdet'
    };

    it('should validate a correct member', () => {
      const errors = FamilyMemberValidation.validateMember(validMember);
      expect(errors).toHaveLength(0);
    });

    it('should require ID', () => {
      const member = { ...validMember, id: '' };
      const errors = FamilyMemberValidation.validateMember(member);
      expect(errors).toContain('ID is required');
    });

    it('should require valid gender', () => {
      const member = { ...validMember, kön: 'invalid' as Gender };
      const errors = FamilyMemberValidation.validateMember(member);
      expect(errors).toContain('Valid gender is required');
    });

    it('should require valid status', () => {
      const member = { ...validMember, status: 'invalid' as PersonStatus };
      const errors = FamilyMemberValidation.validateMember(member);
      expect(errors).toContain('Valid status is required');
    });
  });
});

describe('FamilyProject Validation', () => {
  describe('isValidProjectId', () => {
    it('should accept valid project IDs', () => {
      expect(ProjectValidation.isValidProjectId('huset-halling')).toBe(true);
      expect(ProjectValidation.isValidProjectId('my-family')).toBe(true);
      expect(ProjectValidation.isValidProjectId('abc')).toBe(true);
    });

    it('should reject invalid project IDs', () => {
      expect(ProjectValidation.isValidProjectId('ab')).toBe(false); // too short
      expect(ProjectValidation.isValidProjectId('Invalid-Name')).toBe(false); // uppercase
      expect(ProjectValidation.isValidProjectId('1invalid')).toBe(false); // starts with number
      expect(ProjectValidation.isValidProjectId('')).toBe(false); // empty
    });
  });

  describe('validateProject', () => {
    const validProject: Partial<FamilyProject> = {
      id: 'huset-halling',
      name: 'Huset Halling',
      mainPersonId: 'halvard',
      members: {
        'halvard': {
          id: 'halvard',
          namn: 'Halvard Halling',
          kön: 'man',
          generation: 2,
          föräldrar: [],
          barn: [],
          partner: null,
          status: 'levande',
          anteckningar: ''
        }
      }
    };

    it('should validate a correct project', () => {
      const errors = ProjectValidation.validateProject(validProject);
      expect(errors).toHaveLength(0);
    });

    it('should require project ID', () => {
      const project = { ...validProject, id: undefined };
      const errors = ProjectValidation.validateProject(project);
      expect(errors).toContain('Project ID is required');
    });

    it('should require main person to exist in members', () => {
      const project = { ...validProject, mainPersonId: 'nonexistent' };
      const errors = ProjectValidation.validateProject(project);
      expect(errors).toContain('Main person must exist in members');
    });

    it('should detect circular parent references', () => {
      const project = {
        ...validProject,
        members: {
          'halvard': {
            id: 'halvard',
            namn: 'Halvard',
            kön: 'man' as Gender,
            generation: 2,
            föräldrar: ['halvard'], // self as parent
            barn: [],
            partner: null,
            status: 'levande' as PersonStatus,
            anteckningar: ''
          }
        }
      };
      const errors = ProjectValidation.validateProject(project);
      expect(errors).toContain('Member halvard cannot be their own parent');
    });
  });
});

describe('Default Project Settings', () => {
  it('should have valid default settings', () => {
    expect(DEFAULT_PROJECT_SETTINGS).toBeDefined();
    expect(DEFAULT_PROJECT_SETTINGS.font.family).toBe('Dancing Script');
    expect(DEFAULT_PROJECT_SETTINGS.orientation).toBe('portrait');
    expect(DEFAULT_PROJECT_SETTINGS.theme.name).toBe('parchment');
    expect(DEFAULT_PROJECT_SETTINGS.layout.algorithm).toBe('family-groups-separated');
  });

  it('should have A4 dimensions by default', () => {
    expect(DEFAULT_PROJECT_SETTINGS.dimensions.width).toBe(595);
    expect(DEFAULT_PROJECT_SETTINGS.dimensions.height).toBe(842);
  });
});