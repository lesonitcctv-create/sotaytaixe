import React, { useState, useEffect } from 'react';
import { addTripRevenue, updateTripRevenue, TripRevenue } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, X } from 'lucide-react';

interface TripFormProps {
  onRecordAdded: () => void;
  editingTrip?: TripRevenue | null;
  onCancelEdit?: () => void;
}

export function TripForm({ onRecordAdded, editingTrip, onCancelEdit }: TripFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
    app: 'Xanh SM',
    revenue: '',
    discount: localStorage.getItem('lastDiscount') || '',
    distance: '',
    notes: '',
  });

  useEffect(() => {
    if (editingTrip) {
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const dateStr = new Date(editingTrip.date.getTime() - (editingTrip.date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      
      setFormData({
        date: dateStr,
        app: editingTrip.app,
        revenue: editingTrip.revenue.toLocaleString('en-US'),
        discount: String(editingTrip.discount),
        distance: String(editingTrip.distance),
        notes: editingTrip.notes || '',
      });
    } else {
        // Reset form when not editing
        setFormData({
            date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
            app: 'Xanh SM',
            revenue: '',
            discount: localStorage.getItem('lastDiscount') || '',
            distance: '',
            notes: '',
        });
    }
  }, [editingTrip]);

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

  const handleSetCurrentTime = () => {
    const now = new Date();
    // Adjust for timezone offset to display correct local time
    const localIsoString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, date: localIsoString }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const revenue = Number(formData.revenue.replace(/,/g, ''));
      const discount = Number(formData.discount);
      const actualRevenue = revenue - (revenue * discount / 100);

      const recordData = {
        userId: user.uid,
        date: new Date(formData.date),
        app: formData.app as 'Xanh SM' | 'Be' | 'Grab',
        revenue: revenue,
        discount: discount,
        actualRevenue: actualRevenue,
        distance: Number(formData.distance),
        notes: formData.notes,
      };

      if (editingTrip && editingTrip.id) {
        await updateTripRevenue(editingTrip.id, recordData);
        if (onCancelEdit) onCancelEdit();
      } else {
        await addTripRevenue(recordData);
        // Save discount to localStorage only on new add
        localStorage.setItem('lastDiscount', String(discount));
        
        // Reset form but keep discount
        setFormData({
            date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
            app: 'Xanh SM',
            revenue: '',
            discount: String(discount),
            distance: '',
            notes: '',
        });
      }
      
      onRecordAdded();

    } catch (error) {
      console.error('Error saving trip revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{editingTrip ? 'Cập Nhật Cuốc Xe' : 'Thêm Cuốc Xe Mới'}</CardTitle>
        {editingTrip && onCancelEdit && (
            <Button variant="ghost" size="icon" onClick={onCancelEdit}>
                <X className="h-4 w-4" />
            </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày & Giờ</Label>
              <div className="flex gap-2">
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSetCurrentTime}
                  title="Lấy giờ hiện tại"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app">Ứng Dụng</Label>
              <Select onValueChange={handleAppChange} value={formData.app}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ứng dụng" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Xanh SM" className="bg-blue-500 text-white focus:bg-blue-600 focus:text-white">Xanh SM</SelectItem>
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
          <div className="flex gap-2">
            {editingTrip && onCancelEdit && (
                <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full">
                    Hủy
                </Button>
            )}
            <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                {loading ? 'Đang lưu...' : (editingTrip ? 'Cập Nhật' : 'Thêm Cuốc Xe')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
