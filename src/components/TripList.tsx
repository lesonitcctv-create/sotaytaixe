import { useState } from 'react';
import { TripRevenue, deleteTripRevenue } from '../services/tripService';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Trash2, Pencil, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface TripListProps {
  records: TripRevenue[];
  onRecordDeleted: () => void;
  onEdit: (record: TripRevenue) => void;
}

export function TripList({ records, onRecordDeleted, onEdit }: TripListProps) {
  const [filterApp, setFilterApp] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốc xe này không?')) {
      try {
        await deleteTripRevenue(id);
        onRecordDeleted();
      } catch (error) {
        console.error('Error deleting trip revenue:', error);
      }
    }
  };

  const filteredRecords = filterApp === 'all'
    ? records
    : records.filter(record => record.app === filterApp);

  if (records.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Chưa có dữ liệu cuốc xe.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#003d71] uppercase tracking-tight">Lịch Sử Cuốc Xe</h3>
        <div className="w-[120px]">
            <Select value={filterApp} onValueChange={setFilterApp}>
                <SelectTrigger className="w-full h-8 rounded-full bg-muted border-none text-xs font-bold">
                    <SelectValue placeholder="Lọc App" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-none shadow-xl">
                    <SelectItem value="all" className="text-xs font-bold">Tất cả</SelectItem>
                    <SelectItem value="Xanh SM" className="text-xs font-bold text-[#00a1e4]">Xanh SM</SelectItem>
                    <SelectItem value="Be" className="text-xs font-bold text-yellow-600">Be</SelectItem>
                    <SelectItem value="Grab" className="text-xs font-bold text-green-600">Grab</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Left Side - App & Date */}
                  <div className={cn(
                    "p-4 sm:w-40 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-slate-100",
                    record.app === 'Xanh SM' ? 'bg-blue-50/50' : 
                    record.app === 'Be' ? 'bg-yellow-50/50' : 
                    'bg-green-50/50'
                  )}>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2",
                      record.app === 'Xanh SM' ? 'bg-[#00a1e4] text-white' : 
                      record.app === 'Be' ? 'bg-yellow-500 text-white' : 
                      'bg-green-600 text-white'
                    )}>
                      {record.app}
                    </div>
                    <div className="text-lg font-black text-[#003d71]">
                      {format(record.date, 'dd/MM')}
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      {format(record.date, 'yyyy')}
                    </div>
                  </div>

                  {/* Right Side - Financials */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thực nhận</div>
                        <div className="text-2xl font-black text-green-600 leading-none">
                          {(record.actualRevenue || record.revenue * (1 - (record.discount || 0) / 100)).toLocaleString()}đ
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quãng đường</div>
                        <div className="flex items-center justify-end gap-1 text-slate-700 font-black">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{record.distance} <span className="text-[10px] font-normal">km</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                       <div className="space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu gốc</div>
                          <div className="text-sm font-bold text-slate-500 line-through decoration-slate-300">
                            {record.revenue.toLocaleString()}đ
                          </div>
                       </div>
                       <div className="space-y-0.5 text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chiết khấu</div>
                          <div className="text-sm font-bold text-red-400">
                            -{record.discount}%
                          </div>
                       </div>
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-500 italic">
                        "{record.notes}"
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(record)}
                        className="h-8 rounded-full text-[#00a1e4] hover:bg-blue-50 font-bold uppercase text-[10px] tracking-wider"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => record.id && handleDelete(record.id)}
                        className="h-8 rounded-full text-red-400 hover:bg-red-50 font-bold uppercase text-[10px] tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
            Không tìm thấy cuốc xe nào.
          </div>
        )}
      </div>
    </div>
  );
}
