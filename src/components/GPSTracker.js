import "./GPSTracker.css";

function GPSTracker() {
  return (
    <div className="gps">
      <h3>GPS Tracker</h3>
      <iframe
        title="gps"
        src="https://maps.google.com/maps?q=chennai&z=13&output=embed"
      ></iframe>
    </div>
  );
}

export default GPSTracker;
