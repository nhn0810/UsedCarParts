-- Re-insert default categories and brands if missing
-- Run this in Supabase SQL Editor

-- Brands
insert into brands (name) 
select 'Hyundai' where not exists (select 1 from brands where name = 'Hyundai');
insert into brands (name) 
select 'Kia' where not exists (select 1 from brands where name = 'Kia');
insert into brands (name) 
select 'BMW' where not exists (select 1 from brands where name = 'BMW');
insert into brands (name) 
select 'Mercedes-Benz' where not exists (select 1 from brands where name = 'Mercedes-Benz');
insert into brands (name) 
select 'Audi' where not exists (select 1 from brands where name = 'Audi');
insert into brands (name) 
select 'Chevrolet' where not exists (select 1 from brands where name = 'Chevrolet');

-- Categories
insert into categories (name) 
select 'Engine' where not exists (select 1 from categories where name = 'Engine');
insert into categories (name) 
select 'Transmission' where not exists (select 1 from categories where name = 'Transmission');
insert into categories (name) 
select 'Suspension' where not exists (select 1 from categories where name = 'Suspension');
insert into categories (name) 
select 'Brake' where not exists (select 1 from categories where name = 'Brake');
insert into categories (name) 
select 'Interior' where not exists (select 1 from categories where name = 'Interior');
insert into categories (name) 
select 'Exterior' where not exists (select 1 from categories where name = 'Exterior');
insert into categories (name) 
select 'Electronics' where not exists (select 1 from categories where name = 'Electronics');
insert into categories (name) 
select 'Wheels/Tires' where not exists (select 1 from categories where name = 'Wheels/Tires');
