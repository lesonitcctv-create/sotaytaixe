import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Calculator, Settings, Car } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type FareConfig = {
  id: string;
  name: string;
  openingPrice: string;
  openingDistance: string;
  nextPrice: string;
  longDistancePrice: string;
  longDistanceThreshold: string;
  waitPrice: string;
};

const FARE_CONFIGS: FareConfig[] = [
  {
    id: 'vf5_vfe34',
    name: 'Xanh SM Taxi (VF 5, VF e34)',
    openingPrice: '20000',
    openingDistance: '1',
    nextPrice: '15500',
    longDistancePrice: '12500',
    longDistanceThreshold: '25',
    waitPrice: '1000',
  },
  {
    id: 'vf8',
    name: 'Xanh SM Luxury (VF 8)',
    openingPrice: '21000',
    openingDistance: '1',
    nextPrice: '21000',
    longDistancePrice: '21000',
    longDistanceThreshold: '25',
    waitPrice: '1000',
  },
  {
    id: 'standard_4',
    name: 'Taxi 4 chỗ (Tiêu chuẩn)',
    openingPrice: '10000',
    openingDistance: '0.5',
    nextPrice: '14500',
    longDistancePrice: '12000',
    longDistanceThreshold: '20',
    waitPrice: '500',
  },
  {
    id: 'standard_7',
    name: 'Taxi 7 chỗ (Tiêu chuẩn)',
    openingPrice: '12000',
    openingDistance: '0.5',
    nextPrice: '16500',
    longDistancePrice: '14000',
    longDistanceThreshold: '20',
    waitPrice: '500',
  },
  {
    id: 'custom',
    name: 'Tùy chỉnh',
    openingPrice: '20000',
    openingDistance: '1',
    nextPrice: '15500',
    longDistancePrice: '12500',
    longDistanceThreshold: '25',
    waitPrice: '1000',
  }
];

export function TaxiFareCalculator() {
  const [distance, setDistance] = useState<string>('');
  const [waitTime, setWaitTime] = useState<string>('');
  
  const [selectedPreset, setSelectedPreset] = useState<string>('vf5_vfe34');

  // Default settings (based on common taxi rates, e.g., Xanh SM Luxury or similar)
  const [openingPrice, setOpeningPrice] = useState<string>('20000');
  const [openingDistance, setOpeningDistance] = useState<string>('1');
  const [nextPrice, setNextPrice] = useState<string>('15500'); // Price up to 25km
  const [longDistancePrice, setLongDistancePrice] = useState<string>('12500'); // Price after 25km
  const [longDistanceThreshold, setLongDistanceThreshold] = useState<string>('25');
  const [waitPrice, setWaitPrice] = useState<string>('1000'); // Per minute

  const [totalFare, setTotalFare] = useState<number | null>(null);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const config = FARE_CONFIGS.find(c => c.id === value);
    if (config && value !== 'custom') {
      setOpeningPrice(config.openingPrice);
      setOpeningDistance(config.openingDistance);
      setNextPrice(config.nextPrice);
      setLongDistancePrice(config.longDistancePrice);
      setLongDistanceThreshold(config.longDistanceThreshold);
      setWaitPrice(config.waitPrice);
    }
  };

  const handleManualChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setSelectedPreset('custom');
  };

  const calculateFare = () => {
    const dist = parseFloat(distance);
    const wait = parseFloat(waitTime) || 0;
    
    if (isNaN(dist) || dist < 0) {
      setTotalFare(null);
      return;
    }

    const openPrice = parseFloat(openingPrice);
    const openDist = parseFloat(openingDistance);
    const nextP = parseFloat(nextPrice);
    const longP = parseFloat(longDistancePrice);
    const longThresh = parseFloat(longDistanceThreshold);
    const waitP = parseFloat(waitPrice);

    let fare = 0;

    // Opening fare
    if (dist <= openDist) {
      fare = openPrice;
    } else {
      fare = openPrice;
      const remainingDist = dist - openDist;
      
      if (dist <= longThresh) {
        fare += remainingDist * nextP;
      } else {
        // Distance between opening and threshold
        const middleDist = longThresh - openDist;
        fare += middleDist * nextP;
        
        // Distance after threshold
        const longDist = dist - longThresh;
        fare += longDist * longP;
      }
    }

    // Wait time fare
    fare += wait * waitP;

    setTotalFare(Math.round(fare / 1000) * 1000); // Round to nearest 1000
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tính Cước Taxi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Loại xe / Biểu cước</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại xe" />
            </SelectTrigger>
            <SelectContent>
              {FARE_CONFIGS.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="distance">Quãng đường (km)</Label>
            <Input
              id="distance"
              type="number"
              placeholder="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waitTime">Thời gian chờ (phút)</Label>
            <Input
              id="waitTime"
              type="number"
              placeholder="0"
              value={waitTime}
              onChange={(e) => setWaitTime(e.target.value)}
            />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue={selectedPreset === 'custom' ? 'settings' : undefined}>
          <AccordionItem value="settings">
            <AccordionTrigger className="text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Chi tiết giá cước {selectedPreset === 'custom' ? '(Tùy chỉnh)' : ''}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Giá mở cửa (VND)</Label>
                    <Input className="h-8" value={openingPrice} onChange={(e) => handleManualChange(setOpeningPrice, e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Km mở cửa</Label>
                    <Input className="h-8" value={openingDistance} onChange={(e) => handleManualChange(setOpeningDistance, e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Giá km tiếp theo</Label>
                    <Input className="h-8" value={nextPrice} onChange={(e) => handleManualChange(setNextPrice, e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ngưỡng km xa</Label>
                    <Input className="h-8" value={longDistanceThreshold} onChange={(e) => handleManualChange(setLongDistanceThreshold, e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Giá km xa</Label>
                    <Input className="h-8" value={longDistancePrice} onChange={(e) => handleManualChange(setLongDistancePrice, e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Giá chờ (phút)</Label>
                    <Input className="h-8" value={waitPrice} onChange={(e) => handleManualChange(setWaitPrice, e.target.value)} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button className="w-full" onClick={calculateFare}>
          Tính Tiền
        </Button>

        {totalFare !== null && (
          <div className="mt-6 text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Tổng cước ước tính</p>
            <p className="text-3xl font-bold text-primary">
              {totalFare.toLocaleString()} VND
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
