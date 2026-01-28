-- 인증된 사용자(관리자 등)가 카테고리와 브랜드를 직접 추가할 수 있도록 INSERT 권한 부여

-- Categories
CREATE POLICY "Authenticated users can insert categories"
ON categories FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Brands
CREATE POLICY "Authenticated users can insert brands"
ON brands FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
