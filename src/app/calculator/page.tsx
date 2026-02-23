'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plane, Car, Zap, Beef, ShoppingBag, Leaf, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

// Emission factors (kg CO₂e per unit)
const EMISSION_FACTORS = {
  shortFlight: 255,         // per flight (< 3hr)
  longFlight: 1500,         // per flight (> 3hr)
  carKm: 0.171,             // per km (average petrol car)
  electricityKwh: 0.82,     // per kWh (India grid average)
  lpgCylinder: 25,          // per 14.2kg cylinder
  diet: {
    vegan: 1200,            // kg CO₂e/year
    vegetarian: 1500,
    'meat-occasional': 2200,
    'meat-regular': 2800,
    'meat-heavy': 3300,
  } as Record<string, number>,
  shoppingPer10k: 35,       // kg CO₂e per ₹10,000 spent
};

type DietType = 'vegan' | 'vegetarian' | 'meat-occasional' | 'meat-regular' | 'meat-heavy';

const categoryColors: Record<string, string> = {
  travel: 'bg-blue-500',
  electricity: 'bg-yellow-500',
  cooking: 'bg-orange-500',
  diet: 'bg-green-500',
  shopping: 'bg-purple-500',
};

export default function CalculatorPage() {
  // Travel
  const [shortFlights, setShortFlights] = useState(2);
  const [longFlights, setLongFlights] = useState(1);
  const [carKmPerMonth, setCarKmPerMonth] = useState(500);

  // Home
  const [electricityKwhPerMonth, setElectricityKwhPerMonth] = useState(200);
  const [lpgCylindersPerYear, setLpgCylindersPerYear] = useState(6);

  // Diet
  const [diet, setDiet] = useState<DietType>('vegetarian');

  // Shopping
  const [shoppingPer10k, setShoppingPer10k] = useState(3);

  const [showResults, setShowResults] = useState(false);

  // Calculate emissions (all in kg CO₂e/year)
  const travelEmissions =
    shortFlights * EMISSION_FACTORS.shortFlight +
    longFlights * EMISSION_FACTORS.longFlight +
    carKmPerMonth * 12 * EMISSION_FACTORS.carKm;

  const electricityEmissions = electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh;
  const cookingEmissions = lpgCylindersPerYear * EMISSION_FACTORS.lpgCylinder;
  const dietEmissions = EMISSION_FACTORS.diet[diet];
  const shoppingEmissions = shoppingPer10k * EMISSION_FACTORS.shoppingPer10k;

  const totalKg = travelEmissions + electricityEmissions + cookingEmissions + dietEmissions + shoppingEmissions;
  const totalTonnes = totalKg / 1000;

  const creditsNeeded = Math.ceil(totalTonnes);
  const indianAvgTonnes = 1.9; // tonnes CO₂e per capita India

  const categories = [
    { label: 'Travel', key: 'travel', value: travelEmissions, icon: Plane },
    { label: 'Electricity', key: 'electricity', value: electricityEmissions, icon: Zap },
    { label: 'Cooking Gas', key: 'cooking', value: cookingEmissions, icon: Leaf },
    { label: 'Diet', key: 'diet', value: dietEmissions, icon: Beef },
    { label: 'Shopping', key: 'shopping', value: shoppingEmissions, icon: ShoppingBag },
  ];

  const handleReset = () => {
    setShortFlights(2);
    setLongFlights(1);
    setCarKmPerMonth(500);
    setElectricityKwhPerMonth(200);
    setLpgCylindersPerYear(6);
    setDiet('vegetarian');
    setShoppingPer10k(3);
    setShowResults(false);
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Leaf className="text-primary h-6 w-6" />
            Carbon Footprint Calculator
          </CardTitle>
          <CardDescription>
            Estimate your annual CO₂ emissions based on your lifestyle, and find out how many carbon credits you need to offset them.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-500" /> Travel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Short-haul Flights per Year (&lt;3 hrs)</Label>
                <span className="font-semibold text-sm">{shortFlights}</span>
              </div>
              <Slider
                value={[shortFlights]}
                onValueChange={([v]) => setShortFlights(v)}
                min={0} max={20} step={1}
              />
              <p className="text-xs text-muted-foreground">
                ~{(shortFlights * EMISSION_FACTORS.shortFlight / 1000).toFixed(2)} tCO₂e
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Long-haul Flights per Year (&gt;3 hrs)</Label>
                <span className="font-semibold text-sm">{longFlights}</span>
              </div>
              <Slider
                value={[longFlights]}
                onValueChange={([v]) => setLongFlights(v)}
                min={0} max={10} step={1}
              />
              <p className="text-xs text-muted-foreground">
                ~{(longFlights * EMISSION_FACTORS.longFlight / 1000).toFixed(2)} tCO₂e
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Car Travel (km/month)</Label>
                <span className="font-semibold text-sm">{carKmPerMonth} km</span>
              </div>
              <Slider
                value={[carKmPerMonth]}
                onValueChange={([v]) => setCarKmPerMonth(v)}
                min={0} max={3000} step={50}
              />
              <p className="text-xs text-muted-foreground">
                ~{(carKmPerMonth * 12 * EMISSION_FACTORS.carKm / 1000).toFixed(2)} tCO₂e/year
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Home Energy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> Home Energy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Electricity Consumption (kWh/month)</Label>
                <span className="font-semibold text-sm">{electricityKwhPerMonth} kWh</span>
              </div>
              <Slider
                value={[electricityKwhPerMonth]}
                onValueChange={([v]) => setElectricityKwhPerMonth(v)}
                min={0} max={1000} step={10}
              />
              <p className="text-xs text-muted-foreground">
                ~{(electricityKwhPerMonth * 12 * EMISSION_FACTORS.electricityKwh / 1000).toFixed(2)} tCO₂e/year
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>LPG Cylinders Used (per year)</Label>
                <span className="font-semibold text-sm">{lpgCylindersPerYear} cylinders</span>
              </div>
              <Slider
                value={[lpgCylindersPerYear]}
                onValueChange={([v]) => setLpgCylindersPerYear(v)}
                min={0} max={24} step={1}
              />
              <p className="text-xs text-muted-foreground">
                ~{(lpgCylindersPerYear * EMISSION_FACTORS.lpgCylinder / 1000).toFixed(2)} tCO₂e/year
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Diet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Beef className="h-4 w-4 text-green-500" /> Diet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Your Diet Type</Label>
            <Select value={diet} onValueChange={(v) => setDiet(v as DietType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegan">Vegan (~1.2 tCO₂e/year)</SelectItem>
                <SelectItem value="vegetarian">Vegetarian (~1.5 tCO₂e/year)</SelectItem>
                <SelectItem value="meat-occasional">Occasional Meat (~2.2 tCO₂e/year)</SelectItem>
                <SelectItem value="meat-regular">Regular Meat (~2.8 tCO₂e/year)</SelectItem>
                <SelectItem value="meat-heavy">Heavy Meat (~3.3 tCO₂e/year)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Shopping */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-purple-500" /> Shopping & Consumption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <Label>Monthly Shopping Spend (₹10,000 units)</Label>
              <span className="font-semibold text-sm">₹{(shoppingPer10k * 10000).toLocaleString()}</span>
            </div>
            <Slider
              value={[shoppingPer10k]}
              onValueChange={([v]) => setShoppingPer10k(v)}
              min={0} max={20} step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              ~{(shoppingPer10k * 12 * EMISSION_FACTORS.shoppingPer10k / 1000).toFixed(2)} tCO₂e/year
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 justify-center">
        <Button size="lg" onClick={() => setShowResults(true)}>
          Calculate My Footprint
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {showResults && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl">Your Annual Carbon Footprint</CardTitle>
            <CardDescription>
              Based on your inputs, here is your estimated annual CO₂ equivalent emissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total */}
            <div className="text-center py-4 bg-primary/5 rounded-lg">
              <div className="text-5xl font-bold text-primary">{totalTonnes.toFixed(2)}</div>
              <div className="text-lg text-muted-foreground mt-1">tonnes CO₂e per year</div>
              <div className="text-sm text-muted-foreground mt-2">
                Indian average: {indianAvgTonnes} tCO₂e &nbsp;|&nbsp; Global average: 4.8 tCO₂e
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold">Breakdown by Category</h4>
              {categories.map((cat) => {
                const pct = totalKg > 0 ? (cat.value / totalKg) * 100 : 0;
                const Icon = cat.icon;
                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {cat.label}
                      </span>
                      <span className="font-medium">
                        {(cat.value / 1000).toFixed(2)} t &nbsp;
                        <span className="text-muted-foreground">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Credits needed */}
            <div className="rounded-lg border p-4 space-y-3 bg-card">
              <h4 className="font-semibold flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                Carbon Credit Offset Recommendation
              </h4>
              <p className="text-muted-foreground text-sm">
                To fully offset your annual carbon footprint, you need to retire approximately:
              </p>
              <div className="text-3xl font-bold text-primary">
                {creditsNeeded} tCO₂e
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase verified carbon credits from the BCX marketplace to offset these emissions.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/marketplace">
                  Browse Carbon Credits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
