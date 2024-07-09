// src/app/models/custom-marker-options.model.ts
import * as L from 'leaflet';

export interface CustomMarkerOptions extends L.MarkerOptions {
  id?: string;
  user_id?: string;
}
