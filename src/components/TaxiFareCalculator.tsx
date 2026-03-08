import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Calculator, Settings, Save, Trash2, MapPin, Loader2, Plus } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  getFareConfigs, 
  addFareConfig, 
  deleteFareConfig, 
  FareConfig 
} from '@/services/fareConfigService';
import { estimateTollFees, TollEstimate } from '../services/tollService';

// Default presets
const DEFAULT_CONFIGS: Omit<FareConfig, 'userId'>[] = [
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
  }
];

interface TaxiFareCalculatorProps {
  userId?: string;
}

export function TaxiFareCalculator({ userId }: TaxiFareCalculatorProps) {
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Calculator State
  const [distance, setDistance] = useState<string>('');
  const [waitTime, setWaitTime] = useState<string>('');
  const [extraFee, setExtraFee] = useState<string>('');
  
  const [selectedPreset, setSelectedPreset] = useState<string>('vf5_vfe34');
  const [customConfigs, setCustomConfigs] = useState<FareConfig[]>([]);

  // Config State
  const [openingPrice, setOpeningPrice] = useState<string>('20000');
  const [openingDistance, setOpeningDistance] = useState<string>('1');
  const [nextPrice, setNextPrice] = useState<string>('15500');
  const [longDistancePrice, setLongDistancePrice] = useState<string>('12500');
  const [longDistanceThreshold, setLongDistanceThreshold] = useState<string>('25');
  const [waitPrice, setWaitPrice] = useState<string>('1000');

  const [totalFare, setTotalFare] = useState<number | null>(null);
  
  // Save Config State
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');

  // Toll Estimator State
  const [tollStart, setTollStart] = useState('');
  const [tollEnd, setTollEnd] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [tollEstimate, setTollEstimate] = useState<TollEstimate | null>(null);

  // Load custom configs
  useEffect(() => {
    if (userId) {
      loadCustomConfigs();
    }
  }, [userId]);

  const loadCustomConfigs = async () => {
    if (!userId) return;
    try {
      const configs = await getFareConfigs(userId);
      setCustomConfigs(configs);
    } catch (error) {
      console.error('Failed to load configs', error);
    }
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    setShowSaveInput(false);
    
    if (value === 'custom') return;

    const defaultConfig = DEFAULT_CONFIGS.find(c => c.id === value);
    const customConfig = customConfigs.find(c => c.id === value);
    const config = defaultConfig || customConfig;

    if (config) {
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

  const handleSaveConfig = async () => {
    if (!userId || !newConfigName.trim()) return;
    
    setIsSaving(true);
    try {
      const newConfig = {
        userId,
        name: newConfigName,
        openingPrice,
        openingDistance,
        nextPrice,
        longDistancePrice,
        longDistanceThreshold,
        waitPrice,
      };
      
      await addFareConfig(newConfig);
      await loadCustomConfigs();
      setShowSaveInput(false);
      setNewConfigName('');
      // Select the newly created config (logic simplified, might need ID)
    } catch (error) {
      console.error('Error saving config', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa cấu hình này?')) return;
    try {
      await deleteFareConfig(id);
      await loadCustomConfigs();
      setSelectedPreset('vf5_vfe34'); // Reset to default
      handlePresetChange('vf5_vfe34');
    } catch (error) {
      console.error('Error deleting config', error);
    }
  };

  const calculateFare = () => {
    const dist = parseFloat(distance);
    const wait = parseFloat(waitTime) || 0;
    const extra = parseFloat(extraFee) || 0;
    
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
        const middleDist = longThresh - openDist;
        fare += middleDist * nextP;
        const longDist = dist - longThresh;
        fare += longDist * longP;
      }
    }

    fare += wait * waitP;
    fare += extra;

    setTotalFare(Math.round(fare / 1000) * 1000);
  };

  const handleEstimateToll = async () => {
    if (!tollStart || !tollEnd) return;
    setIsEstimating(true);
    setTollEstimate(null);
    try {
      const result = await estimateTollFees(tollStart, tollEnd);
      setTollEstimate(result);
    } catch (error) {
      console.error(error);
      alert('Không thể ước tính phí. Vui lòng thử lại.');
    } finally {
      setIsEstimating(false);
    }
  };

  const applyTollToCalculator = () => {
    if (tollEstimate) {
      setExtraFee(tollEstimate.totalFee.toString());
      if (tollEstimate.distance) {
        // Try to parse distance "120 km" -> "120"
        const distMatch = tollEstimate.distance.match(/(\d+(\.\d+)?)/);
        if (distMatch) {
          setDistance(distMatch[0]);
        }
      }
      setActiveTab('calculator');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tính Cước Taxi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="calculator" className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Tính Cước</TabsTrigger>
            <TabsTrigger value="toll" className="hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Ước Tính Phí</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            <div className="space-y-2">
              <Label>Cấu hình giá cước</Label>
              <div className="flex gap-2">
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    <SelectItem value="custom">Tùy chỉnh...</SelectItem>
                    {DEFAULT_CONFIGS.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name}
                      </SelectItem>
                    ))}
                    {customConfigs.length > 0 && <div className="h-px bg-muted my-1" />}
                    {customConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name} (Của tôi)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Delete button for custom configs */}
                {customConfigs.find(c => c.id === selectedPreset) && (
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDeleteConfig(selectedPreset)}
                    title="Xóa cấu hình"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Save Config UI */}
            {(selectedPreset === 'custom' || showSaveInput) && userId && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                {showSaveInput ? (
                  <>
                    <Input 
                      placeholder="Tên cấu hình mới..." 
                      value={newConfigName}
                      onChange={(e) => setNewConfigName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleSaveConfig} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>Hủy</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSaveInput(true)}>
                    <Plus className="h-3 w-3 mr-1" /> Lưu cấu hình hiện tại
                  </Button>
                )}
              </div>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="extraFee">Phụ phí (Cầu đường, bến bãi)</Label>
              <div className="relative">
                <Input
                  id="extraFee"
                  type="number"
                  placeholder="0"
                  value={extraFee}
                  onChange={(e) => setExtraFee(e.target.value)}
                  className="pl-8"
                />
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₫</span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue={selectedPreset === 'custom' ? 'settings' : undefined}>
              <AccordionItem value="settings">
                <AccordionTrigger className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Chi tiết đơn giá
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

            <Button className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={calculateFare}>
              Tính Tiền
            </Button>

            {totalFare !== null && (
              <div className="mt-6 text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-in zoom-in duration-300">
                <p className="text-sm text-muted-foreground mb-1">Tổng cước ước tính</p>
                <p className="text-3xl font-bold text-primary">
                  {totalFare.toLocaleString()} VND
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="toll" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Điểm đi</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Ví dụ: Hà Nội" 
                    className="pl-9"
                    value={tollStart}
                    onChange={(e) => setTollStart(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Điểm đến</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Ví dụ: Hải Phòng" 
                    className="pl-9"
                    value={tollEnd}
                    onChange={(e) => setTollEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" 
                onClick={handleEstimateToll} 
                disabled={isEstimating || !tollStart || !tollEnd}
              >
                {isEstimating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang ước tính...
                  </>
                ) : (
                  'Ước tính phí cầu đường'
                )}
              </Button>
            </div>

            {tollEstimate && (
              <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Khoảng cách:</span>
                    <span className="font-medium">{tollEstimate.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{tollEstimate.duration}</span>
                  </div>
                  <div className="pt-1 text-xs text-muted-foreground border-t mt-1">
                    {tollEstimate.routeDescription}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Các trạm thu phí dự kiến:</h4>
                  <div className="border rounded-md divide-y">
                    {tollEstimate.stations.map((station, idx) => (
                      <div key={idx} className="flex justify-between p-2 text-sm">
                        <span>{station.name}</span>
                        <span className="font-medium">{station.fee.toLocaleString()} đ</span>
                      </div>
                    ))}
                    {tollEstimate.stations.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Không tìm thấy trạm thu phí nào.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="font-medium">Tổng phí cầu đường:</span>
                  <span className="text-lg font-bold text-primary">
                    {tollEstimate.totalFee.toLocaleString()} VND
                  </span>
                </div>

                <Button variant="secondary" className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={applyTollToCalculator}>
                  Áp dụng vào tính cước
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
