import { ChargingSession, deleteChargingSession } from '../services/chargeService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2, MapPin, Calendar, Zap, Clock, DollarSign } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Sạc</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Chưa có lịch sử sạc nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lịch Sử Sạc</h3>

      {/* Mobile View (Cards) */}
      <div className="grid gap-4 md:hidden">
        {sessions.map((session) => (
          <Card key={session.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {session.date.toLocaleDateString()} {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-bold text-red-600">
                  -{session.cost.toLocaleString()} đ
                </div>
              </div>

              <div className="flex items-start gap-2 mb-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="flex-1">{session.location}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 p-2 rounded mb-3">
                <div className="flex flex-col items-center">
                  <Zap className="h-3 w-3 text-yellow-600 mb-1" />
                  <span className="font-medium">{session.energyAdded} kWh</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-3 w-3 text-blue-600 mb-1" />
                  <span className="font-medium">{session.duration} p</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-muted-foreground mb-1">Pin</span>
                  <span className="font-medium">{session.batteryLevelStart}% - {session.batteryLevelEnd}%</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => session.id && handleDelete(session.id)}
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Địa Điểm</th>
                  <th className="px-4 py-3">Pin</th>
                  <th className="px-4 py-3">Năng Lượng (kWh)</th>
                  <th className="px-4 py-3">Chi Phí (VND)</th>
                  <th className="px-4 py-3">Thời Gian (phút)</th>
                  <th className="px-4 py-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {session.date.toLocaleDateString()} {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={session.location}>{session.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{session.batteryLevelStart}% - {session.batteryLevelEnd}%</td>
                    <td className="px-4 py-3">{session.energyAdded}</td>
                    <td className="px-4 py-3">{session.cost.toLocaleString()}</td>
                    <td className="px-4 py-3">{session.duration}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => session.id && handleDelete(session.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
