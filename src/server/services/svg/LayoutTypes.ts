/**
 * Types and interfaces for SVG layout calculation
 */

import { FamilyMember } from '../../../shared/types/FamilyMember';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface PersonLayout extends Position {
  member: FamilyMember;
  textWidth: number;
}

export interface ConnectionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'parent-child' | 'marriage' | 'sibling';
}

export interface MarriageConnection {
  person1: PersonLayout;
  person2: PersonLayout;
  symbolX: number;
  symbolY: number;
}

export interface GenerationGroup {
  generation: number;
  members: FamilyMember[];
  yPosition: number;
  leftmostX: number;
  rightmostX: number;
}

export interface FamilyGroup {
  id: string;
  members: FamilyMember[];
  centerX: number;
  generation: number;
  marriages: MarriageConnection[];
}

export interface LayoutResult {
  people: PersonLayout[];
  connections: ConnectionLine[];
  marriages: MarriageConnection[];
  dimensions: Dimensions;
  generations: GenerationGroup[];
}

export interface LayoutConfig {
  // Spacing configuration
  generationSpacing: number;  // Vertical space between generations
  personSpacing: number;      // Horizontal space between people
  marriageSpacing: number;    // Space between married couples

  // Font and text configuration
  fontSize: number;
  fontFamily: string;

  // Canvas configuration
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;

  // Title configuration
  titleHeight: number;

  // Connection line styling
  lineColor: string;
  lineWidth: number;
}