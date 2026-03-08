import { useState } from 'react';
import { TripRevenue, deleteTripRevenue } from '../services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Pencil, MapPin, Calendar, DollarSign } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lịch Sử Cuốc Xe</h3>
        <div className="w-[140px]">
            <Select value={filterApp} onValueChange={setFilterApp}>
                <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Lọc theo App" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Xanh SM" className="bg-blue-500 text-white focus:bg-blue-600 focus:text-white">Xanh SM</SelectItem>
                    <SelectItem value="Be">Be</SelectItem>
                    <SelectItem value="Grab">Grab</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="grid gap-4 md:hidden">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.app === 'Xanh SM' ? 'bg-blue-100 text-blue-700' :
                      record.app === 'Be' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700' // Default/Grab
                    }`}>
                      {record.app}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold text-green-600">
                    {(record.actualRevenue || record.revenue * (1 - (record.discount || 0) / 100)).toLocaleString()} đ
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Doanh thu gốc</span>
                    <span>{record.revenue.toLocaleString()} đ</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Quãng đường</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {record.distance} km
                    </span>
                  </div>
                </div>

                {record.notes && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-3">
                    {record.notes}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t pt-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(record)}
                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => record.id && handleDelete(record.id)}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            Không tìm thấy cuốc xe nào.
          </div>
        )}
      </div>

      {/* Desktop View (Table) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Ngày</TableHead>
                <TableHead className="whitespace-nowrap">App</TableHead>
                <TableHead className="whitespace-nowrap">Doanh Thu</TableHead>
                <TableHead className="whitespace-nowrap">% CK</TableHead>
                <TableHead className="whitespace-nowrap">Thực Nhận</TableHead>
                <TableHead className="whitespace-nowrap">Quãng Đường</TableHead>
                <TableHead>Ghi Chú</TableHead>
                <TableHead className="text-right whitespace-nowrap">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">{record.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.app === 'Xanh SM' ? 'bg-blue-100 text-blue-700' :
                        record.app === 'Be' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.app}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{record.revenue.toLocaleString()} VND</TableCell>
                    <TableCell>{record.discount}%</TableCell>
                    <TableCell className="font-bold text-green-600 whitespace-nowrap">
                      {(record.actualRevenue || record.revenue * (1 - (record.discount || 0) / 100)).toLocaleString()} VND
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{record.distance} km</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
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
        </CardContent>
      </Card>
    </div>
  );
}
