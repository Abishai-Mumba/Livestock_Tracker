import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polygon } from "react-leaflet";
import { useMapContext } from "../contexts/MapContext";
import "leaflet/dist/leaflet.css";
import { io } from 'socket.io-client'
import { useRef } from "react";
import L from "leaflet";

// Custom component to center map
function CenterOnUserLocation() {
  const map = useMap();

  useEffect(() => { 
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 20);
      },
      (error) => {
        console.error("Error getting location: ", error);
      }
    );
  }, [map]);

  return null;
}

// Component to handle polygon drawing
function PolygonDrawer() {
  const { drawing, isDrawing, currentPolygon, addCurrentPolygon, addPolygons } = useMapContext();
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (!drawing) return;
      addCurrentPolygon((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, drawing]);

  // Double click to finish polygon
  useEffect(() => {
    if (!map) return;

    const handleDblClick = () => {
      if (drawing && currentPolygon.length > 2) {
        addPolygons((prev) => [...prev, currentPolygon]);
        addCurrentPolygon([]);
        isDrawing(false);
      }
    };

    map.on("dblclick", handleDblClick);

    return () => {
      map.off("dblclick", handleDblClick);
    };
  }, [map, drawing, currentPolygon, addPolygons, isDrawing]);

  return (
    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
      {drawing && (
        <div style={{ color: "#fff", background: "#000a", padding: "4px 8px", borderRadius: "4px" }}>
          Click to add points. Double-click to finish.
        </div>
      )}
      {/* Render the polygon being drawn */}
      {drawing && currentPolygon.length > 1 && (
        <Polygon positions={currentPolygon} pathOptions={{ color: "red" }} />
      )}
    </div>
  );
}

// Live GPS Data Markers by animal_id
function LiveDataMarkers() {
  const [animals, setAnimals] = useState({});
  const markerRefs = useRef({});

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("gps_data", (data) => {
      setAnimals((prev) => ({
        ...prev,
        [data.animal_id]: { lat: data.lat, lon: data.lon, timestamp: data.timestamp },
      }));
    });
    return () => socket.disconnect();
  }, []);

  // Animate marker movement
  useEffect(() => {
    Object.entries(animals).forEach(([id, data]) => {
      const marker = markerRefs.current[id];
      if (marker) {
        const currentPos = marker.getLatLng();
        const newPos = L.latLng(data.lat, data.lon);
        if (!currentPos.equals(newPos)) {
          marker.setLatLng(newPos, { animate: true });
        }
      }
    });
  }, [animals]);

  return (
    <>
      {Object.entries(animals).map(([id, data]) => (
        <Marker
          key={id}
          position={[data.lat, data.lon]}
          ref={(ref) => {
            if (ref) markerRefs.current[id] = ref;
          }}
        >
          <Popup>
            <b>Animal {id}</b><br />
            Lat: {data.lat}<br />
            Lon: {data.lon}<br />
            At: {new Date(data.timestamp).toLocaleTimeString()}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Your main map component
export default function Map() {
  const defaultPosition = [-15.3875, 28.3228]; // Lusaka coordinates

  const { polygons } = useMapContext();

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultPosition}
        zoom={20}
        className="h-full w-full rounded-3xl border-2 border-gray-300"
        style={{ height: "100%", width: "100%" }}
      >
        <CenterOnUserLocation />
        
        {/* Render saved polygons */}
        {polygons.map((polygon, idx) => (
          <Polygon key={idx} positions={polygon} pathOptions={{ color: "blue" }} />
        ))}
        {/* Polygon drawing controls */}
        <PolygonDrawer />
        {/* Live animal GPS markers */}
        <LiveDataMarkers />
        <TileLayer
          className="relative"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
}
