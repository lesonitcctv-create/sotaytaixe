import { useState } from 'react';
import { TripRevenue, deleteTripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Pencil } from 'lucide-react';

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Lịch Sử Cuốc Xe</CardTitle>
        <div className="w-[140px]">
            <Select value={filterApp} onValueChange={setFilterApp}>
                <SelectTrigger>
                    <SelectValue placeholder="Lọc theo App" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Xanh SM">Xanh SM</SelectItem>
                    <SelectItem value="Be">Be</SelectItem>
                    <SelectItem value="Grab">Grab</SelectItem>
                </SelectContent>
            </Select>
        </div>
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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
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
                      <div className="flex justify-end gap-2">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(record)}
                              title="Sửa"
                          >
                              <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => record.id && handleDelete(record.id)}
                              title="Xóa"
                          >
                              <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy cuốc xe nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
