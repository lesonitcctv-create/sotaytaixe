import React, { useState } from 'react';
import { addTripRevenue, TripRevenue } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TripFormProps {
  onRecordAdded: () => void;
}

export function TripForm({ onRecordAdded }: TripFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    app: 'Xanh SM',
    revenue: '',
    distance: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppChange = (value: string) => {
    setFormData((prev) => ({ ...prev, app: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const record: Omit<TripRevenue, 'id'> = {
        userId: user.uid,
        date: new Date(formData.date),
        app: formData.app as 'Xanh SM' | 'Be' | 'Grab',
        revenue: Number(formData.revenue),
        distance: Number(formData.distance),
        notes: formData.notes,
      };

      await addTripRevenue(record);
      onRecordAdded();
      setFormData({
        date: new Date().toISOString().slice(0, 16),
        app: 'Xanh SM',
        revenue: '',
        distance: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding trip revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm Cuốc Xe Mới</CardTitle>
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
              <Label htmlFor="app">Ứng Dụng</Label>
              <Select onValueChange={handleAppChange} defaultValue={formData.app}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ứng dụng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Xanh SM">Xanh SM</SelectItem>
                  <SelectItem value="Be">Be</SelectItem>
                  <SelectItem value="Grab">Grab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Doanh Thu (VND)</Label>
              <Input
                id="revenue"
                name="revenue"
                type="number"
                value={formData.revenue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Quãng Đường (km)</Label>
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
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
            {loading ? 'Đang thêm...' : 'Thêm Cuốc Xe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
