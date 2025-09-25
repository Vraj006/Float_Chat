import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Thermometer, Waves } from "lucide-react";

interface PlotData {
  type: 'salinity_profile' | 'temperature_profile';
  title: string;
  data: Array<{
    x: number[];
    y: number[];
  }>;
  base64?: string;
}

interface RagPlotDisplayProps {
  plots: PlotData[];
  className?: string;
}

const RagPlotDisplay: React.FC<RagPlotDisplayProps> = ({ plots, className = "" }) => {
  if (!plots || plots.length === 0) {
    return null;
  }

  const convertPlotDataToChart = (plotData: PlotData) => {
    if (!plotData.data || plotData.data.length === 0) {
      return [];
    }

    // Take the first data series and convert to chart format
    const series = plotData.data[0];
    if (!series.x || !series.y || series.x.length !== series.y.length) {
      return [];
    }

    // Create chart data points
    const chartData = [];
    for (let i = 0; i < Math.min(series.x.length, 50); i += Math.max(1, Math.floor(series.x.length / 20))) {
      chartData.push({
        value: Math.round(series.x[i] * 100) / 100,
        depth: Math.round(series.y[i] * 10) / 10
      });
    }

    return chartData.sort((a, b) => a.depth - b.depth);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {plots.map((plot, index) => {
        const chartData = convertPlotDataToChart(plot);

        return (
          <Card key={index} className="glass-card border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {plot.type === 'temperature_profile' ? (
                  <Thermometer className="h-4 w-4 text-orange-500" />
                ) : (
                  <Waves className="h-4 w-4 text-blue-500" />
                )}
                {plot.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="value"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      label={{
                        value: plot.type === 'temperature_profile' ? 'Temperature (°C)' : 'Salinity (PSU)',
                        position: 'insideBottom',
                        offset: -5,
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <YAxis
                      dataKey="depth"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      reversed={true}
                      label={{
                        value: 'Depth (dbar)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} ${plot.type === 'temperature_profile' ? '°C' : 'PSU'}`,
                        plot.type === 'temperature_profile' ? 'Temperature' : 'Salinity'
                      ]}
                      labelFormatter={(depth) => `Depth: ${depth} dbar`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={plot.type === 'temperature_profile' ? "#FF6B35" : "#0EA5E9"}
                      strokeWidth={2}
                      dot={{ fill: plot.type === 'temperature_profile' ? "#FF6B35" : "#0EA5E9", r: 3 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                // Fallback to base64 image if data conversion fails
                plot.base64 && (
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${plot.base64}`}
                      alt={plot.title}
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RagPlotDisplay;