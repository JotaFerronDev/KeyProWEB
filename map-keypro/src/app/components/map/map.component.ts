// src/app/components/mapa/mapa.component.ts
import { Component, OnInit } from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Marker } from '../../models/marker.mode';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map!: Map;
  vectorSource!: VectorSource;
  markerForm: FormGroup;
  selectedFeature: Feature | null = null;

  constructor(private authService: AuthService, private http: HttpClient, private toastr: ToastrService, private fb: FormBuilder) {
    this.vectorSource = new VectorSource();
    this.markerForm = this.fb.group({
      name: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'assets/marker.png'
        })
      })
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });

    this.map.on('click', (event) => {
      const coordinates = event.coordinate;
      this.addMarkerPrompt(coordinates);
    });

    this.map.on('dblclick', (event) => {
      const coordinates = event.coordinate;
      this.editMarkerPrompt(coordinates);
    });

    this.loadMarkers();
  }

  loadMarkers() {
    this.http.get<Marker[]>(`${environment.apiUrl}/markers`).subscribe(
      (markers) => {
        markers.forEach(marker => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([marker.geom.coordinates[0], marker.geom.coordinates[1]])),
            name: marker.name,
            description: marker.description,
            user_id: marker.user_id
          });
          this.vectorSource.addFeature(feature);
        });
        this.toastr.success('Markers loaded successfully');
      },
      (error) => {
        this.toastr.error('Failed to load markers');
      }
    );
  }

  addMarkerPrompt(coordinates: any) {
    const name = prompt('Enter marker name:');
    const description = prompt('Enter marker description:');
    if (name && description) {
      this.addMarker(coordinates, name, description);
    }
  }

  addMarker(coordinates: any, name: string, description: string) {
    const feature = new Feature({
      geometry: new Point(fromLonLat(coordinates))
    });
    this.vectorSource.addFeature(feature);

    const marker = {
      name: name,
      description: description,
      geom: {
        type: 'Point',
        coordinates: coordinates
      },
      user_id: this.authService.getUserId() as string
    };

    this.http.post(`${environment.apiUrl}/markers`, marker).subscribe(
      () => {
        this.toastr.success('Marker added successfully');
      },
      (error) => {
        this.toastr.error('Failed to add marker');
      }
    );
  }

  editMarkerPrompt(coordinates: any) {
    const feature = this.vectorSource.getClosestFeatureToCoordinate(fromLonLat(coordinates));
    if (feature) {
      this.selectedFeature = feature;
      const name = prompt('Enter new marker name:', feature.get('name'));
      const description = prompt('Enter new marker description:', feature.get('description'));
      if (name && description) {
        this.editMarker(coordinates, name, description);
      }
    }
  }

  editMarker(coordinates: any, name: string, description: string) {
    if (this.selectedFeature) {
      const geometry = this.selectedFeature.getGeometry();
      if (geometry instanceof Point) {
        const oldCoordinates = geometry.getCoordinates();
        this.selectedFeature.setGeometry(new Point(fromLonLat(coordinates)));

        const marker = {
          name: name,
          description: description,
          geom: {
            type: 'Point',
            coordinates: coordinates
          },
          user_id: this.authService.getUserId() as string
        };

        this.http.put(`${environment.apiUrl}/markers/${this.selectedFeature.get('id')}`, marker).subscribe(
          () => {
            this.toastr.success('Marker edited successfully');
          },
          (error) => {
            this.toastr.error('Failed to edit marker');
          }
        );
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
