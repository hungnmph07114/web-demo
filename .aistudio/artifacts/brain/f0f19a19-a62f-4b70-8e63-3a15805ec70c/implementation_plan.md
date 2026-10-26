# Universal Multi-Category E-Commerce UI/UX Redesign & Store Customization Plan

This plan transforms the storefront and admin portal from a tech-only gadget store into a universal, multi-industry retail platform with a Clean Editorial Light/Dark adaptive design system, diverse department catalogs, and real-time store branding and category management.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design decisions were confirmed during clarification and govern this redesign:

- **Confirmed Decision 1 — Visual Identity**: **Clean Editorial Light & Dark Adaptive Theme** — Shifts away from the cyberpunk/holographic dark-only tech aesthetic to a refined editorial retail palette (warm alabaster/white canvas `#FAFAF9` / `#FFFFFF` in Light mode, deep charcoal `#0F172A` / `#18181B` in Dark mode, with a seamless theme switcher).
- **Confirmed Decision 2 — Catalog & Department Structure**: **Multi-Category Flagship Store** — Expands the catalog and starter data to showcase diverse retail verticals (Fashion & Apparel, Home & Interior Living, Beauty & Fragrance, Artisanal Coffee/F&B, and Lifestyle Audio/Tech) with flexible price filter tiers suited for everyday retail as well as high-ticket items.
- **Confirmed Decision 3 — Admin Store Customization**: **Dynamic Store Branding, Category Management & Flexible Variant Attributes** — Adds a dedicated Store Settings & Category Manager in the Admin Portal so merchants can customize the store name, tagline, hero campaign banner, unit labels (`sản phẩm` instead of `máy`), categories, and variant option types (`Kích cỡ / Màu sắc`, `Dung tích`, `Chất liệu`, `Phiên bản`).

---

## 1. Overview & Core Concept

- **What It Does**: Provides a white-label, multi-variant e-commerce storefront and merchant back-office capable of selling any physical product type—from clothing sizes and perfume volumes to furniture finishes and electronics specs—complete with automated VietQR 24/7 checkout, real-time order tracking, and self-service order cancellation.
- **Target Audience / Persona**: Retail merchants, D2C brands, and multi-department store operators who need a modern, trustworthy storefront that adapts to their brand identity without code changes.
- **Key Value**: Eliminates all hardcoded technology jargon (`máy`, `chọn cấu hình`, `chip`, `RAM`) and neon-tech styling, replacing them with an editorial retail layout and merchant-configurable branding.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Editorial Storefront Discovery**: Shoppers land on a clean, high-contrast split editorial Hero Showcase with a single campaign focal point, copyable voucher strip, and direct category navigation across diverse departments.
2. **Adaptive Filtering & Variant Selection**: Shoppers filter by department, adaptive price brackets (*Dưới 500K*, *500K – 2 Triệu*, *2 – 10 Triệu*, *Trên 10 Triệu*), stock status, and sort order. Clicking a product opens a contiguous Purchase Module displaying clean unboxed metadata, dynamic variant selectors (e.g., Size/Color, Volume, Material), stock count in `sản phẩm`, and verified customer reviews.
3. **Merchant Brand & Category Customization**: In the Admin Portal, merchants open the new **Cấu hình Cửa hàng & Danh mục** tab to live-edit the store name, hero headline, hero subtitle, hero banner image, primary accent color, and create/edit product categories or custom variant attribute labels.

### Visual Identity & Theme
- **Aesthetic Direction**: Modern Editorial Department Store (inspired by SSENSE, Kinfolk, and MUJI digital flagships) with a 60-30-10 color distribution and single-elevation surface depth.
- **Color Palette & Mood**:
  - *Light Mode (Default Editorial)*: Canvas `#FAFAF9`, Elevated Surface `#FFFFFF`, Structural Border `#E4E4E7`, Primary Text `#18181B`, Muted Text `#71717A`, Primary Accent `#18181B` (charcoal primary buttons) paired with `#2563EB` / `#0D9488` semantic accents.
  - *Dark Mode (Adaptive Studio)*: Canvas `#09090B`, Elevated Surface `#18181B`, Structural Border `#27272A`, Primary Text `#FAFAFA`, Muted Text `#A1A1AA`.
- **Typography & Hierarchy**:
  - *Display & Headlines*: `Fraunces` (editorial serif for campaign headlines and brand wordmark) paired with `Plus Jakarta Sans` (structured geometric sans for UI controls, navigation, and product titles).
  - *Numeric & Financial Data*: Strict `font-variant-numeric: tabular-nums` and monospace SKU/price alignment across all product cards, cart drawers, and admin tables.
- **Component Styling & Layout**:
  - **Zero-Pill Metadata Discipline**: Product card categories, review counts, and variant counts render as clean, unboxed editorial text separated by `·` dividers rather than cluttered floating pill badges.
  - **Lead with Imagery**: Product cards allocate 70% of their vertical height to a uniform `4:3` image container on a neutral backdrop with subtle `2px` hover lift.
  - **1440px Desktop Viewport Presence**: Spacious 1320px container with a 3-to-4 column responsive product grid (`gap-6` to `gap-8`) and clean hairline dividers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Persistent Store Settings & Dynamic Categories in Database**
  - *Chosen Approach*: Store merchant branding (Store Name, Tagline, Hero Title, Hero Subtitle, Hero Image, Theme Preset, Currency/Unit Label) in a dedicated `store_settings` table with `GET /api/store/settings` and `PUT /api/store/settings`, plus `POST /api/products/categories` and `DELETE /api/products/categories/:id`.
  - *Why*: Allows the platform to genuinely transform into any store type (Fashion boutique, Home decor studio, Cosmetics shop, or Multi-category store) directly from the Admin UI and persist across reloads.
  - *Alternatives Considered*: LocalStorage-only theme settings (rejected because changes made by the Admin wouldn't be visible to customers visiting the storefront).
- **Decision 2: Universal Terminology & Flexible Price Tiers**
  - *Chosen Approach*: Replace all tech-specific terms (`máy`, `chọn cấu hình`, `thông số kỹ thuật`) with universal retail terminology (`sản phẩm`, `tùy chọn phiên bản`, `mô tả & chất liệu`) and update price filter brackets to cover both everyday consumer goods (`< 500K`, `500K - 2M`) and premium items (`2M - 10M`, `> 10M`).
  - *Why*: Fashion, beauty, and F&B items typically range from 150,000đ to 3,000,000đ, whereas furniture and electronics exceed 10,000,000đ.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram
```
┌────────────────────────────────────────────────────────────────────────────┐
│                   CLIENT VIEWPORT (Light / Dark Adaptive)                  │
├──────────────────────────────────────┬─────────────────────────────────────┤
│        STOREFRONT EXPERIENCE         │            ADMIN PORTAL             │
│  ┌────────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │ Editorial Header & Theme Toggle│  │  │ KPI & Visual Analytics Grid   │  │
│  ├────────────────────────────────┤  │  ├───────────────────────────────┤  │
│  │ Dynamic Split Hero Campaign    │  │  │ Order & VietQR Manager        │  │
│  ├────────────────────────────────┤  │  ├───────────────────────────────┤  │
│  │ Department Tabs & Retail Filter│  │  │ Multi-Variant Catalog & SKUs  │  │
│  ├────────────────────────────────┤  │  ├───────────────────────────────┤  │
│  │ Editorial Product Grid (4:3)   │  │  │ Store Branding & Category CMS │  │
│  └────────────────────────────────┘  │  └───────────────────────────────┘  │
└──────────────────┬───────────────────┴──────────────────┬──────────────────┘
                   │ REST API (/api/*)                    │
┌──────────────────▼──────────────────────────────────────▼──────────────────┐
│                 EXPRESS MODULAR BACKEND & PGLITE / POSTGRES                │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ Store Settings API │  │ Category & Variant  │  │ Order, VietQR &     │  │
│  │ (Branding, Presets)│  │ Flexible Attributes │  │ Inventory Engine    │  │
│  └────────────────────┘  ┌─────────────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **`store_settings` Table**: Stores `store_name`, `store_tagline`, `hero_badge`, `hero_title`, `hero_highlight`, `hero_subtitle`, `hero_image`, `default_theme` (`light` | `dark`), and `unit_label` (default `sản phẩm`), plus quick industry presets (Multi-Department Flagship, Fashion Studio, Home & Living, Beauty & Skincare, Tech Flagship) that Admin can apply with one click or customize freely.
- **Multi-Department Seed Catalog**: Seeds 5 distinct retail departments (*Thời trang & Phụ kiện*, *Nội thất & Đời sống*, *Mỹ phẩm & Hương thơm*, *Ẩm thực & Cà phê*, *Thiết bị Công nghệ*) with high-fidelity generated product imagery and realistic multi-attribute variants (e.g., Size S/M/L, Volume 50ml/100ml, Wood Finish Oak/Walnut, Roast Level).

### Interactive Component & State Mapping
- **Theme Toggle & Branding Sync**: `App.jsx` fetches `/api/store/settings` on load, applies `data-theme="light|dark"` to the document root, and passes `storeSettings` down to `Navbar`, `HeroBanner`, `ProductCard`, `ProductModal`, and `AdminPortal`.
- **Category & Variant Management**: Admin can create new categories (with custom name, slug, and icon), switch or customize store branding presets in real time, and define custom variant attribute names (e.g., `Kích cỡ & Màu sắc`, `Dung tích`, `Chất liệu`) inside `AdminCreateProductModal`.
