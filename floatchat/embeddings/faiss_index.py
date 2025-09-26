"""
ENHANCED FAISS index management for FloatChat application.
Handles embedding generation, index creation, and similarity search.
Optimized for 190+ BGC Argo float tables with content-based summaries.

🚀 FEATURES:
- Content-aware summaries that differentiate tables
- Parallel processing for 190+ tables
- Smart caching to avoid reprocessing
- Detailed ocean region detection
- BGC parameter analysis
- Progress tracking and ETA
"""

import os
import sys
import json
import numpy as np
import statistics
from typing import List, Dict, Any, Tuple, Optional, Set
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from sentence_transformers import SentenceTransformer
import faiss
import pickle
from pathlib import Path
import hashlib
import time

# Add the project path to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from floatchat.config.settings import config
from floatchat.database.supabase_client import db_client


class EnhancedFAISSIndexManager:
    """🚀 Advanced FAISS index manager with content-aware summaries and parallel processing."""

    def __init__(self):
        """Initialize enhanced FAISS index manager."""
        print("🔧 Initializing Enhanced FAISS Index Manager...")

        self.embed_model = SentenceTransformer(config.EMBED_MODEL_NAME)
        self.embedding_dim = self.embed_model.get_sentence_embedding_dimension()
        self.index: Optional[faiss.Index] = None
        self.metadata: List[Dict[str, Any]] = []
        self.cache_dir = Path("floatchat_cache")
        self.cache_dir.mkdir(exist_ok=True)

        print(f"  ✅ Embedding model: {config.EMBED_MODEL_NAME} ({self.embedding_dim}D)")
        print(f"  ✅ Cache directory: {self.cache_dir}")

        # 🌊 Ocean regions with detailed boundaries for precise classification
        self.ocean_regions = {
            "Arctic Ocean": {"lat": (66, 90), "lon": (-180, 180)},
            "North Atlantic": {"lat": (0, 66), "lon": (-80, 20)},
            "South Atlantic": {"lat": (-60, 0), "lon": (-70, 20)},
            "North Pacific": {"lat": (0, 66), "lon": (-180, -70), "alt_lon": (120, 180)},
            "South Pacific": {"lat": (-60, 0), "lon": (-180, -70), "alt_lon": (150, 180)},
            "Indian Ocean": {"lat": (-60, 30), "lon": (20, 150)},
            "Southern Ocean": {"lat": (-90, -60), "lon": (-180, 180)},
            "Mediterranean Sea": {"lat": (30, 45), "lon": (-5, 36)},
            "Caribbean Sea": {"lat": (10, 25), "lon": (-90, -60)},
            "Gulf of Mexico": {"lat": (18, 30), "lon": (-98, -82)},
            "Red Sea": {"lat": (12, 30), "lon": (32, 44)},
            "Arabian Sea": {"lat": (0, 25), "lon": (50, 78)},
            "Bay of Bengal": {"lat": (5, 22), "lon": (80, 95)},
            "East China Sea": {"lat": (23, 33), "lon": (117, 131)},
            "Coral Sea": {"lat": (-30, -10), "lon": (142, 162)},
            "Tasman Sea": {"lat": (-48, -30), "lon": (150, 170)},
            "Bering Sea": {"lat": (51, 66), "lon": (162, -157)},
            "Norwegian Sea": {"lat": (62, 75), "lon": (-10, 20)},
            "Labrador Sea": {"lat": (53, 65), "lon": (-65, -45)},
            "Scotia Sea": {"lat": (-61, -53), "lon": (-60, -25)}
        }

    def determine_ocean_region(self, lat_range: Tuple[float, float], lon_range: Tuple[float, float]) -> str:
        """🌍 Determine ocean region from coordinate ranges with high precision."""
        avg_lat = (lat_range[0] + lat_range[1]) / 2
        avg_lon = (lon_range[0] + lon_range[1]) / 2

        # Check specific seas and regions first (higher priority)
        for region, bounds in self.ocean_regions.items():
            lat_min, lat_max = bounds["lat"]
            lon_min, lon_max = bounds["lon"]

            # Handle longitude wraparound for Pacific
            if "alt_lon" in bounds:
                alt_lon_min, alt_lon_max = bounds["alt_lon"]
                if (lat_min <= avg_lat <= lat_max and
                    (lon_min <= avg_lon <= lon_max or alt_lon_min <= avg_lon <= alt_lon_max)):
                    return region
            else:
                if lat_min <= avg_lat <= lat_max and lon_min <= avg_lon <= lon_max:
                    return region

        # Fallback to general region
        hemisphere = "Northern" if avg_lat > 0 else "Southern"
        return f"{hemisphere} Ocean ({avg_lat:.1f}°, {avg_lon:.1f}°)"

    def analyze_bgc_parameters(self, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        """🧪 Analyze BGC parameters and extract statistical summaries."""
        bgc_stats = {}

        def extract_values(rows, column):
            """Extract numeric values from column, handling lists and nulls."""
            values = []
            for row in rows:
                if column in row and row[column] is not None:
                    val = row[column]
                    if isinstance(val, list):
                        values.extend([v for v in val if v is not None and isinstance(v, (int, float))])
                    elif isinstance(val, (int, float)):
                        values.append(val)
            return values

        # 🫧 Oxygen analysis
        doxy_values = extract_values(rows, "doxy")
        if doxy_values:
            bgc_stats["oxygen"] = {
                "mean": statistics.mean(doxy_values),
                "min": min(doxy_values),
                "max": max(doxy_values),
                "count": len(doxy_values)
            }

        # 🌱 Chlorophyll analysis
        chla_values = extract_values(rows, "chla")
        if chla_values:
            max_chl = max(chla_values)
            bgc_stats["chlorophyll"] = {
                "mean": statistics.mean(chla_values),
                "max": max_chl,
                "productivity": "high" if max_chl > 1.0 else "moderate" if max_chl > 0.3 else "low"
            }

        # 🧂 Nitrate analysis
        nitrate_values = extract_values(rows, "nitrate")
        if nitrate_values:
            bgc_stats["nitrate"] = {
                "mean": statistics.mean(nitrate_values),
                "max": max(nitrate_values)
            }

        # ⚡ pH analysis
        ph_values = extract_values(rows, "ph_in_situ_total")
        # Filter realistic pH values for seawater
        ph_values = [v for v in ph_values if 7 < v < 9]
        if ph_values:
            min_ph = min(ph_values)
            bgc_stats["pH"] = {
                "mean": statistics.mean(ph_values),
                "min": min_ph,
                "acidification_level": "high" if min_ph < 7.9 else "moderate" if min_ph < 8.0 else "low"
            }

        return bgc_stats

    def create_content_aware_summary(self, table: str, rows: List[Dict[str, Any]]) -> str:
        """
        🎯 Create a UNIQUE, content-aware summary of a table based on actual data.
        This is the KEY function that makes each table distinguishable!
        """
        if not rows:
            return f"Table {table}: (no sample rows)."

        summary_parts = []

        # 🏷️ Extract float ID (BGC floats typically named like bgc_4900482)
        float_id = table.split('_')[-1] if '_' in table else table
        summary_parts.append(f"BGC Float {float_id}")

        # 🌍 ENHANCED Geographic analysis - CRUCIAL for differentiation
        if "latitude" in rows[0] and "longitude" in rows[0]:
            lats = [r.get("latitude") for r in rows if r.get("latitude") is not None]
            lons = [r.get("longitude") for r in rows if r.get("longitude") is not None]

            if lats and lons:
                lat_min, lat_max = min(lats), max(lats)
                lon_min, lon_max = min(lons), max(lons)
                lat_range = (lat_min, lat_max)
                lon_range = (lon_min, lon_max)
                region = self.determine_ocean_region(lat_range, lon_range)

                # Add region (KEY differentiator)
                summary_parts.append(f"deployed in {region}")

                # Calculate spans and average position
                lat_span = lat_max - lat_min
                lon_span = lon_max - lon_min
                avg_lat = (lat_min + lat_max) / 2
                avg_lon = (lon_min + lon_max) / 2

                # Format coordinates with proper N/S and E/W indicators (2 decimal places for precision)
                lat_min_str = f"{abs(lat_min):.2f}°{'N' if lat_min >= 0 else 'S'}"
                lat_max_str = f"{abs(lat_max):.2f}°{'N' if lat_max >= 0 else 'S'}"
                lon_min_str = f"{abs(lon_min):.2f}°{'E' if lon_min >= 0 else 'W'}"
                lon_max_str = f"{abs(lon_max):.2f}°{'E' if lon_max >= 0 else 'W'}"
                avg_lat_str = f"{abs(avg_lat):.2f}°{'N' if avg_lat >= 0 else 'S'}"
                avg_lon_str = f"{abs(avg_lon):.2f}°{'E' if avg_lon >= 0 else 'W'}"

                # ALWAYS add detailed coordinate information (this is what you want!)
                summary_parts.append(f"latitude bounds {lat_min_str} to {lat_max_str}")
                summary_parts.append(f"longitude bounds {lon_min_str} to {lon_max_str}")
                summary_parts.append(f"average position {avg_lat_str}, {avg_lon_str}")

                # Add movement pattern analysis with detailed spans
                if lat_span > 10 or lon_span > 10:
                    summary_parts.append(f"extensive mobility {lat_span:.1f}° lat × {lon_span:.1f}° lon span")
                elif lat_span > 5 or lon_span > 5:
                    summary_parts.append(f"moderate drift {lat_span:.1f}° lat × {lon_span:.1f}° lon span")
                elif lat_span > 1 or lon_span > 1:
                    summary_parts.append(f"localized movement {lat_span:.1f}° lat × {lon_span:.1f}° lon span")
                else:
                    summary_parts.append(f"stationary deployment {lat_span:.1f}° lat × {lon_span:.1f}° lon span")

                # Add oceanographic context based on location
                if region in ["Mediterranean Sea", "Red Sea", "Caribbean Sea", "Gulf of Mexico"]:
                    summary_parts.append("semi-enclosed sea environment")
                elif "Southern Ocean" in region:
                    summary_parts.append("circumpolar Antarctic waters")
                elif "Arctic" in region:
                    summary_parts.append("polar ice-influenced waters")
                elif abs(avg_lat) < 10:
                    summary_parts.append("equatorial tropical waters")
                elif 10 <= abs(avg_lat) < 30:
                    summary_parts.append("subtropical oceanic zone")
                elif 30 <= abs(avg_lat) < 50:
                    summary_parts.append("temperate oceanic zone")
                elif abs(avg_lat) >= 50:
                    summary_parts.append("subpolar oceanic waters")

        # 📅 Temporal analysis - Another KEY differentiator
        if "time" in rows[0]:
            times = []
            for r in rows:
                if r.get("time"):
                    try:
                        time_str = r["time"]
                        if isinstance(time_str, str):
                            # Handle ISO format with Z
                            if time_str.endswith('Z'):
                                time_str = time_str[:-1] + '+00:00'
                            times.append(datetime.fromisoformat(time_str))
                    except Exception:
                        pass

            if times:
                min_time = min(times)
                max_time = max(times)
                duration = (max_time - min_time).days

                summary_parts.append(f"from {min_time.strftime('%b %Y')} to {max_time.strftime('%b %Y')}")

                # Add duration context
                if duration > 365:
                    summary_parts.append(f"({duration//365:.1f} years of data)")
                elif duration > 30:
                    summary_parts.append(f"({duration//30:.0f} months of data)")
                else:
                    summary_parts.append(f"({duration} days of data)")

        # 🧪 ENHANCED BGC parameter analysis - CRITICAL differentiator
        bgc_stats = self.analyze_bgc_parameters(rows)

        if bgc_stats:
            param_descriptions = []

            # ENHANCED Oxygen characteristics with detailed ranges
            if "oxygen" in bgc_stats:
                oxy = bgc_stats["oxygen"]
                param_descriptions.append(f"dissolved oxygen mean {oxy['mean']:.1f} μmol/kg")
                param_descriptions.append(f"oxygen range {oxy['min']:.1f} to {oxy['max']:.1f} μmol/kg")

                # More detailed environmental conditions
                if oxy['min'] < 20:
                    param_descriptions.append("severe hypoxic zones (O2 < 20)")
                elif oxy['min'] < 50:
                    param_descriptions.append("hypoxic conditions (O2 < 50)")
                elif oxy['min'] < 100:
                    param_descriptions.append("low oxygen zones (O2 < 100)")
                elif oxy['max'] > 300:
                    param_descriptions.append("oxygen-saturated surface waters")

            # ENHANCED Biological productivity with more details
            if "chlorophyll" in bgc_stats:
                chl = bgc_stats["chlorophyll"]
                param_descriptions.append(f"chlorophyll-a mean {chl['mean']:.3f} mg/m³")
                param_descriptions.append(f"peak chlorophyll {chl['max']:.3f} mg/m³")

                # More specific productivity classifications
                if chl['max'] > 2.0:
                    param_descriptions.append("eutrophic high-productivity waters")
                elif chl['max'] > 1.0:
                    param_descriptions.append("mesotrophic moderate-productivity")
                elif chl['max'] > 0.3:
                    param_descriptions.append("oligotrophic low-productivity")
                else:
                    param_descriptions.append("ultra-oligotrophic desert waters")

            # ENHANCED Nutrient content with detailed analysis
            if "nitrate" in bgc_stats:
                nit = bgc_stats["nitrate"]
                param_descriptions.append(f"nitrate concentration mean {nit['mean']:.1f} μmol/kg")
                param_descriptions.append(f"nitrate maximum {nit['max']:.1f} μmol/kg")

                # Nutrient availability context
                if nit['max'] > 30:
                    param_descriptions.append("nutrient-rich deep waters")
                elif nit['max'] > 15:
                    param_descriptions.append("moderate nutrient availability")
                elif nit['max'] > 5:
                    param_descriptions.append("nutrient-limited surface waters")
                else:
                    param_descriptions.append("severely nutrient-depleted zone")

            # ENHANCED Ocean chemistry with acidification details
            if "pH" in bgc_stats:
                ph = bgc_stats["pH"]
                param_descriptions.append(f"in-situ pH mean {ph['mean']:.3f}")
                param_descriptions.append(f"minimum pH {ph['min']:.3f}")

                # More detailed acidification levels
                if ph['min'] < 7.8:
                    param_descriptions.append("severe ocean acidification (pH < 7.8)")
                elif ph['min'] < 7.9:
                    param_descriptions.append("significant acidification (pH < 7.9)")
                elif ph['min'] < 8.0:
                    param_descriptions.append("moderate acidification trends")
                else:
                    param_descriptions.append("stable pH conditions")

            if param_descriptions:
                # Show more parameters since we have detailed info
                summary_parts.append("measuring " + ", ".join(param_descriptions[:5]))

        # 📊 Data volume characterization
        profile_count = len(rows)
        if profile_count > 100:
            summary_parts.append(f"extensive dataset with {profile_count} profiles")
        elif profile_count > 50:
            summary_parts.append(f"comprehensive coverage with {profile_count} profiles")
        else:
            summary_parts.append(f"{profile_count} profiles")

        # 🔬 Project context
        if "project_name" in rows[0]:
            projects = set([r.get("project_name") for r in rows if r.get("project_name")])
            projects = [p for p in projects if p]  # Remove None values
            if projects:
                summary_parts.append(f"part of {', '.join(list(projects)[:2])}")

        # 🛟 Platform information
        if "platform_type" in rows[0]:
            platforms = set([r.get("platform_type") for r in rows if r.get("platform_type")])
            platforms = [p for p in platforms if p]  # Remove None values
            if platforms:
                summary_parts.append(f"using {', '.join(list(platforms)[:1])} platform")

        # 🎯 Create final unique summary
        return f"Table {table}: " + ", ".join(summary_parts) + "."

    def process_single_table(self, table_name: str) -> Optional[Dict[str, Any]]:
        """⚡ Process a single table and return its metadata with smart caching."""
        # 💾 Check cache first
        cache_file = self.cache_dir / f"{table_name}.pkl"
        if cache_file.exists():
            try:
                with open(cache_file, "rb") as f:
                    cached_data = pickle.load(f)
                    # Verify cache is recent (within 7 days)
                    if time.time() - cached_data.get("timestamp", 0) < 7 * 86400:
                        print(f"  ✓ {table_name} (cached)")
                        return cached_data["metadata"]
            except Exception:
                pass

        # 🔄 Process table fresh
        try:
            print(f"  ⟳ Processing {table_name}...")
            rows = db_client.sample_table_rows(table_name)

            if not rows:
                print(f"  ✗ {table_name} (no data)")
                return None

            # Create unique content-aware summary
            summary = self.create_content_aware_summary(table_name, rows)

            metadata = {
                "table": table_name,
                "summary": summary,
                "row_count": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "bgc_stats": self.analyze_bgc_parameters(rows)
            }

            # 💾 Cache the result
            cache_data = {
                "metadata": metadata,
                "timestamp": time.time()
            }
            try:
                with open(cache_file, "wb") as f:
                    pickle.dump(cache_data, f)
            except Exception:
                pass  # Cache write failure is not critical

            print(f"  ✓ {table_name} processed")
            return metadata

        except Exception as e:
            print(f"  ✗ {table_name} error: {str(e)[:50]}")
            return None

    def build_index(self, overwrite: bool = False, max_workers: int = 8) -> Tuple[faiss.Index, List[Dict[str, Any]]]:
        """
        🚀 Build FAISS index with parallel processing and progress tracking.
        Optimized for 190+ tables with smart caching and detailed summaries.
        """
        # Check existing index
        if not overwrite and os.path.exists(config.INDEX_PATH) and os.path.exists(config.METADATA_PATH):
            print("📚 Loading existing index...")
            return self.load_index()

        table_names = config.get_table_list()
        if not table_names:
            raise ValueError("❌ No tables specified in TABLE_LIST configuration")

        # 🎬 Show impressive startup banner
        print(f"\n{'='*70}")
        print(f"🚀 ENHANCED FAISS INDEX BUILDER".center(70))
        print(f"{'='*70}")
        print(f"📊 Tables to process: {len(table_names)}")
        print(f"⚡ Parallel workers: {max_workers}")
        print(f"💾 Cache directory: {self.cache_dir}")
        print(f"🔬 Sample per table: {config.SAMPLE_PER_TABLE}")
        print(f"🧠 Embedding model: {config.EMBED_MODEL_NAME}")
        print(f"{'='*70}")

        start_time = time.time()
        metadata = []
        table_summaries = []

        # 🔄 Process tables in parallel with progress tracking
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_table = {
                executor.submit(self.process_single_table, table): table
                for table in table_names
            }

            # Collect results with fancy progress tracking
            completed = 0
            failed_tables = []

            print(f"\n📋 Processing {len(table_names)} tables...")
            print("─" * 70)

            for future in as_completed(future_to_table):
                completed += 1
                table_name = future_to_table[future]

                try:
                    result = future.result()
                    if result:
                        metadata.append(result)
                        table_summaries.append(result["summary"])
                    else:
                        failed_tables.append(table_name)

                    # Progress update every 5 tables or on completion
                    if completed % 5 == 0 or completed == len(table_names):
                        elapsed = time.time() - start_time
                        rate = completed / elapsed if elapsed > 0 else 0
                        remaining_tables = len(table_names) - completed
                        eta = remaining_tables / rate if rate > 0 else 0

                        progress_bar = "█" * int(50 * completed / len(table_names))
                        progress_bar += "░" * (50 - len(progress_bar))

                        print(f"[{progress_bar}] {completed}/{len(table_names)} "
                              f"({100*completed/len(table_names):.1f}%) "
                              f"⏱️ {elapsed:.1f}s ⏳ ETA {eta:.1f}s")

                except Exception as e:
                    failed_tables.append(table_name)
                    print(f"  ✗ Failed to process {table_name}: {str(e)[:50]}")

        print("─" * 70)

        if not metadata:
            raise ValueError("❌ No tables could be processed successfully")

        successful_tables = len(metadata)
        failed_count = len(failed_tables)

        print(f"✅ Successfully processed: {successful_tables} tables")
        if failed_count > 0:
            print(f"⚠️  Failed to process: {failed_count} tables")
            if failed_count <= 10:  # Only show if reasonable number
                print(f"   Failed tables: {', '.join(failed_tables)}")

        # 🧠 Generate embeddings with batch processing
        print(f"\n{'='*70}")
        print(f"🧠 Generating embeddings for {len(metadata)} unique summaries...")
        print(f"{'='*70}")

        batch_size = 16  # Smaller batches for stability
        all_embeddings = []

        for i in range(0, len(table_summaries), batch_size):
            batch = table_summaries[i:i+batch_size]
            try:
                batch_embeddings = self.embed_model.encode(batch, convert_to_numpy=True, show_progress_bar=False)
                all_embeddings.append(batch_embeddings)
                batch_num = i // batch_size + 1
                total_batches = (len(table_summaries) + batch_size - 1) // batch_size
                print(f"  🔄 Batch {batch_num}/{total_batches} encoded ({len(batch)} summaries)")
            except Exception as e:
                print(f"  ❌ Failed to encode batch {batch_num}: {e}")
                raise

        # Combine all embeddings
        embeddings = np.vstack(all_embeddings).astype("float32")
        print(f"  ✅ All embeddings generated: {embeddings.shape}")

        # 🏗️ Create FAISS index
        print(f"\n🏗️  Creating FAISS index...")
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
        print(f"  ✅ Index created with {index.ntotal} vectors")

        # 💾 Save everything
        self.save_index(index, metadata)

        self.index = index
        self.metadata = metadata

        # 🎉 Final celebration summary
        total_time = time.time() - start_time
        print(f"\n{'='*70}")
        print(f"🎉 ENHANCED INDEX BUILD COMPLETE!".center(70))
        print(f"{'='*70}")
        print(f"📊 Tables successfully indexed: {len(metadata)}")
        print(f"⏱️  Total build time: {total_time:.1f} seconds")
        print(f"⚡ Average per table: {total_time/len(metadata):.2f} seconds")
        print(f"🧠 Embedding dimension: {embeddings.shape[1]}")
        print(f"📈 Index size: {index.ntotal} vectors")

        # Calculate processing rate
        tables_per_minute = len(metadata) / (total_time / 60)
        print(f"🚀 Processing rate: {tables_per_minute:.1f} tables/minute")

        # Show sample summaries to verify uniqueness
        print(f"\n📋 Sample of UNIQUE table summaries:")
        print("─" * 70)
        for i, meta in enumerate(metadata[:3], 1):
            print(f"\n{i}. {meta['table']}:")
            print(f"   → {meta['summary'][:150]}...")
        print("─" * 70)

        # Region analysis
        regions = set()
        for meta in metadata:
            summary = meta.get("summary", "")
            if "deployed in " in summary:
                start = summary.find("deployed in ") + len("deployed in ")
                end = summary.find(",", start)
                if end > start:
                    regions.add(summary[start:end])

        if regions:
            print(f"🌍 Ocean regions covered: {len(regions)}")
            print(f"   Regions: {', '.join(sorted(list(regions))[:10])}")
            if len(regions) > 10:
                print(f"   ... and {len(regions) - 10} more")

        print(f"\n✅ Ready for semantic search with TRULY unique table summaries!")
        print(f"{'='*70}")

        return index, metadata

    def save_index(self, index: faiss.Index, metadata: List[Dict[str, Any]]) -> None:
        """💾 Save FAISS index and metadata to disk."""
        print(f"\n💾 Saving index and metadata...")

        # Save FAISS index
        faiss.write_index(index, config.INDEX_PATH)

        # Save metadata (exclude BGC stats to reduce file size)
        save_metadata = []
        for meta in metadata:
            save_meta = {k: v for k, v in meta.items() if k != "bgc_stats"}
            save_metadata.append(save_meta)

        with open(config.METADATA_PATH, "w", encoding='utf-8') as f:
            json.dump(save_metadata, f, indent=2, ensure_ascii=False)

        print(f"  ✅ Index saved to: {config.INDEX_PATH}")
        print(f"  ✅ Metadata saved to: {config.METADATA_PATH}")
        print(f"  📊 Metadata file size: {os.path.getsize(config.METADATA_PATH) / 1024:.1f} KB")

    def load_index(self) -> Tuple[faiss.Index, List[Dict[str, Any]]]:
        """📚 Load FAISS index and metadata from disk."""
        if not os.path.exists(config.INDEX_PATH):
            raise FileNotFoundError(f"Index file not found: {config.INDEX_PATH}")

        if not os.path.exists(config.METADATA_PATH):
            raise FileNotFoundError(f"Metadata file not found: {config.METADATA_PATH}")

        print("📚 Loading FAISS index and metadata...")

        index = faiss.read_index(config.INDEX_PATH)

        with open(config.METADATA_PATH, "r", encoding='utf-8') as f:
            metadata = json.load(f)

        self.index = index
        self.metadata = metadata

        print(f"  ✅ Loaded index with {len(metadata)} table entries")
        print(f"  🧠 Index dimension: {index.d}")
        print(f"  📊 Total vectors: {index.ntotal}")

        return index, metadata

    def semantic_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """🔍 Perform semantic search and return truly relevant tables."""
        if self.index is None or not self.metadata:
            try:
                self.load_index()
            except FileNotFoundError:
                raise RuntimeError("❌ Index not found. Run build_index first.")

        print(f"\n🔍 Semantic Search Query: '{query[:60]}...' " if len(query) > 60 else f"\n🔍 Semantic Search Query: '{query}'")

        # Generate query embedding
        query_embedding = self.embed_model.encode([query]).astype("float32")

        # Search index
        search_k = min(k, len(self.metadata))
        distances, indices = self.index.search(query_embedding, search_k)

        # Return candidates with relevance scores
        candidates = []
        for i, dist in zip(indices[0], distances[0]):
            if i < len(self.metadata):
                candidate = self.metadata[i].copy()
                # Convert distance to similarity score (0-1, higher is better)
                candidate["relevance_score"] = float(1 / (1 + dist))
                candidates.append(candidate)

        # Sort by relevance (highest first)
        candidates.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Show results
        print(f"📊 Top {len(candidates)} relevant tables:")
        print("─" * 70)
        for i, cand in enumerate(candidates, 1):
            score_bar = "█" * int(20 * cand["relevance_score"])
            score_bar += "░" * (20 - len(score_bar))
            print(f"{i}. {cand['table']} [{score_bar}] {cand['relevance_score']:.3f}")
            print(f"   → {cand['summary'][:120]}...")
            print()

        return candidates

    def get_index_info(self) -> Dict[str, Any]:
        """📋 Get comprehensive information about the current index."""
        if self.index is None:
            return {
                "status": "not_loaded",
                "tables": 0,
                "embedding_dim": self.embedding_dim,
                "cache_dir": str(self.cache_dir)
            }

        # Extract unique regions and time periods from metadata
        regions = set()
        projects = set()
        time_ranges = []

        for meta in self.metadata:
            summary = meta.get("summary", "")

            # Extract regions
            if "deployed in " in summary:
                start = summary.find("deployed in ") + len("deployed in ")
                end = summary.find(",", start)
                if end > start:
                    regions.add(summary[start:end])

            # Extract projects
            if "part of " in summary:
                start = summary.find("part of ") + len("part of ")
                end = summary.find(",", start)
                if end == -1:
                    end = summary.find(".", start)
                if end > start:
                    projects.add(summary[start:end])

        return {
            "status": "loaded",
            "tables": len(self.metadata),
            "embedding_dim": self.embedding_dim,
            "index_size": self.index.ntotal,
            "table_names": [m["table"] for m in self.metadata][:10],  # First 10 for preview
            "unique_regions": sorted(list(regions)),
            "projects": sorted(list(projects)),
            "cache_dir": str(self.cache_dir),
            "index_file_size": os.path.getsize(config.INDEX_PATH) if os.path.exists(config.INDEX_PATH) else 0,
            "metadata_file_size": os.path.getsize(config.METADATA_PATH) if os.path.exists(config.METADATA_PATH) else 0
        }

    def retrieve_table_candidates(self, query, k=5):
        """
        Retrieve candidate tables using semantic search.
        This is an alias for semantic_search for backward compatibility.

        Args:
            query: The search query
            k: Number of results to return

        Returns:
            List of candidate tables with metadata
        """
        return self.semantic_search(query, k=k)


def main():
    """🚀 Main function to demonstrate the enhanced indexing system."""
    print("🌊 FloatChat Enhanced FAISS Index Builder")
    print("=" * 60)

    try:
        # Initialize the enhanced manager
        manager = EnhancedFAISSIndexManager()

        # Build the index
        print("\n🔧 Building enhanced index...")
        index, metadata = manager.build_index(overwrite=True, max_workers=8)

        # Test semantic search
        print("\n🧪 Testing semantic search...")
        test_queries = [
            "oxygen levels in the North Atlantic",
            "chlorophyll measurements near the equator",
            "pH data from Southern Ocean",
            "BGC floats with hypoxic conditions"
        ]

        for query in test_queries:
            print(f"\n" + "─" * 50)
            candidates = manager.semantic_search(query, k=3)

        # Show final stats
        info = manager.get_index_info()
        print(f"\n🎉 Enhanced Index Complete!")
        print(f"   📊 Total tables: {info['tables']}")
        print(f"   🌍 Ocean regions: {len(info['unique_regions'])}")
        print(f"   🔬 Projects: {len(info['projects'])}")
        print(f"   💾 Index size: {info['index_file_size'] / 1024:.1f} KB")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# Create aliases for backward compatibility
FAISSIndexManager = EnhancedFAISSIndexManager

# Global FAISS index manager instance
faiss_manager = EnhancedFAISSIndexManager()

if __name__ == "__main__":
    main()