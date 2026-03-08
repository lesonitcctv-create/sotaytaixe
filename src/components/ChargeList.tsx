import { ChargingSession, deleteChargingSession } from '../services/chargeService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch Sử Sạc</CardTitle>
      </CardHeader>
      <CardContent>
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
                <th className="px-4 py-3">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">{session.date.toLocaleDateString()} {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{session.location}</td>
                  <td className="px-4 py-3">{session.batteryLevelStart}% - {session.batteryLevelEnd}%</td>
                  <td className="px-4 py-3">{session.energyAdded}</td>
                  <td className="px-4 py-3">{session.cost.toLocaleString()}</td>
                  <td className="px-4 py-3">{session.duration}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => session.id && handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
                    Không tìm thấy lịch sử sạc nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
