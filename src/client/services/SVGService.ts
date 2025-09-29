/**
 * SVG Service
 * Frontend API client for SVG rendering operations
 */

import { BaseApiClient, API_CONFIG } from './api-config';

export interface SVGStatusResponse {
  projectId: string;
  svgExists: boolean;
  svgPath: string;
  fileStats?: {
    size: number;
    created: string;
    modified: string;
  };
  memberCount: number;
  lastUpdated: string;
  message: string;
}

export interface RegenerateResponse {
  projectId: string;
  svgPath: string | null;
  svgUpdated: boolean;
  error?: string;
  message: string;
  timestamp: string;
}

export interface RenderOptions {
  layoutOptions?: {
    algorithm?: 'family-groups-separated' | 'traditional-tree' | 'compact';
    spacing?: 'tight' | 'comfortable' | 'spacious';
    showGenerationLabels?: boolean;
    showMarriageSymbols?: boolean;
    centerMainPerson?: boolean;
  };
}

export interface SVGMetadata {
  dimensions: { width: number; height: number };
  peopleCount: number;
  generationCount: number;
  renderTime: number;
}

export interface CustomRenderResponse {
  svg: string;
  metadata: SVGMetadata;
  message: string;
}

export interface LayoutStats {
  projectId: string;
  stats: {
    totalPeople: number;
    generations: number;
    familyGroups: number;
    relationships: number;
    estimatedSize: { width: number; height: number };
  };
  validation: {
    isValid: boolean;
    errors: string[];
  };
  estimatedRenderTime: number;
}

export class SVGService extends BaseApiClient {
  /**
   * Get SVG for a project (live generation)
   */
  async getSVG(projectId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.svg(projectId)}/svg`);
    if (!response.ok) {
      throw new Error(`Failed to get SVG: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get the auto-generated SVG file (from family member operations)
   */
  async getSVGFile(projectId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.svg(projectId)}/file`);
    if (!response.ok) {
      throw new Error(`Failed to get SVG file: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Get SVG thumbnail
   */
  async getThumbnail(projectId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.svg(projectId)}/thumbnail`);
    if (!response.ok) {
      throw new Error(`Failed to get thumbnail: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Check SVG file status and metadata
   */
  async getSVGStatus(projectId: string): Promise<SVGStatusResponse> {
    return this.get<SVGStatusResponse>(`${API_CONFIG.endpoints.svg(projectId)}/status`);
  }

  /**
   * Manually trigger SVG regeneration
   */
  async regenerateSVG(projectId: string): Promise<RegenerateResponse> {
    return this.post<RegenerateResponse>(`${API_CONFIG.endpoints.svg(projectId)}/regenerate-auto`);
  }

  /**
   * Generate SVG with custom layout options
   */
  async renderWithOptions(projectId: string, options: RenderOptions): Promise<CustomRenderResponse> {
    return this.post<CustomRenderResponse>(
      `${API_CONFIG.endpoints.svg(projectId)}/regenerate`,
      options
    );
  }

  /**
   * Get layout statistics for debugging
   */
  async getLayoutStats(projectId: string): Promise<LayoutStats> {
    return this.get<LayoutStats>(`${API_CONFIG.endpoints.svg(projectId)}/stats`);
  }

  /**
   * Create blob URL for SVG display
   */
  createBlobUrl(svgContent: string): string {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  /**
   * Revoke blob URL to prevent memory leaks
   */
  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Download SVG file
   */
  downloadSVG(svgContent: string, filename: string): void {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const svgService = new SVGService();