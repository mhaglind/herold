/**
 * API Services Index
 * Central export for all API client services
 */

// Configuration and base classes
export * from './api-config';

// Service classes and instances
export * from './ProjectService';
export * from './FamilyMemberService';
export * from './SVGService';

// Re-export service instances for convenience
export { projectService } from './ProjectService';
export { familyMemberService } from './FamilyMemberService';
export { svgService } from './SVGService';