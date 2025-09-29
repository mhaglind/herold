/**
 * Migration script to convert legacy Halling family data to new FamilyProject format
 */

import fs from 'fs/promises';
import path from 'path';
import * as FamilyProjectTypes from '../shared/types/FamilyProject';
import type { FamilyProject, FamilyMember } from '../shared/types/FamilyProject';

interface LegacyPerson {
  id: string;
  namn: string;
  kön: string;
  generation: number;
  föräldrar: string[];
  partner: string | null;
  barn: string[];
  status: string;
  anteckningar: string;
}

interface LegacyData {
  släktträd: {
    titel: string;
    beskrivning: string;
    huvudperson: string;
  };
  personer: Record<string, LegacyPerson>;
}

async function migrateLegacyData() {
  try {
    console.log('🔄 Starting migration of legacy Halling family data...');

    // Read legacy data
    const legacyPath = path.join(process.cwd(), 'halling_slakt.json');
    const legacyDataRaw = await fs.readFile(legacyPath, 'utf-8');
    const legacyData: LegacyData = JSON.parse(legacyDataRaw);

    console.log(`📖 Read legacy data: ${Object.keys(legacyData.personer).length} people`);

    // Convert to new format
    const members: Record<string, FamilyMember> = {};

    Object.values(legacyData.personer).forEach(person => {
      members[person.id] = {
        id: person.id,
        namn: person.namn,
        kön: person.kön as any, // Type conversion
        generation: person.generation,
        föräldrar: person.föräldrar,
        barn: person.barn,
        partner: person.partner,
        status: person.status as any, // Type conversion
        anteckningar: person.anteckningar
      };
    });

    // Create new FamilyProject
    const project: FamilyProject = {
      id: 'huset-halling',
      name: legacyData.släktträd.titel,
      description: legacyData.släktträd.beskrivning,
      culturalContext: 'middle-earth-nordic',
      mainPersonId: legacyData.släktträd.huvudperson,
      members,
      relationships: [], // We'll derive these from the member data
      settings: FamilyProjectTypes.DEFAULT_PROJECT_SETTINGS,
      metadata: {
        skapad: new Date().toISOString(),
        senast_uppdaterad: new Date().toISOString(),
        version: '1.0.0',
        struktur_version: '2.0.0',
        antal_personer: Object.keys(members).length,
        antal_generationer: calculateGenerationCount(members),
        senaste_tillagg: undefined,
        dokumentation_uppdaterad: new Date().toISOString(),
      }
    };

    // Generate relationships from member data
    project.relationships = generateRelationships(members);

    console.log(`✨ Created project with ${project.metadata.antal_personer} people across ${project.metadata.antal_generationer} generations`);

    // Validate the project
    const errors = FamilyProjectTypes.ProjectValidation.validateProject(project);
    if (errors.length > 0) {
      console.error('❌ Validation errors:', errors);
      throw new Error(`Migration failed validation: ${errors.join(', ')}`);
    }

    console.log('✅ Project validation passed');

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data', 'projects');
    await fs.mkdir(dataDir, { recursive: true });

    // Save the migrated project
    const outputPath = path.join(dataDir, `${project.id}.json`);
    await fs.writeFile(outputPath, JSON.stringify(project, null, 2), 'utf-8');

    console.log(`💾 Saved migrated project to: ${outputPath}`);
    console.log('🎉 Migration completed successfully!');

    return project;
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

function calculateGenerationCount(members: Record<string, FamilyMember>): number {
  const generations = new Set<number>();
  Object.values(members).forEach(member => {
    generations.add(member.generation);
  });
  return generations.size;
}

function generateRelationships(members: Record<string, FamilyMember>) {
  const relationships: any[] = [];

  Object.values(members).forEach(member => {
    // Add marriage relationships
    if (member.partner) {
      const partnerId = member.partner;
      // Only add each marriage once (from the perspective of the person with lower ID)
      if (member.id < partnerId) {
        relationships.push({
          type: 'marriage',
          person1: member.id,
          person2: partnerId,
          status: 'gift',
          notes: `Marriage between ${member.namn} and ${members[partnerId]?.namn || partnerId}`
        });
      }
    }

    // Add parent-child relationships
    member.barn.forEach(childId => {
      relationships.push({
        type: 'parent-child',
        person1: member.id,
        person2: childId,
        notes: `${member.namn} is parent of ${members[childId]?.namn || childId}`
      });
    });
  });

  return relationships;
}

// Run the migration if this script is executed directly
// Check if this is the main module (ES module equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLegacyData()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateLegacyData };