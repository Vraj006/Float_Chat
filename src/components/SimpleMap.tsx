import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapProps {
  height?: string;
  className?: string;
}

const SimpleMap = ({ height = '500px', className = '' }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Indian Ocean
    const map = L.map(mapRef.current, {
      center: [10.0, 78.0], // Indian Ocean coordinates
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    // Add satellite tiles (Esri World Imagery)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    });

    // Add satellite layer as default
    satelliteLayer.addTo(map);

    // Create layer control
    const baseLayers = {
      'Satellite': satelliteLayer,
      'Street': streetLayer,
    };

    L.control.layers(baseLayers).addTo(map);

    // Static Argo float data (from our original JSON)
    const argoFloats = [
      { lat: 14.8, lng: 72.5, name: "Goa Offshore", type: "argo", id: "ARG001" },
      { lat: 15.8, lng: 82.5, name: "Andhra Pradesh Coast", type: "argo", id: "ARG002" },
      { lat: 8.0, lng: 77.0, name: "Deep Ocean Buoy 1", type: "argo", id: "ARG003" },
      { lat: 5.0, lng: 73.0, name: "Maldives Region", type: "argo", id: "ARG004" },
      { lat: 7.5, lng: 93.8, name: "Nicobar Deep", type: "argo", id: "ARG005" },
      { lat: 8.5, lng: 78.0, name: "Tamil Nadu Deep", type: "argo", id: "ARG006" },
      { lat: 16.5, lng: 68.0, name: "Arabian Sea BGC Float", type: "bgc-argo", id: "BGC001" },
      { lat: 12.0, lng: 75.0, name: "Southwest Coast BGC", type: "bgc-argo", id: "BGC002" },
      { lat: 10.5, lng: 84.0, name: "Bay of Bengal BGC", type: "bgc-argo", id: "BGC003" },
      { lat: 6.0, lng: 80.0, name: "Sri Lanka BGC Float", type: "bgc-argo", id: "BGC004" },
    ];

    // Create custom icons
    const createIcon = (type: string) => {
      const color = type === 'argo' ? '#ff6b35' : '#10b981';
      const letter = type === 'argo' ? 'A' : 'B';

      return L.divIcon({
        className: 'custom-argo-marker',
        html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">${letter}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });
    };

    // Add Argo float markers
    argoFloats.forEach(float => {
      const marker = L.marker([float.lat, float.lng], {
        icon: createIcon(float.type)
      }).addTo(map);

      // Enhanced popup content for live data
      const createPopupContent = (float: any) => {
        const isLiveData = float.platform && float.wmo; // Check if it's live data
        const displayName = float.name || `Float ${float.platform || float.id}`;
        const displayId = float.platform || float.wmo || float.id;

        let measurementsHtml = '';
        if (isLiveData && float.lastProfile?.measurements) {
          const measurements = float.lastProfile.measurements;
          measurementsHtml = `
            <div style="margin-top: 8px; padding: 6px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px;">
              <div style="font-size: 11px; color: #0c4a6e; font-weight: bold; margin-bottom: 4px;">Latest Measurements:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 10px;">
                ${measurements.temperature ? `<div style="color: #0c4a6e;">Temp: ${measurements.temperature[0]?.toFixed(1) || 'N/A'}°C</div>` : ''}
                ${measurements.salinity ? `<div style="color: #0c4a6e;">Sal: ${measurements.salinity[0]?.toFixed(2) || 'N/A'} PSU</div>` : ''}
                ${measurements.oxygen ? `<div style="color: #0c4a6e;">O₂: ${measurements.oxygen[0]?.toFixed(1) || 'N/A'} μmol/kg</div>` : ''}
                ${measurements.ph ? `<div style="color: #0c4a6e;">pH: ${measurements.ph[0]?.toFixed(2) || 'N/A'}</div>` : ''}
              </div>
            </div>
          `;
        }

        return `
          <div style="font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
              ${displayName}
              ${isLiveData ? '<span style="font-size: 10px; padding: 1px 4px; background: #ef4444; color: white; border-radius: 8px;">LIVE</span>' : ''}
            </h3>
            <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
              <strong>ID:</strong> ${displayId}
            </p>
            <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
              <strong>Type:</strong> ${float.type.toUpperCase()}
            </p>
            <p style="margin: 2px 0; font-size: 12px; color: #6b7280;">
              <strong>Position:</strong> ${float.lat.toFixed(4)}°N, ${float.lng.toFixed(4)}°E
            </p>
            ${isLiveData && float.country ? `<p style="margin: 2px 0; font-size: 12px; color: #6b7280;"><strong>Country:</strong> ${float.country}</p>` : ''}
            ${measurementsHtml}
            <div style="margin-top: 8px; padding: 4px 8px; background-color: ${isLiveData ? '#fef3c7' : '#f0fdf4'}; border-radius: 4px;">
              <span style="font-size: 10px; color: ${isLiveData ? '#d97706' : '#16a34a'};">● ${isLiveData ? 'LIVE DATA' : 'STATIC DATA'}</span>
            </div>
          </div>
        `;
      };

      marker.bindPopup(createPopupContent(float), {
        maxWidth: 280,
        className: 'argo-popup'
      });

      // Add hover effects
      marker.on('mouseover', function() {
        this.openPopup();
      });

      marker.on('mouseout', function() {
        setTimeout(() => {
          this.closePopup();
        }, 2000);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className={`rounded-xl overflow-hidden ${className}`}
    />
  );
};

export default SimpleMap;