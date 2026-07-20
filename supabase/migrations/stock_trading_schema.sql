-- Portfolios: Operational balance sheets for paper trading nodes
CREATE TABLE IF NOT EXISTS portfolios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    cash_balance numeric(20, 4) NOT NULL DEFAULT 100000.0000,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    CONSTRAINT positive_cash_balance CHECK (cash_balance >= 0)
);

CREATE TABLE IF NOT EXISTS trades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol text NOT NULL,
    name text NOT NULL,
    quantity numeric(12, 4) NOT NULL,
    price numeric(12, 4) NOT NULL,
    side text NOT NULL,
    total numeric(20, 4) NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_trade_side CHECK (side IN ('BUY', 'SELL')),
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_price CHECK (price > 0),
    CONSTRAINT math_total_validation CHECK (total = (quantity * price))
);

-- Holdings: Current aggregated asset inventory positions per stock per user
CREATE TABLE IF NOT EXISTS holdings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol text NOT NULL,
    name text NOT NULL,
    quantity numeric(12, 4) NOT NULL DEFAULT 0.0000,
    avg_price numeric(12, 4) NOT NULL DEFAULT 0.0000,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, symbol),
    CONSTRAINT non_negative_holdings CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS watchlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_lookup ON portfolios(user_id);

CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON trades(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_holdings_user_inventory ON holdings(user_id) INCLUDE (symbol, quantity, avg_price);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_lookup ON watchlist(user_id);

CREATE OR REPLACE FUNCTION update_modified_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_changetimestamp
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp_column();

CREATE TRIGGER update_holdings_changetimestamp
    BEFORE UPDATE ON holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp_column();

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_isolation_select" ON portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "portfolio_isolation_insert" ON portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_isolation_update" ON portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolio_isolation_delete" ON portfolios FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "trade_isolation_select" ON trades FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "trade_isolation_insert" ON trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "holdings_isolation_select" ON holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "holdings_isolation_insert" ON holdings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings_isolation_update" ON holdings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "holdings_isolation_delete" ON holdings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "watchlist_isolation_select" ON watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "watchlist_isolation_insert" ON watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_isolation_delete" ON watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);