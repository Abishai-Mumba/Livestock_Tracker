import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Polygon } from "react-leaflet";
import { useMapContext } from "../contexts/MapContext";
import "leaflet/dist/leaflet.css";


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

// Exportable button component


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

// Your main map component
export default function Map() {
  const defaultPosition = [-15.3875, 28.3228]; // Lusaka coordinates

  const markers = [
    {
      geocode: [-15.4067, 28.2871],
      name: "Chilenje",
    },
    {
      geocode: [-15.3875, 28.3228],
      name: "Kalingalinga",
    },
    {
      geocode: [-15.3300, 28.3300],
      name: "Kabulonga",
    },
    {
      geocode: [-15.4000, 28.3500],
      name: "Libala",
    },
    {
      geocode: [-15.4200, 28.3100],
      name: "Makeni",
    },
    {
      geocode: [-15.4100, 28.3400],
      name: "Meanwood",
    },
    {
      geocode: [-15.3950, 28.3000],
      name: "Mtendere",
    },
    {
      geocode: [-15.3800, 28.3600],
      name: "Northmead",
    },
  ];

  const {polygons} = useMapContext();

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultPosition}
        zoom={20}
        className="h-full w-full rounded-3xl border-2 border-gray-300"
        style={{ height: "100%", width: "100%" }}
      >
        <CenterOnUserLocation />
        {
          markers.map((marker, index) => (
            <Marker position={marker.geocode} key={index}>
              <Popup>{marker.name}</Popup>
            </Marker>
          ))
        }
        {/* Render saved polygons */}
        {polygons.map((polygon, idx) => (
          <Polygon key={idx} positions={polygon} pathOptions={{ color: "blue" }} />
        ))}
        {/* Polygon drawing controls */}
        <PolygonDrawer
        />
        <TileLayer
          className="relative"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
}
