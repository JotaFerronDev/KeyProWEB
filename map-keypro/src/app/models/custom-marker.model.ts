// src/app/models/custom-marker.model.ts
import * as L from 'leaflet';

export interface CustomMarker extends L.Marker {
  options: L.MarkerOptions & { id?: string, user_id?: string };
}
