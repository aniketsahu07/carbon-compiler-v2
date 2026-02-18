'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, Trees, Map, Sun, Wind, Mountain, Layers, AreaChart, Zap, Scaling, Leaf, Droplets, Thermometer, Filter, Factory } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProjectType = 'Renewable Energy' | 'Reforestation' | 'Hydroelectric' | 'Geothermal' | 'Direct Air Capture';

type AnalysisResult = {
    projectType: ProjectType;
    // Renewable Energy metrics
    panelDensity?: number;
    shadingRisk?: number;
    gridProximity?: string;
    insolationLevel?: number;
    potentialOutput?: number;
    // Reforestation metrics
    canopyCover?: number;
    estimatedTreeCount?: string;
    ndviHealth?: number;
    biomassDensity?: number;
    speciesDiversity?: number;
    // Hydroelectric metrics
    waterFlowRate?: number;
    reservoirCapacity?: number;
    turbineEfficiency?: number;
    // Geothermal metrics
    steamPressure?: number;
    reservoirTemp?: number;
    plantEfficiency?: number;
    // DAC metrics
    co2Concentration?: number;
    airFlowRate?: number;
    netCO2Removed?: number;
};

type AnalysisState = {
  result: AnalysisResult | null;
  pending: boolean;
  error?: string;
};

const projectPresets = {
    'Renewable Energy': {
        zone: '27.53° N, 71.91° E',
        mapId: 'bhadla-solar-park'
    },
    'Reforestation': {
        zone: '21.90° N, 89.47° E',
        mapId: 'sundarbans-mangrove'
    },
    'Hydroelectric': {
        zone: '30.82° N, 111.00° E',
        mapId: 'hydro-power'
    },
    'Geothermal': {
        zone: '0.78° S, 36.30° E',
        mapId: 'kenya-geothermal'
    },
    'Direct Air Capture': {
        zone: '33.92° N, 101.88° W',
        mapId: 'usa-dac'
    }
}

export default function SatelliteImageryPage() {
  const [projectType, setProjectType] = useState<ProjectType>('Renewable Energy');
  const [zone, setZone] = useState(projectPresets['Renewable Energy'].zone);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    result: null,
    pending: false,
    error: undefined,
  });
  
  const handleProjectTypeChange = (type: ProjectType) => {
      setProjectType(type);
      setZone(projectPresets[type].zone);
      setAnalysisState({ result: null, pending: false, error: undefined });
  }

  const handleAnalyze = async () => {
    if (!zone.trim()) return;
    setAnalysisState({ result: null, pending: true, error: undefined });
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI analysis delay

    let simulatedResult: AnalysisResult;

    switch (projectType) {
        case 'Renewable Energy':
            simulatedResult = {
                projectType: 'Renewable Energy',
                panelDensity: 92,
                shadingRisk: 3,
                gridProximity: '8 km',
                insolationLevel: 6.2,
                potentialOutput: 2245,
            };
            break;
        case 'Reforestation':
             simulatedResult = {
                projectType: 'Reforestation',
                canopyCover: 85,
                estimatedTreeCount: '1.2 Million',
                ndviHealth: 0.88,
                biomassDensity: 150,
                speciesDiversity: 0.76,
            };
            break;
        case 'Hydroelectric':
            simulatedResult = {
                projectType: 'Hydroelectric',
                waterFlowRate: 14500,
                reservoirCapacity: 39.3,
                turbineEfficiency: 96,
            };
            break;
        case 'Geothermal':
            simulatedResult = {
                projectType: 'Geothermal',
                steamPressure: 105,
                reservoirTemp: 280,
                plantEfficiency: 89,
            };
            break;
        case 'Direct Air Capture':
             simulatedResult = {
                projectType: 'Direct Air Capture',
                co2Concentration: 420,
                airFlowRate: 2500000,
                netCO2Removed: 4000,
            };
            break;
        default:
            simulatedResult = { projectType: 'Renewable Energy' }; // Fallback
    }

    setAnalysisState({ result: simulatedResult, pending: false, error: undefined });
  };
  
  const mapImage = PlaceHolderImages.find(img => img.id === projectPresets[projectType].mapId);

  const renderResultMetrics = () => {
    if (!analysisState.result) return null;

    switch (analysisState.result.projectType) {
        case 'Renewable Energy':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Panel Density</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.panelDensity}%</p>
                        <Badge variant="default" className="w-fit">High</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Mountain className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Shading Risk</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.shadingRisk}%</p>
                        <Badge variant="secondary" className="w-fit">Low</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Grid Proximity</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.gridProximity}</p>
                        <Badge variant="secondary" className="w-fit">Optimal</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Sun className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Insolation Level</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.insolationLevel} <span className="text-lg text-muted-foreground">kWh/m²</span></p>
                        <Badge variant="default" className="w-fit">Excellent</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Scaling className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Potential Output</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.potentialOutput} <span className="text-lg text-muted-foreground">GWh/yr</span></p>
                        <Badge variant="default" className="w-fit">High Capacity</Badge>
                    </div>
                </div>
            );
        case 'Reforestation':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><AreaChart className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Canopy Cover</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.canopyCover}%</p>
                        <Badge variant="default" className="w-fit">Dense</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Trees className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Estimated Tree Count</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.estimatedTreeCount}</p>
                        <Badge variant="secondary" className="w-fit">High</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">NDVI Health Index</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.ndviHealth}</p>
                        <Badge variant="default" className="w-fit">Very Healthy</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Biomass Density</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.biomassDensity} <span className="text-lg text-muted-foreground">tons/ha</span></p>
                        <Badge variant="default" className="w-fit">High Carbon Sink</Badge>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Scaling className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Species Diversity</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.speciesDiversity} <span className="text-lg text-muted-foreground">SDI</span></p>
                        <Badge variant="secondary" className="w-fit">Healthy Ecosystem</Badge>
                    </div>
                </div>
            );
        case 'Hydroelectric':
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Water Flow Rate</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.waterFlowRate?.toLocaleString()} <span className="text-lg text-muted-foreground">m³/s</span></p>
                        <Badge variant="default" className="w-fit">Strong</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Reservoir Capacity</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.reservoirCapacity} <span className="text-lg text-muted-foreground">km³</span></p>
                        <Badge variant="default" className="w-fit">Vast</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Turbine Efficiency</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.turbineEfficiency}%</p>
                        <Badge variant="secondary" className="w-fit">Optimal</Badge>
                    </div>
                </div>
            );
         case 'Geothermal':
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Steam Pressure</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.steamPressure} <span className="text-lg text-muted-foreground">bar</span></p>
                        <Badge variant="default" className="w-fit">High</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Reservoir Temp.</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.reservoirTemp}°C</p>
                        <Badge variant="default" className="w-fit">Very Hot</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Plant Efficiency</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.plantEfficiency}%</p>
                        <Badge variant="secondary" className="w-fit">Excellent</Badge>
                    </div>
                </div>
            );
        case 'Direct Air Capture':
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Ambient CO₂</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.co2Concentration} <span className="text-lg text-muted-foreground">ppm</span></p>
                        <Badge variant="secondary" className="w-fit">Standard</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Air Flow Rate</p></div>
                        <p className="text-3xl font-bold">{(analysisState.result.airFlowRate! / 1_000_000).toFixed(1)}M <span className="text-lg text-muted-foreground">m³/hr</span></p>
                        <Badge variant="default" className="w-fit">High Volume</Badge>
                    </div>
                     <div className="flex flex-col gap-2 rounded-md border p-4 bg-white dark:bg-zinc-900/50">
                        <div className="flex items-center gap-2"><Factory className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Net CO₂ Removed</p></div>
                        <p className="text-3xl font-bold">{analysisState.result.netCO2Removed?.toLocaleString()} <span className="text-lg text-muted-foreground">t/yr</span></p>
                        <Badge variant="default" className="w-fit">Verified</Badge>
                    </div>
                </div>
            );
        default:
            return null;
    }
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Satellite Image Analysis</CardTitle>
          <CardDescription>
            Select a project type and enter coordinates to get a dynamic, AI-powered analysis of the project area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="project-type">Project Type</Label>
                <Select value={projectType} onValueChange={(val: ProjectType) => handleProjectTypeChange(val)}>
                    <SelectTrigger id="project-type">
                        <SelectValue placeholder="Select a project type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                        <SelectItem value="Reforestation">Reforestation</SelectItem>
                        <SelectItem value="Hydroelectric">Hydroelectric</SelectItem>
                        <SelectItem value="Geothermal">Geothermal</SelectItem>
                        <SelectItem value="Direct Air Capture">Direct Air Capture</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="zone">Zone to Analyze (Coordinates)</Label>
                <Input
                    id="zone"
                    placeholder="e.g., 27.53° N, 71.91° E"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    disabled={analysisState.pending}
                />
            </div>
          </div>
         
          <div>
            <Button onClick={handleAnalyze} disabled={analysisState.pending || !zone.trim()}>
              {analysisState.pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning satellite clusters...
                </>
              ) : (
                'Run Analysis'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisState.error && (
        <Card className="mt-6 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle />
                    Analysis Failed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{analysisState.error}</p>
            </CardContent>
        </Card>
      )}

      {analysisState.result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analysis Complete: {projectType}</CardTitle>
             <CardDescription>Validation report based on satellite imagery for zone: {zone}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Visual Confirmation</Label>
                    <div className="border rounded-lg overflow-hidden">
                        <Image 
                            src={mapImage?.imageUrl ?? 'https://placehold.co/600x400/104f3c/FFFFFF?text=Satellite+View'}
                            alt={`Satellite map for ${projectType}`}
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover"
                            data-ai-hint={mapImage?.imageHint}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <Label>AI Analysis Stats</Label>
                        {renderResultMetrics()}
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
