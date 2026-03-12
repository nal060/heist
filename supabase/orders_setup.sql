-- Function to atomically decrement bag quantity
CREATE OR REPLACE FUNCTION decrement_bag_quantity(bag_id uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE surplus_bags
  SET quantity_available = GREATEST(quantity_available - amount, 0),
      updated_at = now()
  WHERE id = bag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for orders table
-- (Only run these if they don't already exist)

-- Users can read their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders"
      ON orders FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Users can create orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can create orders'
  ) THEN
    CREATE POLICY "Users can create orders"
      ON orders FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Business owners can read orders for their bags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Business owners can read bag orders'
  ) THEN
    CREATE POLICY "Business owners can read bag orders"
      ON orders FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM surplus_bags sb
          JOIN businesses b ON b.id = sb.business_id
          WHERE sb.id = surplus_bag_id
          AND b.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Business owners can update orders for their bags (collect/cancel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Business owners can update bag orders'
  ) THEN
    CREATE POLICY "Business owners can update bag orders"
      ON orders FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM surplus_bags sb
          JOIN businesses b ON b.id = sb.business_id
          WHERE sb.id = surplus_bag_id
          AND b.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS policies for payments table

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can read own payments'
  ) THEN
    CREATE POLICY "Users can read own payments"
      ON payments FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_id
          AND o.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can create payments'
  ) THEN
    CREATE POLICY "Users can create payments"
      ON payments FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = order_id
          AND o.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Make sure RLS is enabled on both tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
