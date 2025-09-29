/**
 * Family Project data model for Herold application
 * Represents a complete family tree project with all members and settings
 */

import { FamilyMember, Relationship } from './FamilyMember';

/**
 * Visual styling and layout configuration
 */
export interface FontConfig {
  family: string;
  fallbacks: string[];
  size?: {
    title: number;
    names: number;
    relationships: number;
  };
}

export type Orientation = 'portrait' | 'landscape';
export type LayoutAlgorithm = 'family-groups-separated' | 'traditional-tree' | 'compact';
export type ThemeName = 'parchment' | 'modern' | 'elegant' | 'minimal';

export interface LayoutConfig {
  algorithm: LayoutAlgorithm;
  spacing: 'tight' | 'comfortable' | 'spacious';
  showGenerationLabels: boolean;
  showMarriageSymbols: boolean;
  centerMainPerson: boolean;
}

export interface ThemeConfig {
  name: ThemeName;
  colors: {
    background: string;
    text: string;
    lines: string;
    accent: string;
  };
  decorations: {
    showBorder: boolean;
    showCornerDecorations: boolean;
    showShadows: boolean;
  };
}

export interface ProjectSettings {
  font: FontConfig;
  orientation: Orientation;
  theme: ThemeConfig;
  layout: LayoutConfig;

  // SVG output settings
  dimensions: {
    width: number;
    height: number;
  };

  // Export settings
  formats: ('svg' | 'png' | 'pdf')[];
  quality: number; // For raster formats
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  skapad: string; // ISO date string
  senast_uppdaterad: string; // ISO date string
  version: string;
  struktur_version: string;
  antal_personer: number;
  antal_generationer: number;
  senaste_tillagg?: string; // Name of last added person
  dokumentation_uppdaterad?: string;
}

/**
 * Complete family project structure
 */
export interface FamilyProject {
  // Project identification
  id: string;
  name: string; // Display name like "Huset Halling"
  description: string;
  culturalContext?: string; // e.g., "middle-earth-nordic"

  // Main person (focal point of the tree)
  mainPersonId: string;

  // Family data
  members: Record<string, FamilyMember>; // Keyed by member ID
  relationships: Relationship[]; // Explicit relationships

  // Configuration
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

/**
 * Simplified project info for listings
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastModified: string;
  thumbnail?: string; // Base64 or URL to thumbnail image
}

/**
 * Default project settings
 */
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
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
  quality: 300, // DPI for raster formats
};

/**
 * Project validation utilities
 */
export const ProjectValidation = {
  isValidProjectId: (id: string): boolean => {
    return /^[a-z][a-z0-9-]*$/.test(id) && id.length >= 3 && id.length <= 50;
  },

  validateProject: (project: Partial<FamilyProject>): string[] => {
    const errors: string[] = [];

    if (!project.id) {
      errors.push('Project ID is required');
    } else if (!ProjectValidation.isValidProjectId(project.id)) {
      errors.push('Project ID must be lowercase alphanumeric with dashes, 3-50 characters');
    }

    if (!project.name || project.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (!project.mainPersonId) {
      errors.push('Main person ID is required');
    }

    if (!project.members) {
      errors.push('Members object is required');
    } else {
      // Check if main person exists in members
      if (project.mainPersonId && !project.members[project.mainPersonId]) {
        errors.push('Main person must exist in members');
      }

      // Check for circular references (basic validation)
      Object.values(project.members).forEach((member) => {
        if (member.föräldrar.includes(member.id)) {
          errors.push(`Member ${member.id} cannot be their own parent`);
        }
        if (member.barn.includes(member.id)) {
          errors.push(`Member ${member.id} cannot be their own child`);
        }
        if (member.partner === member.id) {
          errors.push(`Member ${member.id} cannot be their own partner`);
        }
      });
    }

    return errors;
  }
};