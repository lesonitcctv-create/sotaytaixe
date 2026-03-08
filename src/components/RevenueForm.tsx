import React, { useState } from 'react';
import { addDailyRevenue, DailyRevenue } from '../services/revenueService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface RevenueFormProps {
  onRecordAdded: () => void;
}

export function RevenueForm({ onRecordAdded }: RevenueFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    revenue: '',
    distance: '',
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
      const record: Omit<DailyRevenue, 'id'> = {
        userId: user.uid,
        date: new Date(formData.date),
        revenue: Number(formData.revenue),
        distance: Number(formData.distance),
        notes: formData.notes,
      };

      await addDailyRevenue(record);
      onRecordAdded();
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        revenue: '',
        distance: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding revenue record:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm Doanh Thu Ngày</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
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
            {loading ? 'Đang thêm...' : 'Thêm Doanh Thu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
