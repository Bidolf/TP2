import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import ChecklistIcon from "@mui/icons-material/Checklist";
import {Flag, People, Person} from "@mui/icons-material";
import EggAltIcon from '@mui/icons-material/EggAlt';


const LINKS = [
    {text: 'Home', href: '/', icon: HomeIcon},
    {text: 'Sightings', href: '/sightings', icon: EggAltIcon },
    {text: 'Ufo Shapes', href: '/ufo_shapes', icon: EggAltIcon },
    {text: 'Players', href: '/players', icon: Person },
    {text: 'Teams', href: '/teams', icon: People},
    {text: 'Countries', href: '/countries', icon: Flag },
];
export default LINKS;