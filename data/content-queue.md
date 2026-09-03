# Content Queue

Tracks which products still need a blog post. Generated + merged by `npm run sync:content-queue` — do not hand-edit the `slug`/`category` columns, only `status`. Status flow: `pending` -> `drafted` -> `reviewed` -> `published`. A row auto-flips to `published` on the next sync once a `<ProductCard slug="…">` embed for it is found anywhere in `content/posts/`.

| slug | category | status |
| --- | --- | --- |
| aula-f75-mach-xuoi-hotswap | ban-phim-gaming | pending |
| dareu-ek75-pro-hotswap | ban-phim-gaming | published |
| hp-gk100f-104-phim | ban-phim-gaming | pending |
| xunfox-k82-k820-94-phim | ban-phim-gaming | pending |
| ziyou-k3-luxury-rgb | ban-phim-gaming | pending |
| logitech-g305-lightspeed-wireless | chuot-gaming | published |
| logitech-g402-oem-wired | chuot-gaming | published |
| logitech-g502-hero-rgb | chuot-gaming | pending |
| razer-deathadder-essential | chuot-gaming | published |
| razer-viper-mini | chuot-gaming | pending |
| razer-viper-v3-pro-se | chuot-gaming | published |
| clublu-e3-in-ear | tai-nghe-gaming | pending |
| edra-eh404-eh406-rgb | tai-nghe-gaming | pending |
| hyperx-cloud-earbuds-iii | tai-nghe-gaming | pending |
| razer-blackshark-v2-x | tai-nghe-gaming | pending |
