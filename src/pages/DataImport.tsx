import React, { useState, useCallback } from 'react';
import { apiUpload } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Download,
  Loader2,
  Eye,
} from 'lucide-react';
import { downloadTemplate } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  size: number;
  type: 'products' | 'sales' | 'categories';
  status: 'pending' | 'validated' | 'error';
  file: File;
  rows?: number;
  errors?: string[];
  data?: Record<string, any>[];
}

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

const sampleFiles = [
  { name: 'products_template.csv', type: 'products' as const, description: 'Product inventory with SKU, name, category, price' },
  { name: 'sales_template.csv', type: 'sales' as const, description: 'Sales transactions by date and product' },
  { name: 'categories_template.csv', type: 'categories' as const, description: 'Category definitions and space allocation' },
];

const targetColumns = {
  products: ['SKU', 'Product Name', 'Category', 'Price', 'Shelf Space', 'Sales Percentage'],
  sales: ['Date', 'SKU', 'Quantity', 'Total Amount', 'Store ID'],
  categories: ['Category ID', 'Category Name', 'Current Space', 'Target Space'],
};

export default function DataImport() {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File): Promise<UploadedFile> => {
    return Promise.resolve({
      name: file.name,
      size: file.size,
      type: 'products',
      status: 'validated',
      file,
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFiles = droppedFiles.filter(f => f.name.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      toast.error('Invalid file type', {
        description: 'Please upload CSV files only',
      });
      return;
    }
    
    // Add pending files
    const pendingFiles: UploadedFile[] = csvFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: 'products' as const,
      status: 'pending' as const,
      file: f,
    }));
    
    setFiles(prev => [...prev, ...pendingFiles]);
    
    // Process files
    for (const file of csvFiles) {
      const processed = await processFile(file);
      setFiles(prev => prev.map(f => f.name === file.name ? processed : f));
    }
    
    toast.success('Files uploaded', {
      description: `${csvFiles.length} file(s) processed`,
    });
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const csvFiles = selectedFiles.filter(f => f.name.endsWith('.csv'));
      
      if (csvFiles.length === 0) {
        toast.error('Invalid file type', {
          description: 'Please upload CSV files only',
        });
        return;
      }
      
      // Add pending files
      const pendingFiles: UploadedFile[] = csvFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: 'products' as const,
        status: 'pending' as const,
        file: f,
      }));
      
      setFiles(prev => [...prev, ...pendingFiles]);
      
      // Process files
      for (const file of csvFiles) {
        const processed = await processFile(file);
        setFiles(prev => prev.map(f => f.name === file.name ? processed : f));
      }
      
      toast.success('Files uploaded', {
        description: `${csvFiles.length} file(s) processed`,
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    toast.info('File removed');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleContinueToMapping = () => {
    const validFiles = files.filter(f => f.status === 'validated');
    if (validFiles.length === 0) {
      toast.error('No valid files', {
        description: 'Please upload valid CSV files first',
      });
      return;
    }
    
    setSelectedFile(validFiles[0]);
    
    // Initialize column mappings
    const sourceColumns = ['Column A', 'Column B', 'Column C', 'Column D', 'Column E', 'Column F'];
    const targets = targetColumns[validFiles[0].type];
    setColumnMappings(
      targets.map((target, i) => ({
        sourceColumn: sourceColumns[i] || '',
        targetColumn: target,
      }))
    );
    
    setStep('mapping');
  };

  const handleContinueToPreview = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setPreviewData([]);
    
    setIsProcessing(false);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsProcessing(true);
    if (!selectedFile || !user) {
      toast.error('Missing data', { description: 'Please select a file and log in.' });
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('import_type', selectedFile.type);
      formData.append('user_id', String(user.id));

      const job = await apiUpload<{ id: number }>('/imports', formData);
      toast.success('Import queued', {
        description: `Import job #${job.id} created. Check status in a moment.`,
      });
    } catch (error) {
      toast.error('Import failed', {
        description: 'Please verify the file and try again.',
      });
    }
    
    // Reset state
    setFiles([]);
    setSelectedFile(null);
    setColumnMappings([]);
    setPreviewData([]);
    setStep('upload');
    setIsProcessing(false);
  };

  const handleDownloadTemplate = (type: 'products' | 'sales' | 'categories') => {
    downloadTemplate(type);
    toast.success('Template downloaded', {
      description: `${type}_template.csv has been downloaded`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Data Import</h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage your product, sales, and category data
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4">
        {['Upload', 'Map Columns', 'Preview & Import'].map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  i === 0 && step === 'upload' && 'bg-primary text-primary-foreground',
                  i === 1 && step === 'mapping' && 'bg-primary text-primary-foreground',
                  i === 2 && step === 'preview' && 'bg-primary text-primary-foreground',
                  ((i === 0 && step !== 'upload') || (i === 1 && step === 'preview')) &&
                    'bg-success text-white',
                  ((i === 1 && step === 'upload') || (i === 2 && step !== 'preview')) &&
                    'bg-muted text-muted-foreground'
                )}
              >
                {((i === 0 && step !== 'upload') || (i === 1 && step === 'preview')) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  ((i === 0 && step === 'upload') ||
                    (i === 1 && step === 'mapping') ||
                    (i === 2 && step === 'preview'))
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className="w-12 h-0.5 bg-border" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <>
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            <Input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Drop your CSV files here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Products, Sales, Categories CSV files
              </p>
            </div>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="card-elevated">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Uploaded Files</h3>
              </div>
              <div className="divide-y divide-border">
                {files.map((file) => (
                  <div key={file.name} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                        {file.rows && ` • ${file.rows} rows`}
                      </p>
                      {file.errors && (
                        <p className="text-xs text-destructive mt-1">
                          {file.errors.length} validation error(s)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {file.status === 'pending' && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {file.status === 'validated' && (
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">Valid</span>
                        </div>
                      )}
                      {file.status === 'error' && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Errors</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {files.some(f => f.status === 'validated') && (
                <div className="p-4 border-t border-border flex justify-end">
                  <Button onClick={handleContinueToMapping}>
                    Continue to Mapping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Sample Templates */}
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Sample Templates</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download these templates to format your data correctly
              </p>
            </div>
            <div className="divide-y divide-border">
              {sampleFiles.map((file) => (
                <div key={file.name} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadTemplate(file.type)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 'mapping' && selectedFile && (
        <div className="space-y-6">
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Column Mapping</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Map your CSV columns to the expected data fields
              </p>
            </div>
            <div className="p-6 space-y-4">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">Source Column</label>
                    <Select
                      value={mapping.sourceColumn}
                      onValueChange={(value) => {
                        setColumnMappings(prev => prev.map((m, i) => 
                          i === index ? { ...m, sourceColumn: value } : m
                        ));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Column A', 'Column B', 'Column C', 'Column D', 'Column E', 'Column F'].map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-6" />
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">Target Field</label>
                    <Input value={mapping.targetColumn} disabled />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinueToPreview} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Preview Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Data Preview</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Showing first 10 rows of {selectedFile?.rows || 0} total records
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Shelf Space</th>
                    <th>Sales %</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{row.sku}</td>
                      <td>{row.name}</td>
                      <td>{row.category}</td>
                      <td>${row.price}</td>
                      <td>{row.shelfSpace}m</td>
                      <td>{row.salesPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Import {selectedFile?.rows || 0} Records
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* What will be updated */}
          <div className="card-elevated p-5 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-foreground mb-3">What happens after import?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Tail Analysis will include new products with calculated scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Space Elasticity will recalculate category recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Dashboard metrics will update to reflect new data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Heatmap will incorporate new product performance data</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Info Box (only on upload step) */}
      {step === 'upload' && (
        <div className="card-elevated p-5 bg-primary/5 border-primary/20">
          <h4 className="font-semibold text-foreground mb-2">Import Guidelines</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>CSV files must have headers in the first row</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>SKU codes must be unique across all products</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Date formats should be YYYY-MM-DD</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Maximum file size: 10MB per file</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
