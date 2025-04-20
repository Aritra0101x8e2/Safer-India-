
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FraudEvent } from '@/types/fraud';
import { subscribeFraudStream, getAllFrauds } from '@/services/fraudDataService';

// In a real application, this would come from environment variables
// For demo purposes, we're using a temporary public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbHVrcDRtbmMwOXRuMmtvODdyZTg3am8zIn0.0e7t3bPmXNOOgwGWQWBM3w';

interface MapComponentProps {
  onStateSelect?: (state: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onStateSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const dotsSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxInput, setMapboxInput] = useState('');
  const [isUsingDefault, setIsUsingDefault] = useState(true);
  
  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    let token = MAPBOX_TOKEN;
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      token = storedToken;
      setIsUsingDefault(false);
    }

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [78.96, 20.59], // Center of India
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        attributionControl: false
      });

      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add India boundary layer for reference (optional if your mapbox style already has boundaries)
        map.current.addSource('fraud-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
        
        dotsSource.current = map.current.getSource('fraud-points') as mapboxgl.GeoJSONSource;
        
        // Add high risk (red) fraud points
        map.current.addLayer({
          id: 'fraud-high',
          type: 'circle',
          source: 'fraud-points',
          filter: ['==', ['get', 'riskLevel'], 'HIGH'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#EA384C',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#EA384C',
            'circle-stroke-opacity': 0.3
          }
        });
        
        // Add medium risk (orange) fraud points
        map.current.addLayer({
          id: 'fraud-medium',
          type: 'circle',
          source: 'fraud-points',
          filter: ['==', ['get', 'riskLevel'], 'MEDIUM'],
          paint: {
            'circle-radius': 5,
            'circle-color': '#F97316',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#F97316',
            'circle-stroke-opacity': 0.3
          }
        });
        
        // Add low risk (yellow) fraud points
        map.current.addLayer({
          id: 'fraud-low',
          type: 'circle',
          source: 'fraud-points',
          filter: ['==', ['get', 'riskLevel'], 'LOW'],
          paint: {
            'circle-radius': 4,
            'circle-color': '#FACC15',
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FACC15',
            'circle-stroke-opacity': 0.3
          }
        });

        // Add pulsing effect for high risk
        map.current.addLayer({
          id: 'fraud-high-pulse',
          type: 'circle',
          source: 'fraud-points',
          filter: ['==', ['get', 'riskLevel'], 'HIGH'],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'pulseRadius'],
              0, 6,
              1, 25
            ],
            'circle-color': '#EA384C',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['get', 'pulseRadius'],
              0, 0.7,
              1, 0
            ],
            'circle-stroke-width': 0
          }
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add click event to select states (would need GeoJSON data for states)
        map.current.on('click', 'fraud-high', (e) => {
          if (e.features && e.features[0] && e.features[0].properties) {
            const state = e.features[0].properties.state;
            if (onStateSelect) onStateSelect(state);
          }
        });
        
        // Add hover effect
        map.current.on('mouseenter', 'fraud-high', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'fraud-high', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
        
        setMapLoaded(true);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onStateSelect]);
  
  // Update dots on the map
  useEffect(() => {
    if (!mapLoaded || !dotsSource.current) return;
    
    // Get existing data and add pulseRadius property for animation
    const existingData = getAllFrauds().map(fraud => ({
      type: 'Feature' as const,
      properties: {
        ...fraud,
        pulseRadius: Math.random(), // Random start point for the pulse animation
        description: `${fraud.amount} INR - ${fraud.city}, ${fraud.state}`
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [fraud.longitude, fraud.latitude]
      }
    }));
    
    // Update the source data
    dotsSource.current.setData({
      type: 'FeatureCollection',
      features: existingData
    });
    
    // Subscribe to new fraud events
    const unsubscribe = subscribeFraudStream((newFraud) => {
      if (!dotsSource.current) return;
      
      // Get current data
      const currentData = map.current?.getSource('fraud-points')._data as GeoJSON.FeatureCollection;
      
      if (!currentData || !currentData.features) return;
      
      // Add new feature
      const newFeature = {
        type: 'Feature' as const,
        properties: {
          ...newFraud,
          pulseRadius: 0, // Start pulse animation
          description: `${newFraud.amount} INR - ${newFraud.city}, ${newFraud.state}`
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [newFraud.longitude, newFraud.latitude]
        }
      };
      
      // Add to beginning and limit to 1000 points
      const newFeatures = [
        newFeature,
        ...currentData.features.slice(0, 999)
      ];
      
      // Update the data
      dotsSource.current.setData({
        type: 'FeatureCollection',
        features: newFeatures
      });
      
      // Animate the pulse
      let pulseRadius = 0;
      const pulseInterval = setInterval(() => {
        pulseRadius += 0.04;
        newFeature.properties.pulseRadius = pulseRadius;
        
        if (dotsSource.current) {
          dotsSource.current.setData({
            type: 'FeatureCollection',
            features: newFeatures
          });
        }
        
        if (pulseRadius >= 1) {
          clearInterval(pulseInterval);
        }
      }, 50);
    });
    
    return () => {
      unsubscribe();
    };
  }, [mapLoaded]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxInput.trim()) {
      localStorage.setItem('mapbox_token', mapboxInput.trim());
      window.location.reload(); // Reload to use the new token
    }
  };

  const searchState = (state: string) => {
    // This would need a geocoding API or predefined coordinates for Indian states
    // For this demo, we'll use a simple lookup based on our predefined states
    if (map.current) {
      // Fictional coordinates for a simple demo
      // In a real app, you would use geocoding API to get coordinates
      map.current.flyTo({
        center: [78.96, 20.59], // Default to center of India
        zoom: 5,
        duration: 1500
      });
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {isUsingDefault && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-cyber-background/90 p-4 text-center">
          <p className="text-sm text-yellow-400 mb-2">
            You're using a demo Mapbox token. For better performance, please add your own token:
          </p>
          <form onSubmit={handleTokenSubmit} className="flex justify-center">
            <input
              type="text"
              value={mapboxInput}
              onChange={(e) => setMapboxInput(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="px-3 py-1 bg-cyber-background border border-cyber-blue rounded-l-md text-sm w-64"
            />
            <button
              type="submit"
              className="bg-cyber-blue text-white px-3 py-1 rounded-r-md text-sm"
            >
              Save
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-1">
            You can get a token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-cyber-blue hover:underline">mapbox.com</a>
          </p>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 p-4 z-10 map-overlay">
        <h3 className="font-mono text-sm font-medium mb-2 text-white glow-text">FRAUD RISK LEVELS</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-cyber-red mr-2"></div>
            <span className="text-white">High Risk Fraud</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-cyber-orange mr-2"></div>
            <span className="text-white">Suspicious Pattern</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-cyber-yellow mr-2"></div>
            <span className="text-white">Under Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
