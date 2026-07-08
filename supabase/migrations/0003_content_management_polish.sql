-- Phase 3 polish: richer media metadata, product image roles, and category thumbnails.

alter table categories
  add column if not exists image_url text;

alter table product_images
  add column if not exists role text not null default 'gallery';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_images_role_check'
  ) then
    alter table product_images
      add constraint product_images_role_check
      check (role in ('primary', 'gallery', 'hover'));
  end if;
end $$;

alter table media_library
  add column if not exists caption text,
  add column if not exists description text,
  add column if not exists exclude_from_sitemap boolean not null default false;
