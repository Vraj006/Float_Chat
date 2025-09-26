"""
Parameter Extractor for Three-Layer Query Architecture
Extracts numerical values, geographic regions, and oceanographic parameters from queries
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass

@dataclass
class ExtractedParameters:
    """Container for extracted query parameters"""
    oxygen_conditions: Dict[str, Any] = None
    chlorophyll_conditions: Dict[str, Any] = None
    ph_conditions: Dict[str, Any] = None
    nitrate_conditions: Dict[str, Any] = None
    latitude_range: Tuple[float, float] = None
    longitude_range: Tuple[float, float] = None
    depth_range: Tuple[float, float] = None
    platform_types: List[str] = None
    projects: List[str] = None
    regions: List[str] = None
    temporal_conditions: Dict[str, Any] = None
    profile_count: Optional[int] = None
    mobility_threshold: Optional[float] = None

    def has_parameters(self) -> bool:
        """Check if any parameters were extracted"""
        return any([
            self.oxygen_conditions,
            self.chlorophyll_conditions,
            self.ph_conditions,
            self.nitrate_conditions,
            self.latitude_range,
            self.longitude_range,
            self.platform_types,
            self.projects,
            self.regions
        ])

class QueryParameterExtractor:
    """Extracts specific parameters from natural language oceanographic queries"""

    def __init__(self):
        """Initialize with oceanographic parameter patterns"""

        # Ocean regions mapping
        self.ocean_regions = {
            "bay of bengal": {"lat": (5, 22), "lon": (80, 95)},
            "arabian sea": {"lat": (0, 25), "lon": (50, 78)},
            "southern ocean": {"lat": (-90, -60), "lon": (-180, 180)},
            "indian ocean": {"lat": (-60, 30), "lon": (20, 150)},
            "equatorial": {"lat": (-10, 10)},
            "subtropical": {"lat": (23, 35)},
            "temperate": {"lat": (35, 55)},
            "subpolar": {"lat": (55, 70)},
            "antarctic": {"lat": (-90, -60)},
            "northern indian ocean": {"lat": (0, 30), "lon": (40, 100)},
            "central indian ocean": {"lat": (-30, 30), "lon": (60, 100)},
            "eastern indian ocean": {"lat": (-40, 20), "lon": (90, 120)},
            "western indian ocean": {"lat": (-40, 20), "lon": (30, 70)}
        }

        # Platform types
        self.platform_types = ["APEX", "SOLO_BGC_MRV", "NAVIS_A", "NAVIS_EBR", "PROVOR"]

        # Projects
        self.projects = ["GO-BGC", "SOCCOM", "USARGOPROJECT", "WHOI", "UW", "Argoequivalent"]

        # Column mappings
        self.column_mappings = {
            "oxygen": ["doxy", "doxy_adjusted"],
            "chlorophyll": ["chla"],
            "ph": ["ph_in_situ_total"],
            "nitrate": ["nitrate"],
            "temperature": ["temperature_c", "temperature", "temp"],
            "salinity": ["salinity_psu", "salinity", "salt"],
            "pressure": ["pressure_dbar", "pressure", "depth"],
            "latitude": ["latitude", "lat"],
            "longitude": ["longitude", "lon", "long"]
        }

    def extract_all_parameters(self, query: str) -> ExtractedParameters:
        """Extract all relevant parameters from query"""
        query_lower = query.lower()
        params = ExtractedParameters()

        # Extract oxygen conditions
        params.oxygen_conditions = self._extract_oxygen_conditions(query_lower)

        # Extract chlorophyll conditions
        params.chlorophyll_conditions = self._extract_chlorophyll_conditions(query_lower)

        # Extract pH conditions
        params.ph_conditions = self._extract_ph_conditions(query_lower)

        # Extract nitrate conditions
        params.nitrate_conditions = self._extract_nitrate_conditions(query_lower)

        # Extract geographic parameters
        params.latitude_range, params.longitude_range = self._extract_coordinates(query_lower)

        # Extract depth/pressure
        params.depth_range = self._extract_depth_range(query_lower)

        # Extract platform types
        params.platform_types = self._extract_platforms(query)  # Use original case

        # Extract projects
        params.projects = self._extract_projects(query)  # Use original case

        # Extract regions
        params.regions = self._extract_regions(query_lower)

        # Extract profile count requirements
        params.profile_count = self._extract_profile_count(query_lower)

        # Extract mobility threshold
        params.mobility_threshold = self._extract_mobility(query_lower)

        return params

    def _extract_oxygen_conditions(self, query: str) -> Optional[Dict[str, Any]]:
        """Extract oxygen concentration conditions"""
        conditions = {}

        # Pattern for "oxygen below X"
        below_pattern = r"oxygen\s+(?:below|less\s+than|<)\s+(\d+(?:\.\d+)?)"
        match = re.search(below_pattern, query)
        if match:
            conditions["max"] = float(match.group(1))

        # Pattern for "oxygen above X"
        above_pattern = r"oxygen\s+(?:above|greater\s+than|>)\s+(\d+(?:\.\d+)?)"
        match = re.search(above_pattern, query)
        if match:
            conditions["min"] = float(match.group(1))

        # Pattern for "oxygen between X and Y"
        between_pattern = r"oxygen\s+(?:between|from)\s+(\d+(?:\.\d+)?)\s+(?:and|to)\s+(\d+(?:\.\d+)?)"
        match = re.search(between_pattern, query)
        if match:
            conditions["min"] = float(match.group(1))
            conditions["max"] = float(match.group(2))

        # Check for specific conditions
        if "hypoxic" in query or "hypoxia" in query:
            if "severe" in query:
                conditions["max"] = 20
            else:
                conditions["max"] = 50

        if "oxygen minimum zone" in query or "omz" in query:
            conditions["max"] = 50

        if "oxygen saturation" in query or "saturated" in query:
            conditions["min"] = 300

        return conditions if conditions else None

    def _extract_chlorophyll_conditions(self, query: str) -> Optional[Dict[str, Any]]:
        """Extract chlorophyll concentration conditions"""
        conditions = {}

        # Pattern for chlorophyll values
        patterns = [
            r"chlorophyll\s+(?:above|greater\s+than|>|peaks?\s+above)\s+(\d+(?:\.\d+)?)",
            r"chlorophyll\s+(?:below|less\s+than|<)\s+(\d+(?:\.\d+)?)",
            r"chl[a]?\s+[<>]\s*(\d+(?:\.\d+)?)"
        ]

        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                value = float(match.group(1))
                if "above" in pattern or "greater" in pattern or ">" in pattern:
                    conditions["min"] = value
                else:
                    conditions["max"] = value

        # Check for bloom conditions
        if "bloom" in query or "high productivity" in query:
            conditions["min"] = 2.0
        elif "oligotrophic" in query:
            conditions["max"] = 0.3
        elif "mesotrophic" in query:
            conditions["min"] = 0.3
            conditions["max"] = 1.0
        elif "eutrophic" in query:
            conditions["min"] = 1.0

        return conditions if conditions else None

    def _extract_ph_conditions(self, query: str) -> Optional[Dict[str, Any]]:
        """Extract pH conditions"""
        conditions = {}

        # Pattern for pH values
        ph_pattern = r"ph\s+(?:below|less\s+than|<)\s+(\d+(?:\.\d+)?)"
        match = re.search(ph_pattern, query)
        if match:
            conditions["max"] = float(match.group(1))

        # Check for acidification
        if "acidification" in query or "acidified" in query:
            if "severe" in query:
                conditions["max"] = 7.8
            elif "significant" in query:
                conditions["max"] = 7.9
            else:
                conditions["max"] = 8.0

        return conditions if conditions else None

    def _extract_nitrate_conditions(self, query: str) -> Optional[Dict[str, Any]]:
        """Extract nitrate concentration conditions"""
        conditions = {}

        nitrate_pattern = r"nitrate\s+(?:above|below|greater|less)\s+(?:than\s+)?(\d+(?:\.\d+)?)"
        match = re.search(nitrate_pattern, query)
        if match:
            value = float(match.group(1))
            if "above" in query or "greater" in query:
                conditions["min"] = value
            else:
                conditions["max"] = value

        if "nutrient" in query:
            if "rich" in query:
                conditions["min"] = 20
            elif "limited" in query or "depleted" in query:
                conditions["max"] = 5

        return conditions if conditions else None

    def _extract_coordinates(self, query: str) -> Tuple[Optional[Tuple[float, float]], Optional[Tuple[float, float]]]:
        """Extract latitude and longitude ranges"""
        lat_range = None
        lon_range = None

        # Pattern for latitude ranges
        lat_patterns = [
            r"(?:between\s+)?(\d+(?:\.\d+)?)\s*°?\s*[NS]?\s+(?:to|and|-)\s+(\d+(?:\.\d+)?)\s*°?\s*[NS]",
            r"(?:latitude|lat)\s+(?:between\s+)?(-?\d+(?:\.\d+)?)\s+(?:to|and)\s+(-?\d+(?:\.\d+)?)",
            r"(?:below|south\s+of)\s+(\d+(?:\.\d+)?)\s*°?\s*S",
            r"(?:above|north\s+of)\s+(\d+(?:\.\d+)?)\s*°?\s*N",
            r"(\d+)-(\d+)\s*°?\s*[NS]"
        ]

        for pattern in lat_patterns:
            match = re.search(pattern, query)
            if match:
                if "below" in pattern or "south" in pattern:
                    lat_range = (-90, -float(match.group(1)))
                elif "above" in pattern or "north" in pattern:
                    lat_range = (float(match.group(1)), 90)
                else:
                    val1 = float(match.group(1))
                    val2 = float(match.group(2))
                    # Handle N/S indicators
                    if "S" in query[match.start():match.end()]:
                        val1, val2 = -abs(val1), -abs(val2)
                    lat_range = (min(val1, val2), max(val1, val2))
                break

        # Pattern for longitude ranges
        lon_patterns = [
            r"(\d+(?:\.\d+)?)\s*°?\s*[EW]?\s+(?:to|and|-)\s+(\d+(?:\.\d+)?)\s*°?\s*[EW]",
            r"(?:longitude|lon)\s+(?:between\s+)?(-?\d+(?:\.\d+)?)\s+(?:to|and)\s+(-?\d+(?:\.\d+)?)",
            r"(?:east\s+of)\s+(\d+(?:\.\d+)?)\s*°?\s*E",
            r"(?:west\s+of)\s+(\d+(?:\.\d+)?)\s*°?\s*W",
            r"(\d+)-(\d+)\s*°?\s*[EW]"
        ]

        for pattern in lon_patterns:
            match = re.search(pattern, query)
            if match:
                if "east of" in pattern:
                    lon_range = (float(match.group(1)), 180)
                elif "west of" in pattern:
                    lon_range = (-180, -float(match.group(1)))
                else:
                    val1 = float(match.group(1))
                    val2 = float(match.group(2))
                    # Handle E/W indicators
                    if "W" in query[match.start():match.end()]:
                        val1, val2 = -abs(val1), -abs(val2)
                    lon_range = (min(val1, val2), max(val1, val2))
                break

        return lat_range, lon_range

    def _extract_depth_range(self, query: str) -> Optional[Tuple[float, float]]:
        """Extract depth or pressure range"""
        depth_pattern = r"(?:depth|pressure)\s+(?:between\s+)?(\d+(?:\.\d+)?)\s+(?:to|and)\s+(\d+(?:\.\d+)?)"
        match = re.search(depth_pattern, query)
        if match:
            return (float(match.group(1)), float(match.group(2)))

        if "surface" in query:
            return (0, 50)
        elif "deep" in query:
            return (1000, 6000)

        return None

    def _extract_platforms(self, query: str) -> Optional[List[str]]:
        """Extract platform types from query"""
        platforms = []
        for platform in self.platform_types:
            if platform in query or platform.lower() in query.lower():
                platforms.append(platform)
        return platforms if platforms else None

    def _extract_projects(self, query: str) -> Optional[List[str]]:
        """Extract project names from query"""
        projects = []
        for project in self.projects:
            if project in query or project.lower() in query.lower():
                projects.append(project)
        return projects if projects else None

    def _extract_regions(self, query: str) -> Optional[List[str]]:
        """Extract ocean regions from query"""
        regions = []
        for region_name in self.ocean_regions.keys():
            if region_name in query:
                regions.append(region_name)
        return regions if regions else None

    def _extract_profile_count(self, query: str) -> Optional[int]:
        """Extract profile count requirements"""
        profile_pattern = r"(?:more\s+than|over|>\s*)(\d+)\s+profiles?"
        match = re.search(profile_pattern, query)
        if match:
            return int(match.group(1))
        return None

    def _extract_mobility(self, query: str) -> Optional[float]:
        """Extract mobility/drift threshold"""
        mobility_patterns = [
            r"(?:mobility|drift|movement|changes?)\s+(?:of\s+)?(?:more\s+than|over|exceeding|>)\s+(\d+(?:\.\d+)?)\s*°",
            r"(?:moved|drifted|traveled)\s+(?:more\s+than|over)\s+(\d+(?:\.\d+)?)\s*°",
            r"(\d+(?:\.\d+)?)\s*°\s+(?:longitude|latitude|movement|drift)"
        ]

        for pattern in mobility_patterns:
            match = re.search(pattern, query)
            if match:
                return float(match.group(1))

        if "extensive mobility" in query:
            return 10.0
        elif "localized movement" in query or "eddy trap" in query:
            return 2.0

        return None

    def parameters_to_sql_conditions(self, params: ExtractedParameters) -> Dict[str, Any]:
        """Convert extracted parameters to SQL-ready conditions"""
        sql_conditions = {}

        # Oxygen conditions
        if params.oxygen_conditions:
            sql_conditions["doxy"] = params.oxygen_conditions

        # Chlorophyll conditions
        if params.chlorophyll_conditions:
            sql_conditions["chla"] = params.chlorophyll_conditions

        # pH conditions
        if params.ph_conditions:
            sql_conditions["ph_in_situ_total"] = params.ph_conditions

        # Nitrate conditions
        if params.nitrate_conditions:
            sql_conditions["nitrate"] = params.nitrate_conditions

        # Geographic conditions
        if params.latitude_range:
            sql_conditions["latitude"] = {
                "min": params.latitude_range[0],
                "max": params.latitude_range[1]
            }

        if params.longitude_range:
            sql_conditions["longitude"] = {
                "min": params.longitude_range[0],
                "max": params.longitude_range[1]
            }

        # Platform filter
        if params.platform_types:
            sql_conditions["platform_type"] = {"in": params.platform_types}

        # Project filter
        if params.projects:
            sql_conditions["project_name"] = {"in": params.projects}

        # Profile count (needs special handling)
        if params.profile_count:
            sql_conditions["_profile_count"] = {"min": params.profile_count}

        return sql_conditions