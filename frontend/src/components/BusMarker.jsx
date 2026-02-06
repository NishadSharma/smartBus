import { Marker } from "react-leaflet";
import L from "leaflet";

// A divIcon lets us use HTML + CSS animations
const busIcon = L.divIcon({
  className: "bus-marker-icon",
  html: `
    <div class="bus-marker-wrap">
      <div class="bus-marker-pulse"></div>
      <div class="bus-marker-emoji">🚌</div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export default function BusMarker({ position, children, eventHandlers }) {
  return (
    <Marker position={position} icon={busIcon} eventHandlers={eventHandlers}>
      {children}
    </Marker>
  );
}
