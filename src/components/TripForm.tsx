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
    discount: localStorage.getItem('lastDiscount') || '',
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

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-digit characters
    const rawValue = value.replace(/\D/g, '');
    
    if (rawValue === '') {
      setFormData((prev) => ({ ...prev, revenue: '' }));
      return;
    }

    // Format with commas
    const formatted = Number(rawValue).toLocaleString('en-US');
    setFormData((prev) => ({ ...prev, revenue: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const revenue = Number(formData.revenue.replace(/,/g, ''));
      const discount = Number(formData.discount);
      const actualRevenue = revenue - (revenue * discount / 100);

      const record: Omit<TripRevenue, 'id'> = {
        userId: user.uid,
        date: new Date(formData.date),
        app: formData.app as 'Xanh SM' | 'Be' | 'Grab',
        revenue: revenue,
        discount: discount,
        actualRevenue: actualRevenue,
        distance: Number(formData.distance),
        notes: formData.notes,
      };

      await addTripRevenue(record);
      onRecordAdded();
      
      // Save discount to localStorage
      localStorage.setItem('lastDiscount', String(discount));

      setFormData({
        date: new Date().toISOString().slice(0, 16),
        app: 'Xanh SM',
        revenue: '',
        discount: String(discount), // Keep the discount for the next entry
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
                type="text"
                value={formData.revenue}
                onChange={handleRevenueChange}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Chiết Khấu App (%)</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>Doanh Thu Thực Nhận</Label>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                {formData.revenue && formData.discount
                  ? (Number(formData.revenue.replace(/,/g, '')) * (1 - Number(formData.discount) / 100)).toLocaleString()
                  : '0'}{' '}
                VND
              </div>
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
