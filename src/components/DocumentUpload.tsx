import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  businessId: string;
  docType: string;
  label: string;
  description: string;
  onUploadComplete?: (url: string, filename: string) => void;
  existingFile?: { name: string; url: string } | null;
  accept?: string;
  maxSizeMB?: number;
}

export function DocumentUpload({
  businessId,
  docType,
  label,
  description,
  onUploadComplete,
  existingFile,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSizeMB = 10,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(existingFile || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPG, PNG, and WebP files are allowed';
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    try {
      // Create a unique file path: {businessId}/{docType}/{timestamp}_{filename}
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${businessId}/${docType}/${timestamp}_${sanitizedFilename}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('business-documents')
        .getPublicUrl(data.path);

      const fileInfo = { name: file.name, url: urlData.publicUrl };
      setUploadedFile(fileInfo);
      onUploadComplete?.(urlData.publicUrl, file.name);
      toast.success(`${label} uploaded successfully`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document');
      toast.error('Upload failed', { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [businessId, docType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleRemove = async () => {
    setUploadedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!uploadedFile) return <FileText className="h-8 w-8 text-muted-foreground" />;
    if (uploadedFile.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return <ImageIcon className="h-8 w-8 text-primary" />;
    }
    return <FileText className="h-8 w-8 text-primary" />;
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-all",
        isDragging && "border-primary bg-primary/5",
        uploadedFile && !isDragging && "border-success bg-success/5",
        error && "border-destructive bg-destructive/5",
        !uploadedFile && !isDragging && !error && "border-border hover:border-muted-foreground/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-${docType}`}
      />
      
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center shrink-0",
          uploadedFile ? "bg-success/10" : "bg-muted"
        )}>
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : uploadedFile ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : (
            getFileIcon()
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            
            {uploadedFile && !isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {uploadedFile ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {uploadedFile.name}
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                Replace
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                or drag and drop here • PDF, JPG, PNG up to {maxSizeMB}MB
              </p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-1.5 mt-2 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 rounded-lg bg-primary/10 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="font-medium text-primary">Drop file here</p>
          </div>
        </div>
      )}
    </div>
  );
}
