import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { CustomMarkerOptions } from '../../models/custom-marker-options.model';
import { ApiResponse } from '../../models/api-reponse.model';
import { CustomMarker } from '../../models/custom-marker.model';
import { MarkerService } from '../../services/marker.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  markerForm: FormGroup;
  markers: L.Marker<CustomMarkerOptions>[] = [];

  constructor(
    private marker_service: MarkerService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.markerForm = this.fb.group({
      name: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.map = L.map('map', {
      doubleClickZoom: false
    }).setView([40, 20], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (event) => {
      const coordinates = [event.latlng.lng, event.latlng.lat];
      this.addMarkerPrompt(coordinates);
    });

    this.loadMarkers();
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  loadMarkers() {
    this.marker_service.get_markers().subscribe(
      (markers) => {
        markers.forEach(marker => {
          const coordinates = marker.geom.coordinates;
          const leafletMarker = L.marker([coordinates[1], coordinates[0]], {
            id: marker.id,
            user_id: marker.user_id
          } as CustomMarker['options'])
            .addTo(this.map)
            .bindPopup(`<b>${marker.name}</b><br>${marker.description}`)
          this.markers.push(leafletMarker);
        });
        this.toastr.success('Markers loaded successfully');
      },
      (error) => {
        this.toastr.error('Failed to load markers');
      }
    );
  }

  addMarkerPrompt(coordinates: any) {
    let name = prompt('Enter a marker name:');
    let description = prompt('Enter a marker description:');
    if (name && description) {
      this.addMarker(coordinates, name, description);
    }
  }

  addMarker(coordinates: any, name: string, description: string) {
    const leafletMarker = L.marker([coordinates[1], coordinates[0]])
      .addTo(this.map)
      .bindPopup(`<b>${name}</b><br>${description}`);

    const marker = {
      name: name,
      description: description,
      geom: {
        type: 'Point',
        coordinates: coordinates
      },
      user_id: this.authService.getUserId() as string
    };

    this.marker_service.register_marker(marker).subscribe(
      (response: ApiResponse) => {
        (leafletMarker as CustomMarker).options.id = response.id;
        (leafletMarker as CustomMarker).options.user_id = response.user_id;
        this.markers.push(leafletMarker as CustomMarker);
        this.toastr.success('Marker added successfully');
      },
      (error) => {
        this.toastr.error('Failed to add marker');
        this.map.removeLayer(leafletMarker);
      }
    );
  }

  logout() {
    this.authService.logout();
  }
}
