/**
 * Family Member Routes
 * RESTful API endpoints for family member management within projects
 */

import { Router } from 'express';
import { FamilyMemberController } from '../controllers/FamilyMemberController';
import { FamilyMemberIntegrationService } from '../services/FamilyMemberIntegrationService';

const router = Router();

// Initialize integration service and controller
const familyMemberService = new FamilyMemberIntegrationService();
const familyMemberController = new FamilyMemberController(familyMemberService);

/**
 * GET /api/projects/:id/members
 * Get all family members in a project
 */
router.get('/', async (req, res) => {
  await familyMemberController.getMembers(req, res);
});

/**
 * POST /api/projects/:id/members
 * Add a new family member to the project
 * Body: {
 *   namn: string,
 *   kön: 'man' | 'kvinna' | 'other',
 *   generation: number,
 *   status?: 'levande' | 'död' | 'okänd',
 *   anteckningar?: string,
 *   birthDate?: string,
 *   deathDate?: string,
 *   culturalBackground?: string,
 *   titles?: string[],
 *   locations?: string[]
 * }
 */
router.post('/', async (req, res) => {
  await familyMemberController.addMember(req, res);
});

/**
 * GET /api/projects/:id/members/:memberId
 * Get a specific family member
 */
router.get('/:memberId', async (req, res) => {
  await familyMemberController.getMember(req, res);
});

/**
 * PUT /api/projects/:id/members/:memberId
 * Update a family member
 * Body: {
 *   namn?: string,
 *   kön?: 'man' | 'kvinna' | 'other',
 *   generation?: number,
 *   status?: 'levande' | 'död' | 'okänd',
 *   anteckningar?: string,
 *   birthDate?: string,
 *   deathDate?: string,
 *   culturalBackground?: string,
 *   titles?: string[],
 *   locations?: string[]
 * }
 */
router.put('/:memberId', async (req, res) => {
  await familyMemberController.updateMember(req, res);
});

/**
 * DELETE /api/projects/:id/members/:memberId
 * Remove a family member from the project
 * Note: Cannot remove the main person of the family tree
 */
router.delete('/:memberId', async (req, res) => {
  await familyMemberController.removeMember(req, res);
});

/**
 * POST /api/projects/:id/members/:memberId/relationships
 * Add a relationship between two family members
 * Body: {
 *   type: 'parent' | 'child' | 'partner',
 *   relatedPersonId: string,
 *   notes?: string
 * }
 */
router.post('/:memberId/relationships', async (req, res) => {
  await familyMemberController.addRelationship(req, res);
});

/**
 * DELETE /api/projects/:id/members/:memberId/relationships/:relatedPersonId
 * Remove a relationship between two family members
 * Query parameter: type ('parent' | 'child' | 'partner')
 */
router.delete('/:memberId/relationships/:relatedPersonId', async (req, res) => {
  await familyMemberController.removeRelationship(req, res);
});

export default router;