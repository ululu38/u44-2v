# 🚀 U44 Technology Solutions V2 - Guide

โปรเจกต์เวอร์ชัน 2 พัฒนาด้วย Clean Architecture โดยใช้ Stack: **Next.js, NestJS, PostgreSQL และ Drizzle ORM**

---

## 🛠️ โหมดการรัน (Running Modes)

### 1. รันด้วย Docker Compose (แนะนำ)
รันทุกอย่าง (Database, Backend, Frontend) ในคำสั่งเดียว:
```bash
docker compose --profile full up -d --build
```

### 2. รันแยกส่วนเพื่อการพัฒนา (Manual Setup)

#### **Step 1: รันฐานข้อมูล (Database)**
รันเฉพาะ PostgreSQL และ Meilisearch:
```bash
docker compose --profile db up -d
```

#### **Step 2: ตั้งค่า Backend (NestJS)**
1. เข้าไปที่โฟลเดอร์: `cd backend`
2. ติดตั้ง Dependencies: `npm install`
3. สร้างไฟล์ `.env` และตั้งค่า (ดูตัวอย่างในหัวข้อถัดไป)
4. **เตรียมฐานข้อมูล (สำคัญ):**
   - รันตาราง: `npm run migrate`
   - สร้าง Admin คนแรก: `npm run seed`
5. เริ่มรัน: `npm run start:dev`
6. เข้าดู API Doc: [http://localhost:4000/api](http://localhost:4000/api) (Swagger)

#### **Step 3: ตั้งค่า Frontend (Next.js)**
1. เข้าไปที่โฟลเดอร์: `cd frontend`
2. ติดตั้ง Dependencies: `npm install`
3. สร้างไฟล์ `.env.local` และใส่ค่า:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
4. เริ่มรัน: `npm run dev`
5. เข้าชมเว็บไซต์: [http://localhost:3000](http://localhost:3000)

---

## 🔑 ข้อมูลสำคัญ (Important Credentials)

### **Admin Panel (ระบบหลังบ้าน)**
- **URL:** [http://localhost:3000/login](http://localhost:3000/login)
- **Username:** `admin` (ค่าเริ่มต้น)
- **Password:** `password123` (ค่าเริ่มต้น)

### **Database (PostgreSQL)**
- **Host:** `localhost:5432`
- **DB Name:** `u44tech_v2`
- **User:** `u44admin`
- **Pass:** `u44password`

---

## 🏗️ โครงสร้างสถาปัตยกรรม (Architecture)
โปรเจกต์นี้ใช้ **Clean Architecture** แบ่งเป็น 3 Layer หลักใน Backend:
1.  **Domain**: เก็บกฎทางธุรกิจและ Entities (Database Schema อยู่ที่นี่)
2.  **Infrastructure**: การเชื่อมต่อภายนอก (DB Service, Mail, Config, Auth Strategy)
3.  **Interface**: จุดรับส่งข้อมูล (Controllers, DTOs)

---

## 💡 คำแนะนำการใช้งาน
- **Swagger**: ใช้สำหรับทดสอบ API ทุกตัวในระบบหลังบ้าน
- **Drizzle Kit**: หากมีการแก้ไขไฟล์ `src/domain/entities/schema.ts` ให้รัน `npx drizzle-kit push` เพื่ออัปเดตฐานข้อมูลทันที
- **CSS Separation**: หน้าเว็บหลักใช้ `globals.css` (Dark Theme) ส่วนหน้า Admin ใช้ `admin.css` (Light Theme) แยกจากกันอย่างชัดเจน
