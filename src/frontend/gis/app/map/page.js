"use client"
import React from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import ObjectMarkersGroup from "./ObjectMarkersGroup";

function Page() {
    return (
        <MapContainer style={{width: "100%", height: "calc(100vh - 64px)"}}
                      center={[35, -95]}
                      zoom={4}
                      scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ObjectMarkersGroup/>
        </MapContainer>
    );
}

export default Page;