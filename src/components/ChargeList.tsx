import { ChargingSession, deleteChargingSession } from '../services/chargeService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, MapPin, Calendar, Zap, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChargeListProps {
  sessions: ChargingSession[];
  onSessionDeleted: () => void;
}

export function ChargeList({ sessions, onSessionDeleted }: ChargeListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lần sạc này không?')) {
      await deleteChargingSession(id);
      onSessionDeleted();
    }
  };

  if (sessions.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Chưa có lịch sử sạc nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-[#003d71] uppercase tracking-tight">Lịch Sử Sạc</h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {sessions.length} phiên
        </span>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Left Side - Date & Cost */}
                <div className="p-4 sm:w-48 bg-slate-50 flex flex-col justify-center items-center sm:items-start border-b sm:border-b-0 sm:border-r border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {format(session.date, 'eeee', { locale: vi })}
                  </div>
                  <div className="text-lg font-black text-[#003d71]">
                    {format(session.date, 'dd/MM/yyyy')}
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    {format(session.date, 'HH:mm')}
                  </div>
                  <div className="mt-2 text-lg font-black text-red-600">
                    -{session.cost.toLocaleString()}đ
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 p-1.5 rounded-lg bg-blue-50">
                        <MapPin className="h-4 w-4 text-[#00a1e4]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa điểm sạc</div>
                        <div className="text-sm font-bold text-slate-700 leading-tight">{session.location}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Năng lượng</div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                          <span className="text-sm font-black text-slate-700">{session.energyAdded} <span className="text-[10px] font-normal">kWh</span></span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm font-black text-slate-700">{session.duration} <span className="text-[10px] font-normal">phút</span></span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mức Pin</div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-green-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          </div>
                          <span className="text-sm font-black text-slate-700">{session.batteryLevelStart}% <span className="font-normal text-slate-300">→</span> {session.batteryLevelEnd}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => session.id && handleDelete(session.id)}
                      className="h-8 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Xóa bản ghi</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
