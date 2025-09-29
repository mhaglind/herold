/**
 * Family Tree Layout Engine
 * Implements the layout algorithm for positioning family members in SVG
 */

import { FamilyMember } from '../../../shared/types/FamilyMember';
import { FamilyProject } from '../../../shared/types/FamilyProject';
import {
  LayoutResult,
  LayoutConfig,
  PersonLayout,
  GenerationGroup,
  FamilyGroup,
  ConnectionLine,
  MarriageConnection,
  Position,
  Dimensions
} from './LayoutTypes';

export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config?: Partial<LayoutConfig>) {
    this.config = {
      generationSpacing: 80,
      personSpacing: 120,
      marriageSpacing: 40,
      fontSize: 16,
      fontFamily: 'Dancing Script',
      marginTop: 100,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
      titleHeight: 90,
      lineColor: '#8b7355',
      lineWidth: 1,
      ...config
    };
  }

  /**
   * Main entry point - generate complete layout from family project
   */
  generateLayout(project: FamilyProject): LayoutResult {
    const members = Object.values(project.members);

    // Step 1: Group members by generation
    const generations = this.groupByGeneration(members);

    // Step 2: Identify family groups and marriages
    const familyGroups = this.identifyFamilyGroups(members);

    // Step 3: Calculate positions for each person
    const personLayouts = this.calculatePersonPositions(generations, familyGroups);

    // Step 4: Generate connection lines
    const connections = this.generateConnections(personLayouts, members);

    // Step 5: Identify and position marriages
    const marriages = this.generateMarriages(personLayouts, members);

    // Step 6: Calculate optimal canvas dimensions
    const dimensions = this.calculateDimensions(personLayouts);

    return {
      people: personLayouts,
      connections,
      marriages,
      dimensions,
      generations
    };
  }

  /**
   * Group family members by generation
   */
  private groupByGeneration(members: FamilyMember[]): GenerationGroup[] {
    const generationMap = new Map<number, FamilyMember[]>();

    // Group members by generation
    members.forEach(member => {
      const gen = member.generation;
      if (!generationMap.has(gen)) {
        generationMap.set(gen, []);
      }
      generationMap.get(gen)!.push(member);
    });

    // Convert to sorted array
    const generations: GenerationGroup[] = [];
    const sortedGens = Array.from(generationMap.keys()).sort((a, b) => a - b);

    sortedGens.forEach((gen, index) => {
      const yPosition = this.config.titleHeight + this.config.marginTop +
                       (index * this.config.generationSpacing);

      generations.push({
        generation: gen,
        members: generationMap.get(gen)!,
        yPosition,
        leftmostX: 0,  // Will be calculated later
        rightmostX: 0  // Will be calculated later
      });
    });

    return generations;
  }

  /**
   * Identify family groups for better positioning
   */
  private identifyFamilyGroups(members: FamilyMember[]): FamilyGroup[] {
    const groups: FamilyGroup[] = [];
    const processed = new Set<string>();

    members.forEach(member => {
      if (processed.has(member.id)) return;

      // Start a new family group with this person
      const group: FamilyGroup = {
        id: member.id,
        members: [member],
        centerX: 0,
        generation: member.generation,
        marriages: []
      };

      processed.add(member.id);

      // Add spouse if exists
      if (member.partner) {
        const spouse = members.find(m => m.id === member.partner);
        if (spouse && !processed.has(spouse.id)) {
          group.members.push(spouse);
          processed.add(spouse.id);
        }
      }

      // Add children
      member.barn.forEach(childId => {
        const child = members.find(m => m.id === childId);
        if (child && !processed.has(child.id)) {
          group.members.push(child);
          processed.add(child.id);
        }
      });

      groups.push(group);
    });

    return groups;
  }

  /**
   * Calculate positions for all people
   */
  private calculatePersonPositions(
    generations: GenerationGroup[],
    familyGroups: FamilyGroup[]
  ): PersonLayout[] {
    const personLayouts: PersonLayout[] = [];

    generations.forEach(generation => {
      const genMembers = generation.members;
      const totalWidth = this.calculateTotalWidthForGeneration(genMembers);

      // Center the generation horizontally
      let currentX = this.config.marginLeft +
                    Math.max(0, (400 - totalWidth) / 2); // Assume 400px base width

      genMembers.forEach(member => {
        const textWidth = this.estimateTextWidth(member.namn);

        personLayouts.push({
          x: currentX + textWidth / 2, // Center of text
          y: generation.yPosition,
          member,
          textWidth
        });

        // Move to next position
        currentX += textWidth + this.config.personSpacing;

        // Add extra space for married couples
        if (member.partner) {
          const spouse = genMembers.find(m => m.id === member.partner);
          if (spouse) {
            currentX -= this.config.personSpacing - this.config.marriageSpacing;
          }
        }
      });

      // Update generation bounds
      generation.leftmostX = this.config.marginLeft;
      generation.rightmostX = currentX;
    });

    return personLayouts;
  }

  /**
   * Generate connection lines between family members
   */
  private generateConnections(
    personLayouts: PersonLayout[],
    members: FamilyMember[]
  ): ConnectionLine[] {
    const connections: ConnectionLine[] = [];
    const layoutMap = new Map<string, PersonLayout>();

    // Create lookup map
    personLayouts.forEach(layout => {
      layoutMap.set(layout.member.id, layout);
    });

    // Generate parent-child connections
    members.forEach(member => {
      const childLayout = layoutMap.get(member.id);
      if (!childLayout) return;

      member.föräldrar.forEach(parentId => {
        const parentLayout = layoutMap.get(parentId);
        if (!parentLayout) return;

        connections.push({
          x1: parentLayout.x,
          y1: parentLayout.y + 10, // Slightly below the text
          x2: childLayout.x,
          y2: childLayout.y - 10,  // Slightly above the text
          type: 'parent-child'
        });
      });
    });

    return connections;
  }

  /**
   * Generate marriage connections and symbols
   */
  private generateMarriages(
    personLayouts: PersonLayout[],
    members: FamilyMember[]
  ): MarriageConnection[] {
    const marriages: MarriageConnection[] = [];
    const layoutMap = new Map<string, PersonLayout>();
    const processedPairs = new Set<string>();

    // Create lookup map
    personLayouts.forEach(layout => {
      layoutMap.set(layout.member.id, layout);
    });

    members.forEach(member => {
      if (!member.partner) return;

      const partnerId = member.partner;
      const pairKey = [member.id, partnerId].sort().join('-');

      if (processedPairs.has(pairKey)) return;
      processedPairs.add(pairKey);

      const person1Layout = layoutMap.get(member.id);
      const person2Layout = layoutMap.get(partnerId);

      if (!person1Layout || !person2Layout) return;

      // Calculate marriage symbol position (midpoint between spouses)
      const symbolX = (person1Layout.x + person2Layout.x) / 2;
      const symbolY = (person1Layout.y + person2Layout.y) / 2;

      marriages.push({
        person1: person1Layout,
        person2: person2Layout,
        symbolX,
        symbolY
      });
    });

    return marriages;
  }

  /**
   * Calculate optimal canvas dimensions
   */
  private calculateDimensions(personLayouts: PersonLayout[]): Dimensions {
    if (personLayouts.length === 0) {
      return { width: 595, height: 842 }; // A4 default
    }

    const minX = Math.min(...personLayouts.map(p => p.x - p.textWidth / 2));
    const maxX = Math.max(...personLayouts.map(p => p.x + p.textWidth / 2));
    const minY = Math.min(...personLayouts.map(p => p.y));
    const maxY = Math.max(...personLayouts.map(p => p.y));

    const width = Math.max(595, maxX - minX + this.config.marginLeft + this.config.marginRight);
    const height = Math.max(842, maxY - minY + this.config.marginTop + this.config.marginBottom + this.config.titleHeight);

    return { width, height };
  }

  /**
   * Calculate total width needed for a generation
   */
  private calculateTotalWidthForGeneration(members: FamilyMember[]): number {
    let totalWidth = 0;

    members.forEach((member, index) => {
      totalWidth += this.estimateTextWidth(member.namn);

      if (index < members.length - 1) {
        // Add spacing, but less for married couples
        const nextMember = members[index + 1];
        if (member.partner === nextMember.id || nextMember.partner === member.id) {
          totalWidth += this.config.marriageSpacing;
        } else {
          totalWidth += this.config.personSpacing;
        }
      }
    });

    return totalWidth;
  }

  /**
   * Estimate text width (simplified calculation)
   */
  private estimateTextWidth(text: string): number {
    // Rough estimation: Dancing Script at 16px is about 0.6 * character width
    // Average character width for Dancing Script is about 10px
    const avgCharWidth = 8;
    return text.length * avgCharWidth;
  }
}