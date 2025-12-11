-- Enable realtime for businesses table
ALTER TABLE public.businesses REPLICA IDENTITY FULL;

-- Enable realtime for merchants table (for kyb_status)
ALTER TABLE public.merchants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.merchants;