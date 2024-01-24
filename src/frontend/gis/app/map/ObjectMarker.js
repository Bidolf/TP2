"use client"
import {Avatar, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import FlagIcon from '@mui/icons-material/Flag';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import ContactsIcon from '@mui/icons-material/Contacts';
import React from "react";
import {Marker, Popup} from 'react-leaflet';
import {icon as leafletIcon, point} from "leaflet";

const LIST_PROPERTIES = [
    {"key": "date_encounter", label: "Date", Icon: FlagIcon},
    {"key": "time_encounter", label: "Time", Icon: FlagIcon},
    {"key": "duration", label: "Duration", Icon: FlagIcon},
    {"key": "country", label: "Country", Icon: FlagIcon},
    {"key": "region", label: "Region", Icon: FlagIcon},
    {"key": "locale", label: "Locale", Icon: FlagIcon},
    {"key": "shape", label: "Shape", Icon: FlagIcon},
    {"key": "description", label: "Description", Icon: FlagIcon},
];

export function ObjectMarker({geoJSON}) {
    const properties = geoJSON?.properties
    const shape = properties.shape;
    const coordinates = geoJSON?.geometry?.coordinates;
    const imgUrl = "https://cdn-icons-png.flaticon.com/512/805/805401.png"

   const jsxString = `
    <Marker
      position={${JSON.stringify(coordinates)}}
      icon={leafletIcon({
        iconUrl: "${imgUrl}",
        iconRetinaUrl: "${imgUrl}",
        iconSize: point(50, 50),
      })}
    >
      <Popup>
        <ObjectMarker geoJSON={{ properties: ${JSON.stringify(properties)}, geometry: { coordinates: ${JSON.stringify(coordinates)} } }} />
      </Popup>
    </Marker>
  `;

  // Log the JSX structure
  console.log(jsxString);
    return (
        <Marker
            position={coordinates}
            icon={leafletIcon({
                iconUrl: imgUrl,
                iconRetinaUrl: imgUrl,
                iconSize: point(50, 50),
            })}
        >
            <Popup>
                <List dense={true}>
                    <ListItem>
                        <ListItemIcon>
                            <Avatar src={imgUrl}/>
                        </ListItemIcon>
                        <ListItemText primary={shape}/>
                    </ListItem>
                    {
                        LIST_PROPERTIES
                            .map(({key, label, Icon}) =>
                                <ListItem key={key}>
                                    <ListItemIcon>
                                        <Icon style={{color: "black"}}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<span>
                                        {properties[key]}<br/>
                                        <label style={{fontSize: "xx-small"}}>({label})</label>
                                    </span>}
                                    />
                                </ListItem>
                            )
                    }

                </List>

            </Popup>
        </Marker>
    )
}