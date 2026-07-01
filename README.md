# 🚀 U44 Technology Solutions V2 - Deployment & Setup Guide

---

## 1. 🌐 วิธีการ Deploy ระบบแบบ Full (Docker Compose)

รันทั้งระบบ (Database, Backend, Frontend และ Nginx) ในคำสั่งเดียวผ่าน Docker:

```bash
docker compose --profile full up -d --build
```

> **หมายเหตุ:**
>
> - ระบบจะโหลดตัวแปรแวดล้อม (Environment Variables) จากไฟล์ `.env` ที่ root โดยอัตโนมัติ
> - เมื่อรันเสร็จสิ้น สามารถเข้าใช้งานหน้าเว็บได้ที่: [http://localhost:3000](http://localhost:3000) หรือผ่าน Nginx ที่พอร์ต [http://localhost:8080](http://localhost:8080)

---

## 2. 👤 วิธีการสร้างผู้ใช้งาน (Create User / Admin)

คุณสามารถสร้างผู้ใช้งานใหม่ (Admin หรือ Employee) ได้ 2 วิธี:

### วิธีที่ 1: สร้างผ่าน Interactive CLI (แนะนำ)

ระบบมีเครื่องมือสำหรับสร้าง User แบบโต้ตอบ ให้กำหนดชื่อผู้ใช้งาน รหัสผ่าน และเลือกสิทธิ์ได้ทันที:

#### **กรณีระบบรันอยู่ใน Docker:**

```bash
docker exec -it u44tech-backend npm run create-user
```

#### **กรณีรันในเครื่อง Local (Manual):**

```bash
cd backend && npm run create-user
```

---
