export type ElementType = 'TEXT' | 'PRICE' | 'PROMOTION' | 'LOGO';

export interface OverlayElement {
  id: string;
  overlayTemplateId: string;
  type: ElementType;
  content: string;
  // Posición relativa (0.0 - 1.0) para adaptarse a cualquier resolución
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  // Estilos
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  backgroundOpacity: number;
  padding: number;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right';
  zIndex: number;
  createdAt: string;
}

export interface OverlayTemplate {
  id: string;
  name: string;
  videoAssetId: string;
  elements: OverlayElement[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOverlayTemplateDto {
  name: string;
  videoAssetId: string;
}

export interface CreateOverlayElementDto {
  type: ElementType;
  content: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  zIndex?: number;
}

export type UpdateOverlayElementDto = Partial<CreateOverlayElementDto>;
