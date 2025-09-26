"""
Visualization module for FloatChat application.
Creates oceanographic plots and charts for Argo float data.
"""

import io
import base64
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime


class OceanographicPlotter:
    """Creates various oceanographic visualizations for Argo float data."""

    def __init__(self):
        """Initialize the plotter with default settings."""
        plt.style.use('seaborn-v0_8' if 'seaborn-v0_8' in plt.style.available else 'default')
        self.default_figsize = (8, 6)
        self.default_dpi = 150

    def create_salinity_profile_plot(
        self,
        rows: List[Dict[str, Any]],
        title: str = "Salinity Profile",
        max_profiles: int = 10
    ) -> Optional[str]:
        """
        Create salinity vs depth profile plot.

        Args:
            rows: List of data rows containing pressure and salinity data
            title: Plot title
            max_profiles: Maximum number of profiles to plot

        Returns:
            Base64 encoded PNG image or None if no valid data
        """
        plt.figure(figsize=self.default_figsize)

        profiles_plotted = 0
        colors = plt.cm.viridis(np.linspace(0, 1, min(len(rows), max_profiles)))

        for i, row in enumerate(rows[:max_profiles]):
            pressure = row.get("pressure_dbar") or row.get("pressure") or row.get("depth")
            salinity = row.get("salinity_psu") or row.get("salinity") or row.get("salt")

            if not pressure or not salinity:
                continue

            # Convert to numpy arrays
            try:
                pressure_arr = np.array(pressure) if isinstance(pressure, list) else np.array([pressure])
                salinity_arr = np.array(salinity) if isinstance(salinity, list) else np.array([salinity])

                if len(pressure_arr) >= 2 and len(pressure_arr) == len(salinity_arr):
                    plt.plot(
                        salinity_arr, pressure_arr,
                        color=colors[i],
                        marker='.',
                        markersize=2,
                        linewidth=0.8,
                        alpha=0.7,
                        label=f"Profile {i+1}" if len(rows) <= 5 else None
                    )
                    profiles_plotted += 1

            except (ValueError, TypeError):
                continue

        if profiles_plotted == 0:
            plt.close()
            return None

        # Invert y-axis (depth increases downward)
        plt.gca().invert_yaxis()

        # Labels and formatting
        plt.xlabel("Salinity (PSU)", fontsize=12)
        plt.ylabel("Pressure (dbar) / Depth (m)", fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        if len(rows) <= 5 and profiles_plotted > 1:
            plt.legend(fontsize=10)

        plt.tight_layout()

        return self._save_plot_to_base64()

    def create_temperature_profile_plot(
        self,
        rows: List[Dict[str, Any]],
        title: str = "Temperature Profile",
        max_profiles: int = 10
    ) -> Optional[str]:
        """
        Create temperature vs depth profile plot.

        Args:
            rows: List of data rows containing pressure and temperature data
            title: Plot title
            max_profiles: Maximum number of profiles to plot

        Returns:
            Base64 encoded PNG image or None if no valid data
        """
        plt.figure(figsize=self.default_figsize)

        profiles_plotted = 0
        colors = plt.cm.plasma(np.linspace(0, 1, min(len(rows), max_profiles)))

        for i, row in enumerate(rows[:max_profiles]):
            pressure = row.get("pressure_dbar") or row.get("pressure") or row.get("depth")
            temperature = row.get("temperature_c") or row.get("temperature") or row.get("temp")

            if not pressure or not temperature:
                continue

            # Convert to numpy arrays
            try:
                pressure_arr = np.array(pressure) if isinstance(pressure, list) else np.array([pressure])
                temp_arr = np.array(temperature) if isinstance(temperature, list) else np.array([temperature])

                if len(pressure_arr) >= 2 and len(pressure_arr) == len(temp_arr):
                    plt.plot(
                        temp_arr, pressure_arr,
                        color=colors[i],
                        marker='.',
                        markersize=2,
                        linewidth=0.8,
                        alpha=0.7,
                        label=f"Profile {i+1}" if len(rows) <= 5 else None
                    )
                    profiles_plotted += 1

            except (ValueError, TypeError):
                continue

        if profiles_plotted == 0:
            plt.close()
            return None

        # Invert y-axis (depth increases downward)
        plt.gca().invert_yaxis()

        # Labels and formatting
        plt.xlabel("Temperature (°C)", fontsize=12)
        plt.ylabel("Pressure (dbar) / Depth (m)", fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        if len(rows) <= 5 and profiles_plotted > 1:
            plt.legend(fontsize=10)

        plt.tight_layout()

        return self._save_plot_to_base64()

    def create_ts_diagram(
        self,
        rows: List[Dict[str, Any]],
        title: str = "Temperature-Salinity Diagram"
    ) -> Optional[str]:
        """
        Create Temperature-Salinity (T-S) diagram.

        Args:
            rows: List of data rows containing temperature and salinity data
            title: Plot title

        Returns:
            Base64 encoded PNG image or None if no valid data
        """
        plt.figure(figsize=self.default_figsize)

        all_temps = []
        all_salts = []

        for row in rows:
            temperature = row.get("temperature_c") or row.get("temperature") or row.get("temp")
            salinity = row.get("salinity_psu") or row.get("salinity") or row.get("salt")

            if temperature and salinity:
                try:
                    if isinstance(temperature, list) and isinstance(salinity, list):
                        if len(temperature) == len(salinity):
                            all_temps.extend(temperature)
                            all_salts.extend(salinity)
                    else:
                        all_temps.append(float(temperature))
                        all_salts.append(float(salinity))
                except (ValueError, TypeError):
                    continue

        if len(all_temps) == 0:
            plt.close()
            return None

        # Create scatter plot
        plt.scatter(all_salts, all_temps, alpha=0.6, s=10, c='blue', edgecolors='none')

        # Labels and formatting
        plt.xlabel("Salinity (PSU)", fontsize=12)
        plt.ylabel("Temperature (°C)", fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        plt.tight_layout()

        return self._save_plot_to_base64()

    def create_geographic_plot(
        self,
        rows: List[Dict[str, Any]],
        title: str = "Float Locations"
    ) -> Optional[str]:
        """
        Create geographic plot of float positions.

        Args:
            rows: List of data rows containing latitude and longitude data
            title: Plot title

        Returns:
            Base64 encoded PNG image or None if no valid data
        """
        plt.figure(figsize=(10, 6))

        lats = []
        lons = []

        for row in rows:
            latitude = row.get("latitude") or row.get("lat")
            longitude = row.get("longitude") or row.get("lon") or row.get("long")

            if latitude is not None and longitude is not None:
                try:
                    lats.append(float(latitude))
                    lons.append(float(longitude))
                except (ValueError, TypeError):
                    continue

        if len(lats) == 0:
            plt.close()
            return None

        # Create scatter plot
        plt.scatter(lons, lats, alpha=0.7, s=20, c='red', edgecolors='darkred', linewidth=0.5)

        # Labels and formatting
        plt.xlabel("Longitude (°E)", fontsize=12)
        plt.ylabel("Latitude (°N)", fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        # Add coastline-like grid
        plt.axhline(y=0, color='k', linestyle='-', alpha=0.3, linewidth=0.5)
        plt.axvline(x=0, color='k', linestyle='-', alpha=0.3, linewidth=0.5)

        plt.tight_layout()

        return self._save_plot_to_base64()

    def create_time_series_plot(
        self,
        rows: List[Dict[str, Any]],
        y_column: str,
        title: str = "Time Series"
    ) -> Optional[str]:
        """
        Create time series plot for a specified variable.

        Args:
            rows: List of data rows containing date/time and variable data
            y_column: Name of the column to plot on y-axis
            title: Plot title

        Returns:
            Base64 encoded PNG image or None if no valid data
        """
        plt.figure(figsize=(12, 6))

        dates = []
        values = []

        for row in rows:
            # Try different date column names
            date_val = (row.get("date") or row.get("datetime") or
                       row.get("timestamp") or row.get("time"))
            y_val = row.get(y_column)

            if date_val and y_val:
                try:
                    # Convert date string to datetime if needed
                    if isinstance(date_val, str):
                        date_obj = datetime.fromisoformat(date_val.replace('Z', '+00:00'))
                    else:
                        date_obj = date_val

                    dates.append(date_obj)
                    values.append(float(y_val))
                except (ValueError, TypeError):
                    continue

        if len(dates) == 0:
            plt.close()
            return None

        # Sort by date
        sorted_data = sorted(zip(dates, values))
        dates, values = zip(*sorted_data)

        # Create line plot
        plt.plot(dates, values, marker='o', markersize=3, linewidth=1, alpha=0.7)

        # Format x-axis
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=3))
        plt.xticks(rotation=45)

        # Labels and formatting
        plt.xlabel("Date", fontsize=12)
        plt.ylabel(y_column.replace('_', ' ').title(), fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.grid(True, alpha=0.3)

        plt.tight_layout()

        return self._save_plot_to_base64()

    def _save_plot_to_base64(self) -> str:
        """
        Save current matplotlib plot to base64 encoded string.

        Returns:
            Base64 encoded PNG image
        """
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=self.default_dpi, bbox_inches='tight')
        plt.close()
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        buffer.close()

        return image_base64

    def create_multiple_plots(
        self,
        rows: List[Dict[str, Any]],
        plot_types: List[str],
        table_name: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Create multiple plots from the same data.

        Args:
            rows: List of data rows
            plot_types: List of plot types to create
            table_name: Name of the table for titles

        Returns:
            List of plot dictionaries with type, table, and base64 data
        """
        plots = []

        for plot_type in plot_types:
            base64_data = None
            title = f"{plot_type.replace('_', ' ').title()}"
            if table_name:
                title += f" - {table_name}"

            if plot_type == "salinity_profile":
                base64_data = self.create_salinity_profile_plot(rows, title)
            elif plot_type == "temperature_profile":
                base64_data = self.create_temperature_profile_plot(rows, title)
            elif plot_type == "ts_diagram":
                base64_data = self.create_ts_diagram(rows, title)
            elif plot_type == "geographic":
                base64_data = self.create_geographic_plot(rows, title)

            if base64_data:
                plots.append({
                    "type": plot_type,
                    "table": table_name,
                    "title": title,
                    "base64": base64_data
                })

        return plots


# Global plotter instance
plotter = OceanographicPlotter()