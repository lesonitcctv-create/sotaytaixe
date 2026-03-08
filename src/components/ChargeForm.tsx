import React, { useState } from 'react';
import { addChargingSession, ChargingSession } from '../services/chargeService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ChargeFormProps {
  onSessionAdded: () => void;
}

export function ChargeForm({ onSessionAdded }: ChargeFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    location: '',
    batteryLevelStart: '',
    batteryLevelEnd: '',
    energyAdded: '',
    cost: '',
    duration: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const session: Omit<ChargingSession, 'id'> = {
        userId: user.uid,
        date: new Date(formData.date),
        location: formData.location,
        batteryLevelStart: Number(formData.batteryLevelStart),
        batteryLevelEnd: Number(formData.batteryLevelEnd),
        energyAdded: Number(formData.energyAdded),
        cost: Number(formData.cost),
        duration: Number(formData.duration),
        notes: formData.notes,
      };

      await addChargingSession(session);
      onSessionAdded();
      setFormData({
        date: new Date().toISOString().slice(0, 16),
        location: '',
        batteryLevelStart: '',
        batteryLevelEnd: '',
        energyAdded: '',
        cost: '',
        duration: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm Lần Sạc Mới</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày & Giờ</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Địa Điểm</Label>
              <Input
                id="location"
                name="location"
                placeholder="ví dụ: Vincom Center"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batteryLevelStart">Pin Bắt Đầu %</Label>
              <Input
                id="batteryLevelStart"
                name="batteryLevelStart"
                type="number"
                min="0"
                max="100"
                value={formData.batteryLevelStart}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batteryLevelEnd">Pin Kết Thúc %</Label>
              <Input
                id="batteryLevelEnd"
                name="batteryLevelEnd"
                type="number"
                min="0"
                max="100"
                value={formData.batteryLevelEnd}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energyAdded">Năng Lượng Đã Nạp (kWh)</Label>
              <Input
                id="energyAdded"
                name="energyAdded"
                type="number"
                step="0.01"
                value={formData.energyAdded}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Chi Phí (VND)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Thời Gian (phút)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi Chú</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Đang thêm...' : 'Thêm Lần Sạc'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
