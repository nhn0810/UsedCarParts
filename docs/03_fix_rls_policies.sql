-- RLS Policy 재설정 (Brands, Categories)
-- 기존 정책이 있다면 충돌 무시하고 재작성하거나, 기존 것을 drop 후 create 함.

-- Brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public brands are viewable by everyone" ON brands;
CREATE POLICY "Public brands are viewable by everyone" ON brands FOR SELECT USING (true);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);


-- 혹시 모를 프로필 RLS도 확인
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
