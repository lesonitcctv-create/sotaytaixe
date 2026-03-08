import { DailyRevenue, deleteDailyRevenue } from '../services/revenueService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface RevenueListProps {
  records: DailyRevenue[];
  onRecordDeleted: () => void;
}

export function RevenueList({ records, onRecordDeleted }: RevenueListProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
      await deleteDailyRevenue(id);
      onRecordDeleted();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch Sử Doanh Thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Doanh Thu (VND)</th>
                <th className="px-4 py-3">Quãng Đường (km)</th>
                <th className="px-4 py-3">Ghi Chú</th>
                <th className="px-4 py-3">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">{record.date.toLocaleDateString()}</td>
                  <td className="px-4 py-3">{record.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.distance}</td>
                  <td className="px-4 py-3">{record.notes}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => record.id && handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Không tìm thấy lịch sử doanh thu nào.
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
