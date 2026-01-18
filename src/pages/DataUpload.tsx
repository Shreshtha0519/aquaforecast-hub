import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, Check, AlertCircle, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FileData {
  name: string;
  size: number;
  rows: number;
  columns: string[];
  preview: Record<string, string>[];
  validated: boolean;
}

const DataUpload: React.FC = () => {
  const { hasPermission } = useAuth();
  const [file, setFile] = useState<FileData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const canUpload = hasPermission(['admin', 'analyst']);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const mockData: FileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      rows: 156,
      columns: ['Date', 'Region', 'Demand_MLD', 'Supply_MLD', 'Rainfall_mm'],
      preview: [
        { Date: '2024-01-01', Region: 'Haveli', Demand_MLD: '850', Supply_MLD: '820', Rainfall_mm: '12' },
        { Date: '2024-01-02', Region: 'Haveli', Demand_MLD: '862', Supply_MLD: '825', Rainfall_mm: '0' },
        { Date: '2024-01-03', Region: 'Haveli', Demand_MLD: '875', Supply_MLD: '830', Rainfall_mm: '5' },
        { Date: '2024-01-04', Region: 'Haveli', Demand_MLD: '890', Supply_MLD: '835', Rainfall_mm: '18' },
        { Date: '2024-01-05', Region: 'Haveli', Demand_MLD: '845', Supply_MLD: '840', Rainfall_mm: '25' },
      ],
      validated: false,
    };
    setFile(mockData);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleValidate = () => {
    if (file) {
      setFile({ ...file, validated: true });
    }
  };

  if (!canUpload) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="glass-card border-warning/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Access Restricted</h3>
            <p className="text-muted-foreground mt-2">
              You need Analyst or Admin role to upload data files.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Upload className="w-7 h-7 text-primary" />
          Data Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload CSV or Excel files containing water demand data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Upload File</CardTitle>
            <CardDescription>Drag and drop or click to select</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                ${dragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
              `}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <FileSpreadsheet className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-foreground font-medium">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports CSV and Excel (.xlsx) formats
              </p>
              <Input
                id="file-input"
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>
          </CardContent>
        </Card>

        {file && (
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">File Info</CardTitle>
                {file.validated ? (
                  <Badge className="bg-success/20 text-success border-success/30">
                    <Check className="w-3 h-3 mr-1" /> Validated
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-warning/30 text-warning">
                    Pending Validation
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">File Name</Label>
                  <p className="font-medium text-foreground">{file.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Size</Label>
                  <p className="font-medium text-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Rows</Label>
                  <p className="font-medium text-foreground">{file.rows}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Columns</Label>
                  <p className="font-medium text-foreground">{file.columns.length}</p>
                </div>
              </div>
              
              {!file.validated && (
                <Button onClick={handleValidate} className="w-full bg-primary text-primary-foreground">
                  <Check className="w-4 h-4 mr-2" />
                  Validate Data
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {file && (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Data Preview
            </CardTitle>
            <CardDescription>First 5 rows of uploaded data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    {file.columns.map((col) => (
                      <TableHead key={col} className="text-foreground font-semibold">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.preview.map((row, i) => (
                    <TableRow key={i} className="border-border">
                      {file.columns.map((col) => (
                        <TableCell key={col} className="text-foreground">
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataUpload;
