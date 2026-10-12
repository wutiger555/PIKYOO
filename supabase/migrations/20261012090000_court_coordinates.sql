-- Coordinates for the six seeded courts, so 找教練 can pin coaches on a map (geocoded from OpenStreetMap, 2026-10-12).
-- Data only: the lat / lng columns exist since init. Courts added later get theirs when they are created.
update public.courts set lat = 25.02073, lng = 121.54601 where slug = 'daan' and lat is null;
update public.courts set lat = 25.03170, lng = 121.56677 where slug = 'xinyi' and lat is null;
update public.courts set lat = 25.07473, lng = 121.53900 where slug = 'dajia' and lat is null;
update public.courts set lat = 25.05486, lng = 121.52139 where slug = 'zhongshan' and lat is null;
update public.courts set lat = 25.07723, lng = 121.57536 where slug = 'neihu' and lat is null;
update public.courts set lat = 25.01017, lng = 121.46838 where slug = 'banqiao' and lat is null;
