import { TripRevenue, deleteTripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface TripListProps {
  records: TripRevenue[];
  onRecordDeleted: () => void;
}

export function TripList({ records, onRecordDeleted }: TripListProps) {
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

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Cuốc Xe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Chưa có dữ liệu cuốc xe.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch Sử Cuốc Xe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>App</TableHead>
                <TableHead>Doanh Thu</TableHead>
                <TableHead>% Chiết Khấu</TableHead>
                <TableHead>Thực Nhận</TableHead>
                <TableHead>Quãng Đường</TableHead>
                <TableHead className="hidden md:table-cell">Ghi Chú</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date.toLocaleDateString()}</TableCell>
                  <TableCell>{record.app}</TableCell>
                  <TableCell>{record.revenue.toLocaleString()} VND</TableCell>
                  <TableCell>{record.discount}%</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {(record.actualRevenue || record.revenue * (1 - (record.discount || 0) / 100)).toLocaleString()} VND
                  </TableCell>
                  <TableCell>{record.distance} km</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {record.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => record.id && handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
