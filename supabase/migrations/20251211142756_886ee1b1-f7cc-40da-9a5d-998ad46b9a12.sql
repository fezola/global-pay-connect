-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents',
  'business-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- Policy: Users can upload documents for their own businesses
CREATE POLICY "Users can upload business documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'business-documents'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
    AND public.has_merchant_access(auth.uid(), b.merchant_id)
  )
);

-- Policy: Users can view documents for their own businesses
CREATE POLICY "Users can view business documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'business-documents'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
    AND public.has_merchant_access(auth.uid(), b.merchant_id)
  )
);

-- Policy: Users can update documents for their own businesses
CREATE POLICY "Users can update business documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'business-documents'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
    AND public.has_merchant_access(auth.uid(), b.merchant_id)
  )
);

-- Policy: Users can delete documents for their own businesses
CREATE POLICY "Users can delete business documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'business-documents'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
    AND public.has_merchant_access(auth.uid(), b.merchant_id)
  )
);