// src/app/components/mapa/mapa.component.ts
import { Component, OnInit } from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Marker } from '../../models/marker.mode';

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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.vectorSource = new VectorSource();
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
      const transformedCoordinates = fromLonLat(coordinates);
      this.addMarker(transformedCoordinates);
    });

    this.loadMarkers();
  }

  loadMarkers() {
    this.http.get<Marker[]>('http://localhost:3500/markers').subscribe((markers) => {
      markers.forEach(marker => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([marker.lon, marker.lat]))
        });
        this.vectorSource.addFeature(feature);
      });
    });
  }

  addMarker(coordinates: any) {
    const feature = new Feature({
      geometry: new Point(coordinates)
    });
    this.vectorSource.addFeature(feature);

    this.http.post('http://localhost:3500/markers', {
      lat: coordinates[1],
      lon: coordinates[0]
    }).subscribe();
  }
}
