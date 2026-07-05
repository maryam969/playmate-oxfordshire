import type { IconType } from "react-icons";
import { IoBasketballOutline, IoFootballOutline, IoTennisballOutline } from "react-icons/io5";
import { GiShuttlecock } from "react-icons/gi";
import { MdSportsTennis } from "react-icons/md";

const sportIconByName: Record<string, IconType> = {
  football: IoFootballOutline,
  tennis: IoTennisballOutline,
  basketball: IoBasketballOutline,
  badminton: GiShuttlecock,
  padel: MdSportsTennis,
};

export function getSportIcon(sportName: string): IconType {
  return sportIconByName[sportName.toLowerCase()] ?? IoFootballOutline;
}