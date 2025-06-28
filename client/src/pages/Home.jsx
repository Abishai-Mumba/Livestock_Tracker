import { BellRing, MapPinned, ChartSpline } from 'lucide-react'


//components
import Navbar from '../components/Navbar'
import PageContainer from '../components/PageContainer'
import Sidebar from '../components/Sidebar'
import Map from '../components/Map'

//context
import { MapContextProvider, useMapContext } from '../contexts/MapContext'
import PolygonDrawButton from '../components/PolygonDrawButton'

function HomeContent() {
  // This is the main home page component that renders the Navbar, Sidebar, and Map components.
  const { drawing, isDrawing, addCurrentPolygon } = useMapContext();
  return (
    <>
      <Navbar />
      <PageContainer>
        <Sidebar tooltips={['Database Icon', 'Bell Icon', 'Map Icon', 'Stats Icon']}>
          <PolygonDrawButton drawing={drawing}
            onClick={() => {
              isDrawing((d) => !d);
              addCurrentPolygon([]);
            }}
          />
          <BellRing />
          <MapPinned />
          <ChartSpline />
        </Sidebar>
        <Map />
      </PageContainer>
    </>
  )
}

export default function Home() {
  return (
    <MapContextProvider>
      <HomeContent />
    </MapContextProvider>
  );
}
