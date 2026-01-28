-- 1. profiles 테이블에 관리자 여부 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. 관리자 권한 획득 함수 (비밀번호: onion1234)
CREATE OR REPLACE FUNCTION claim_admin(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- 함수 생성자의 권한으로 실행 (즉, 모든 권한을 가진 채로 실행됨)
AS $$
DECLARE
  is_verified BOOLEAN;
BEGIN
  -- 비밀번호 확인 (하드코딩)
  IF password = 'onion1234' THEN
    UPDATE profiles
    SET is_admin = true
    WHERE id = auth.uid();
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;
