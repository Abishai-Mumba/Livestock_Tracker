import { useContext, createContext, useState } from "react";

const MapContext = createContext();
export const useMapContext = () => {
  return useContext(MapContext);
};

export const MapContextProvider = ({ children }) => {
    const [drawing, setDrawing] = useState(false);
    const [currentPolygon, setCurrentPolygon] = useState([]);
    const [polygons, setPolygons] = useState([]);

    const isDrawing = (value) => {
        setDrawing(value);
    };

    const addCurrentPolygon = (polygon) => {
        setCurrentPolygon(polygon);
    }

    const addPolygons = (polygons) => {
        setPolygons(polygons);
    };
    
    const value = {
        drawing,
        isDrawing,
        currentPolygon,
        addCurrentPolygon,
        polygons,
        addPolygons
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>  
};