// src/app/models/marker.model.ts
export interface Marker {
    id?: string;
    name: number;
    description: number;
    geom: {
      type: string;
      coordinates: [number, number];
    };
    user_id: string;
  }
  