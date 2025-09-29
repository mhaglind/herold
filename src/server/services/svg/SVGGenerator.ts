/**
 * SVG Generator
 * Converts layout results into SVG markup with parchment theme
 */

import { FamilyProject } from '../../../shared/types/FamilyProject';
import { LayoutResult, LayoutConfig } from './LayoutTypes';

export class SVGGenerator {
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
   * Generate complete SVG from project and layout
   */
  generateSVG(project: FamilyProject, layout: LayoutResult): string {
    const { width, height } = layout.dimensions;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${this.generateDefs(project)}
  ${this.generateBackground(width, height)}
  ${this.generateTitle(project, width)}
  ${this.generateConnections(layout.connections)}
  ${this.generateMarriages(layout.marriages)}
  ${this.generatePeople(layout.people)}
</svg>`;
  }

  /**
   * Generate SVG definitions (gradients, filters, styles)
   */
  private generateDefs(project: FamilyProject): string {
    const theme = project.settings.theme;

    return `  <defs>
    <!-- Font styles -->
    <style>
      .family-tree-font {
        font-family: '${project.settings.font.family}', ${project.settings.font.fallbacks.map(f => `'${f}'`).join(', ')};
      }
    </style>

    <!-- Parchment background gradient -->
    <radialGradient id="parchment" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:${theme.colors.background}"/>
      <stop offset="100%" style="stop-color:#e8e0d0"/>
    </radialGradient>

    <!-- Text shadow filter -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="1" stdDeviation="0.5"
                   flood-color="${theme.colors.lines}"
                   flood-opacity="0.3"/>
    </filter>

    <!-- Border decorations -->
    ${theme.decorations.showCornerDecorations ? this.generateCornerDecorations() : ''}
  </defs>`;
  }

  /**
   * Generate background and border
   */
  private generateBackground(width: number, height: number): string {
    return `  <!-- Parchment background -->
  <rect width="${width}" height="${height}" fill="url(#parchment)" stroke="#d4c4a8" stroke-width="3"/>

  <!-- Decorative frame -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}"
        fill="none" stroke="#8b7355" stroke-width="2" stroke-dasharray="5,3"/>`;
  }

  /**
   * Generate title section
   */
  private generateTitle(project: FamilyProject, width: number): string {
    const centerX = width / 2;
    const titleSize = project.settings.font.size?.title || 32;
    const subtitleSize = 18;

    return `  <!-- Title -->
  <text x="${centerX}" y="60" text-anchor="middle"
        class="family-tree-font"
        font-size="${titleSize}" font-weight="bold"
        fill="${project.settings.theme.colors.text}"
        filter="url(#textShadow)">
    ${this.escapeXML(project.name)}
  </text>
  <text x="${centerX}" y="85" text-anchor="middle"
        class="family-tree-font"
        font-size="${subtitleSize}"
        fill="${project.settings.theme.colors.lines}">
    Släktträd
  </text>`;
  }

  /**
   * Generate connection lines between family members
   */
  private generateConnections(connections: any[]): string {
    if (connections.length === 0) return '';

    const lines = connections.map(conn => {
      if (conn.type === 'parent-child') {
        // Create L-shaped connection for parent-child relationships
        const midY = (conn.y1 + conn.y2) / 2;
        return `    <!-- Parent-child connection -->
    <path d="M ${conn.x1} ${conn.y1} L ${conn.x1} ${midY} L ${conn.x2} ${midY} L ${conn.x2} ${conn.y2}"
          stroke="${this.config.lineColor}"
          stroke-width="${this.config.lineWidth}"
          fill="none"/>`;
      } else {
        // Direct line for other connections
        return `    <line x1="${conn.x1}" y1="${conn.y1}" x2="${conn.x2}" y2="${conn.y2}"
                stroke="${this.config.lineColor}"
                stroke-width="${this.config.lineWidth}"/>`;
      }
    }).join('\n');

    return `  <!-- Family connections -->\n${lines}`;
  }

  /**
   * Generate marriage symbols
   */
  private generateMarriages(marriages: any[]): string {
    if (marriages.length === 0) return '';

    const symbols = marriages.map(marriage => {
      // Draw line between spouses
      const line = `    <line x1="${marriage.person1.x}" y1="${marriage.person1.y}"
                         x2="${marriage.person2.x}" y2="${marriage.person2.y}"
                         stroke="${this.config.lineColor}"
                         stroke-width="${this.config.lineWidth}"/>`;

      // Draw marriage symbol (⚭)
      const symbol = `    <text x="${marriage.symbolX}" y="${marriage.symbolY + 6}"
                           text-anchor="middle"
                           class="family-tree-font"
                           font-size="14"
                           fill="${this.config.lineColor}">⚭</text>`;

      return line + '\n' + symbol;
    }).join('\n');

    return `  <!-- Marriage connections -->\n${symbols}`;
  }

  /**
   * Generate text elements for all people
   */
  private generatePeople(people: any[]): string {
    if (people.length === 0) return '';

    const textElements = people.map(person => {
      return `    <text x="${person.x}" y="${person.y}"
                  text-anchor="middle"
                  class="family-tree-font"
                  font-size="${this.config.fontSize}"
                  fill="${this.config.lineColor}">
      ${this.escapeXML(person.member.namn)}
    </text>`;
    }).join('\n');

    return `  <!-- Family members -->\n${textElements}`;
  }

  /**
   * Generate corner decorations (if enabled)
   */
  private generateCornerDecorations(): string {
    return `    <!-- Corner decorations -->
    <g id="corner-decoration">
      <circle cx="0" cy="0" r="3" fill="#8b7355"/>
      <circle cx="6" cy="0" r="2" fill="#d4c4a8"/>
      <circle cx="0" cy="6" r="2" fill="#d4c4a8"/>
    </g>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}