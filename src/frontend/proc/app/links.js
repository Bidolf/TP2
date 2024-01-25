import HomeIcon from "@mui/icons-material/Home";
import {People} from "@mui/icons-material";

const LINKS = [
  { text: 'Home', href: '/', icon: HomeIcon },
  { text: 'Test Connection', href: '/TestConnection', icon: People },
  { text: 'Add File', href: '/Addfile', icon: People },
  { text: 'Delete File', href: '/Deletefile', icon: People},
  { text: 'Sightings Year', href: '/GetSightingsYear', icon: People},
  { text: 'Sightings Group By Year', href: '/GetSightingsbyYear', icon: People},
  { text: 'Retrieve Shape Month [Group by File]', href: '/RShapeMonth', icon: People},
  { text: 'Retrieve Year Region', href: '/RYearRegion', icon: People},
  { text: 'Retrieve Shape Region [Group by File]', href: '/RShapeRegion', icon: People}
];
export default LINKS;