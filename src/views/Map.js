import React, { useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db, collection, getDocs } from "../firebase";  // Firebase imports
import phMap from '../ph.json';  // Import the GeoJSON file for the Philippine map

const MapWrapper = () => {
  const mapRef = useRef(null);
  const [choroplethData, setChoroplethData] = useState({});  // Store choropleth data
  const [geoData, setGeoData] = useState(null);  // Store GeoJSON data

  useEffect(() => {
    // Set GeoJSON data when the component mounts
    setGeoData(phMap);  // You can replace phMap with a dynamic fetch if needed

    const fetchCSVData = async () => {
      // Fetch data from Firebase (CSV data stored in Firestore)
      const querySnapshot = await getDocs(collection(db, "csv_data"));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());  // Assuming the document contains Region, cases, deaths, etc.
      });

      // Log the fetched CSV data for debugging
      console.log("Fetched CSV Data:", data);

      // Aggregate cases and deaths by region
      const choroplethMapping = data.reduce((acc, row) => {
        const region = row.Region.trim();  // Get the region name from the CSV data and trim any spaces
        const cases = parseInt(row.cases) || 0;  // Convert cases to integer
        const deaths = parseInt(row.deaths) || 0;  // Convert deaths to integer

        // Log each row's region and case count for debugging
        console.log(`Region: ${region}, Cases: ${cases}, Deaths: ${deaths}`);

        // If the region already exists, add the new cases and deaths to the existing totals
        if (acc[region]) {
          acc[region].cases += cases;
          acc[region].deaths += deaths;
        } else {
          acc[region] = { cases, deaths };
        }

        return acc;
      }, {});

      // Log the aggregated data for debugging
      console.log("Aggregated Choropleth Data:", choroplethMapping);

      setChoroplethData(choroplethMapping);  // Update state with aggregated data
    };

    fetchCSVData();  // Call the function to fetch the data
  }, []);  // Only run once when the component mounts

  useEffect(() => {
    if (!mapRef.current || !geoData || Object.keys(choroplethData).length === 0) return;  // Ensure data is loaded

    const mapContainer = mapRef.current;
    const map = L.map(mapContainer, {
      center: [12.8797, 121.7740], // Center on the Philippines
      zoom: 6
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Function to style GeoJSON based on case data
    const style = (feature) => {
      const region = feature.properties.name.trim();  // Get region name from GeoJSON feature properties
      const cases = choroplethData[region]?.cases || 0;  // Fetch the case count or 0 if not available
      let color = "#fff";

      // Color coding based on case numbers (density scale)
      if (cases >= 50000) color = "#800026"; // Very high density
      else if (cases >= 40000) color = "#BD0026";
      else if (cases >= 30000) color = "#E31A1C";
      else if (cases >= 20000) color = "#FC4E2A";
      else if (cases >= 10000) color = "#FD8D3C";
      else color = "#FEB24C"; // Low density

      return {
        fillColor: color,
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
      };
    };

    // Function to handle GeoJSON features and show popups
    const onEachFeature = (feature, layer) => {
      const region = feature.properties.name.trim();  // Get region name from GeoJSON feature
      const data = choroplethData[region] || { cases: 0, deaths: 0 };  // Fetch data for the region
      layer.bindPopup(`
        <b>${region}</b><br>
        Total Cases: ${data.cases}<br>
        Total Deaths: ${data.deaths}
      `);
    };

    // Add GeoJSON to the map with the correct style and popup
    L.geoJSON(geoData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    // Cleanup map on component unmount
    return () => {
      if (map) map.remove();
    };
  }, [choroplethData, geoData]);  // Re-run this effect only when choroplethData or geoData changes

  return <div style={{ height: "900px", width: "100%" }} ref={mapRef}></div>;
};

function Map() {
  return (
    <div className="content">
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>Philippine Choropleth Map</CardHeader>
            <CardBody>
              <MapWrapper />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Map;
