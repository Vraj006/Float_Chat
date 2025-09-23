import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DataInspector = () => {
  const [inspection, setInspection] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inspectDatabase();
  }, []);

  const inspectDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      const results: any = {};

      // Since you have 188 tables, let's try a different approach
      // First, try to get table list from pg_tables or information_schema
      let tablesToCheck = [];

      try {
        // Try to get actual table names from Supabase
        console.log('🔍 Attempting to discover your 188 tables...');

        // Method 1: Try a function that might list tables
        try {
          const { data: tableList, error: tableError } = await supabase.rpc('get_table_list');
          if (tableList && !tableError) {
            tablesToCheck = tableList.map(t => t.table_name || t.tablename || t);
            console.log('📋 Found tables via RPC:', tablesToCheck.slice(0, 10), '...');
          }
        } catch (rpcError) {
          console.log('ℹ️ RPC method not available');
        }

        // Method 2: Try common oceanographic naming patterns
        if (tablesToCheck.length === 0) {
          console.log('🔍 Trying pattern-based discovery...');

          // Generate potential table names based on common patterns
          const patterns = [
            // Direct oceanographic terms
            'ocean', 'marine', 'sea', 'water', 'temperature', 'salinity', 'depth',
            'argo', 'bgc', 'float', 'sensor', 'profile', 'station', 'buoy',
            'measurement', 'observation', 'sample', 'data', 'reading',
            'incois', 'noaa', 'geosat', 'satellite',

            // Indian Ocean specific
            'indian_ocean', 'bay_bengal', 'arabian_sea', 'equatorial',
            'monsoon', 'current', 'upwelling',

            // Scientific terms
            'chlorophyll', 'nitrate', 'phosphate', 'oxygen', 'ph', 'turbidity',
            'wave', 'tide', 'wind', 'weather', 'climate',

            // Data types
            'timeseries', 'spatial', 'gridded', 'point', 'trajectory',
            'surface', 'subsurface', 'deep', 'abyssal'
          ];

          // Try tables with these patterns
          for (const pattern of patterns) {
            // Try various naming conventions
            const variations = [
              pattern,
              pattern + '_data',
              pattern + '_measurements',
              pattern + '_readings',
              pattern + '_obs',
              pattern + '_profiles',
              pattern + 's', // plural
              'tbl_' + pattern,
              pattern + '_tbl',
              pattern.replace('_', ''),
              pattern.toUpperCase(),
              pattern.toLowerCase()
            ];

            tablesToCheck.push(...variations);
          }

          // Also try numbered patterns (data1, data2, etc.)
          for (let i = 1; i <= 50; i++) {
            tablesToCheck.push(`data${i}`, `table${i}`, `ocean${i}`, `sensor${i}`);
          }
        }
      } catch (discoveryError) {
        console.log('⚠️ Table discovery failed, using comprehensive pattern list');

        // Fallback: extensive list of potential oceanographic table names
        tablesToCheck = [
          'ocean_temperature', 'marine_life', 'ocean_metrics', 'stations', 'measurements',
          'argo_data', 'bgc_data', 'float_data', 'sensor_data', 'profile_data',
          'temperature_data', 'salinity_data', 'depth_data', 'chlorophyll_data',
          'oxygen_data', 'ph_data', 'nitrate_data', 'current_data', 'wave_data',
          'incois_stations', 'argo_stations', 'bgc_stations', 'mooring_data',
          'satellite_data', 'buoy_data', 'ctd_data', 'xbt_data', 'glider_data'
        ];
      }

      console.log(`🔍 Starting comprehensive database inspection of ${tablesToCheck.length} potential table names...`);

      let checkedCount = 0;
      const totalToCheck = Math.min(tablesToCheck.length, 200); // Limit to avoid too many requests

      for (let i = 0; i < totalToCheck; i++) {
        const tableName = tablesToCheck[i];
        checkedCount++;
        try {
          if (checkedCount % 20 === 0) {
            console.log(`📊 Progress: ${checkedCount}/${totalToCheck} tables checked...`);
          }

          // Try to get sample data and structure
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3);

          if (!sampleError && sampleData) {
            // Get total count
            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });

            // Get column structure from first row
            const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];

            // Analyze data types
            const columnTypes: any = {};
            if (sampleData.length > 0) {
              const firstRow = sampleData[0];
              Object.keys(firstRow).forEach(col => {
                const value = firstRow[col];
                if (value === null) {
                  columnTypes[col] = 'null';
                } else if (typeof value === 'number') {
                  columnTypes[col] = Number.isInteger(value) ? 'integer' : 'decimal';
                } else if (typeof value === 'string') {
                  // Check if it looks like a date
                  if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    columnTypes[col] = 'datetime';
                  } else {
                    columnTypes[col] = 'text';
                  }
                } else if (typeof value === 'boolean') {
                  columnTypes[col] = 'boolean';
                } else {
                  columnTypes[col] = typeof value;
                }
              });
            }

            results[tableName] = {
              exists: true,
              totalRows: countError ? 'unknown' : count,
              sampleData,
              columns,
              columnTypes,
              error: null
            };

            console.log(`✅ Found table ${tableName}: ${count || 'unknown'} rows, ${columns.length} columns`);
          }
        } catch (err) {
          // Table doesn't exist or access denied
          console.log(`❌ Table ${tableName} not accessible`);
        }
      }

      // Also try to get any tables we might have missed
      try {
        console.log('🔍 Attempting to discover additional tables...');

        // Try a different approach - look for any tables with oceanographic keywords
        const potentialQueries = [
          'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
          'SELECT tablename FROM pg_tables WHERE schemaname = $1'
        ];

        // This might not work due to permissions, but worth trying
        for (const query of potentialQueries) {
          try {
            const { data: tableList } = await supabase.rpc('get_tables');
            if (tableList) {
              console.log('📋 Additional tables found via RPC:', tableList);
            }
          } catch (rpcError) {
            // RPC might not exist, that's fine
          }
        }
      } catch (discoveryError) {
        console.log('ℹ️ Could not auto-discover tables (this is normal)');
      }

      setInspection(results);

      // Log summary
      const foundTables = Object.keys(results);
      console.log(`\n📊 INSPECTION SUMMARY:`);
      console.log(`Found ${foundTables.length} accessible tables:`);
      foundTables.forEach(table => {
        const info = results[table];
        console.log(`- ${table}: ${info.totalRows} rows, columns: ${info.columns.join(', ')}`);
      });

    } catch (err) {
      console.error('💥 Inspection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to inspect database');
    } finally {
      setLoading(false);
    }
  };

  const exportInspection = () => {
    const dataStr = JSON.stringify(inspection, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supabase-inspection-${Date.now()}.json`;
    link.click();
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Inspecting your Supabase database structure...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const foundTables = Object.keys(inspection);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Database Inspection Results</span>
            <div className="flex gap-2">
              <Button onClick={inspectDatabase} variant="outline" size="sm">
                Re-inspect
              </Button>
              <Button onClick={exportInspection} variant="outline" size="sm">
                Export JSON
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error: </strong>{error}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p>Found <strong>{foundTables.length}</strong> accessible tables in your Supabase database.</p>
            {foundTables.length === 0 && (
              <p className="text-orange-600 mt-2">
                ⚠️ No ocean data tables found. You may need to create tables or check permissions.
              </p>
            )}
          </div>

          {foundTables.map(tableName => {
            const table = inspection[tableName];
            return (
              <Card key={tableName} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Table: <code className="bg-gray-100 px-2 py-1 rounded">{tableName}</code>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Total Rows:</strong> {table.totalRows}
                    </div>
                    <div>
                      <strong>Columns:</strong> {table.columns.length}
                    </div>
                  </div>

                  <div>
                    <strong>Column Structure:</strong>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {table.columns.map((col: string) => (
                        <div key={col} className="bg-gray-50 p-2 rounded text-sm">
                          <span className="font-medium">{col}</span>
                          <span className="text-gray-600 ml-2">({table.columnTypes[col]})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {table.sampleData && table.sampleData.length > 0 && (
                    <div>
                      <strong>Sample Data:</strong>
                      <div className="mt-2 bg-gray-50 p-3 rounded text-sm overflow-auto">
                        <pre>{JSON.stringify(table.sampleData, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataInspector;