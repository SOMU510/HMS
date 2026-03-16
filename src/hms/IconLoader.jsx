import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
// ...import other needed icons

const iconsMap = {
  Dashboard: DashboardIcon,
  CreditCard: CreditCardIcon,
  PersonOutline: PersonOutlineIcon,
  // ...other mappings
};

const DefaultIcon = PersonOutlineIcon;

const IconLoader = ({ iconName }) => {
  if (!iconName) return <DefaultIcon />;
  const IconComponent = iconsMap[iconName];
  return IconComponent ? <IconComponent /> : <DefaultIcon />;
};

export default IconLoader;
