# U44Tech Backend API Documentation

เอกสารแนะนำการใช้งาน Backend API ของระบบ U44Tech (NestJS + Drizzle ORM + PostgreSQL)
เบส URL ของ API ในเครื่องโลคอลคือ: `http://localhost:4000`
และ Swagger UI สามารถเข้าถึงได้ที่: `http://localhost:4000/api`

---

## สารบัญ

0. [คู่มือการใช้ Swagger UI (Swagger Documentation)](#0-คู่มือการใช้-swagger-ui-swagger-documentation)
1. [การพิสูจน์ตัวตน (Authentication)](#1-การพิสูจน์ตัวตน-authentication)
2. [การจัดการผู้ใช้ (User Management)](#2-การจัดการผู้ใช้-user-management)
3. [บทความและโพสต์ (Posts)](#3-บทความและโพสต์-posts)
4. [ไคลเอนต์และกลุ่มไคลเอนต์ (Clients & Client Groups)](#4-ไคลเอนต์และกลุ่มไคลเอนต์-clients--client-groups)
5. [การจัดการสื่อและคลังรูปภาพ (Media & Gallery)](#5-การจัดการสื่อและคลังรูปภาพ-media--gallery)
6. [พาร์ทเนอร์ (Partners)](#6-พาร์ทเนอร์-partners)
7. [การจัดการตั๋วบริการ/ติดต่อสอบถาม (Tickets & Public Tickets)](#7-การจัดการตั๋วบริการติดต่อสอบถาม-tickets--public-tickets)
8. [แฮชแท็ก (Hashtags)](#8-แฮชแท็ก-hashtags)
9. [การค้นหาบทความ (Search)](#9-การค้นหาบทความ-search)

---

## 0. คู่มือการใช้ Swagger UI (Swagger Documentation)

ระบบ U44Tech Backend มีการติดตั้ง Swagger ไว้อำนวยความสะดวกในการทดสอบเรียกใช้ API โดยไม่ต้องพึ่งพา Postman

### 0.1 วิธีการเข้าถึง

- **URL:** `http://localhost:4000/api`
- คุณสามารถตรวจสอบโครงสร้าง Request DTO, Response Scheme และทดสอบกดเรียก API (Try it out) จากหน้า UI นี้ได้ทันที

### 0.2 ระบบยืนยันตัวตนบน Swagger (Authorize)

เนื่องจาก API ส่วนที่จำเป็นต้องผ่านสิทธิ์ผู้ดูแลระบบใช้ระบบตรวจสอบผ่าน Cookie `access_token` เป็นหลัก:

1. ให้คุณใช้หน้าต่าง Swagger ไปที่ส่วน **`auth`** -> กดเรียก `POST /auth/login`
2. ใส่ข้อมูล `username` และ `password` ของคุณ แล้วกด **Execute**
3. เบราว์เซอร์จะเก็บ HttpOnly Cookie `access_token` ให้โดยอัตโนมัติ
4. หลังจากนั้นคุณจะสามารถกดเรียกใช้ API เส้นอื่นๆ ที่ต้องการตรวจสอบสิทธิ์ เช่น `/users`, `/posts` (ส่วนของสร้าง/อัปเดต) ได้จากเบราว์เซอร์เดิมทันที
5. สำหรับเส้นทางเฉพาะบางตัวที่ระบุว่าต้องการ Cookie หรือ Bearer Auth สามารถกดปุ่ม **Authorize** ด้านขวาบนและป้อนค่า JWT Token เพื่อทำการส่ง Request ได้เช่นกัน

## 1. การพิสูจน์ตัวตน (Authentication)

จัดการระบบล็อกอิน/ล็อกเอาต์ โดยใช้ JWT ในรูปแบบ HttpOnly Cookie ชื่อ `access_token`

### 1.1 Login เข้าสู่ระบบ

- **Endpoint:** `POST /auth/login`
- **สิทธิ์การเข้าถึง:** Public
- **Request Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "yourpassword"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  }
  ```
  _(ระแบบจะบันทึก `access_token` ลงใน HttpOnly Cookie โดยอัตโนมัติ)_

### 1.2 Logout ออกจากระบบ

- **Endpoint:** `POST /auth/logout`
- **สิทธิ์การเข้าถึง:** Public
- **Response (200 OK):**
  ```json
  {
    "message": "Logged out"
  }
  ```
  _(ระบบจะล้าง Cookie `access_token` ออก)_

### 1.3 ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน

- **Endpoint:** `GET /auth/profile`
- **สิทธิ์การเข้าถึง:** ต้องล็อกอิน (มี `access_token` Cookie)
- **Response (200 OK):** ข้อมูล Payload ใน Token ของผู้ใช้ปัจจุบัน
  ```json
  {
    "username": "admin",
    "sub": 1,
    "role": "admin"
  }
  ```

---

## 2. การจัดการผู้ใช้ (User Management)

เส้นทาง: `/users` (ต้องล็อกอินและผ่านการยืนยันสิทธิ์)

### 2.1 ดึงข้อมูลผู้ใช้ทั้งหมด

- **Endpoint:** `GET /users`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น
- **Response (200 OK):** รายการผู้ใช้ทั้งหมดในระบบ

### 2.2 สร้างผู้ใช้ใหม่

- **Endpoint:** `POST /users`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น
- **Request Body (JSON):** ข้อมูลของ User ใหม่ เช่น username, password, email, role (`admin` / `employee`)
- **Response (201 Created):** ข้อมูลผู้ใช้ที่สร้างใหม่

### 2.3 อัปเดตบัญชีของตัวเอง

- **Endpoint:** `PUT /users/my-account`
- **สิทธิ์การเข้าถึง:** ผู้ใช้งานที่ล็อกอินทุกคน (ทุกสิทธิ์)
- **Request Body (JSON):**
  ```json
  {
    "email": "my-email@example.com",
    "isEmailActive": true
  }
  ```
- **Response (200 OK):** ข้อมูลผู้ใช้หลังการแก้ไข

### 2.4 อัปเดตข้อมูลผู้ใช้อื่นๆ (รวมถึงเปลี่ยนรหัสผ่าน)

- **Endpoint:** `PUT /users/:id`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น
- **Request Body (JSON):** ข้อมูลที่ต้องการแก้ไข (หากส่ง `password` มาจะถูกแฮชก่อนบันทึกใหม่)

### 2.5 ลบผู้ใช้

- **Endpoint:** `DELETE /users/:id`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น

---

## 3. บทความและโพสต์ (Posts)

เส้นทาง: `/posts`

### 3.1 ดึงรายการโพสต์ทั้งหมด

- **Endpoint:** `GET /posts`
- **สิทธิ์การเข้าถึง:** Public (หากไม่ได้ล็อกอินจะดึงได้เฉพาะโพสต์ที่มี `status = 1` หรือสถานะเผยแพร่เท่านั้น)
- **Query Parameters:**
  - `page` (default: `1`): ลำดับหน้า
  - `limit` (default: `10`): จำนวนโพสต์ต่อหน้า
  - `q`: ค้นหาคำค้นจากชื่อเรื่อง, เนื้อหา, ชื่อไคลเอนต์ หรือกลุ่มไคลเอนต์
  - `tag`: กรองโพสต์ด้วยแฮชแท็ก
  - `clientId`: กรองโพสต์เฉพาะของไคลเอนต์นี้ (ส่งเป็นตัวเลข ID หรือ `all`)
  - `status`: สถานะโพสต์ (`all` หรือตัวเลขสถานะ เช่น `1` สำหรับ Publish)
  - `fields`: ฟิลด์ที่ต้องการส่งกลับมา เช่น `title,tags,thumbnail` เพื่อลดปริมาณข้อมูลเนื้อหาเต็ม (`contentHtml` จะไม่ส่งมาถ้าไม่ได้ระบุใน fields เพื่อความรวดเร็วในการโหลดหน้าเว็บ)
  - `thumbSize` (`full` | `thumb` | `mini` - default: `thumb`): เลือกขนาดรูป Thumbnail ของโพสต์
- **Response (200 OK):**
  ```json
  {
    "data": [ ... ],
    "meta": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
  ```

### 3.2 ดึงข้อมูลโพสต์อย่างละเอียดตาม ID

- **Endpoint:** `GET /posts/:id`
- **สิทธิ์การเข้าถึง:** Public (หากโพสต์ไม่ได้เผยแพร่ `status !== 1` บุคคลภายนอกจะเข้าไม่ถึง ยกเว้นกรณีล็อกอิน)
- **Response (200 OK):** ข้อมูลโพสต์แบบละเอียด รวมถึงข้อมูลรูปภาพสไลด์ (`sliderImages`) และรายละเอียดไคลเอนต์ที่เกี่ยวข้อง (`clients`)

### 3.3 สร้างโพสต์ใหม่

- **Endpoint:** `POST /posts`
- **สิทธิ์การเข้าถึง:** `admin` หรือ `employee`
- **Request Body (JSON):**
  ```json
  {
    "title": "ชื่อบทความ",
    "thumbnailMediaId": 12,
    "sliderImageIds": [13, 14, 15],
    "clientIds": [1, 2],
    "tags": ["Tech", "Design"],
    "contentHtml": "<p>เนื้อหา HTML</p>",
    "status": 1
  }
  ```
- **Response (201 Created):** ข้อมูลโพสต์พร้อม Slug ที่ถูกเจเนอเรตขึ้นโดยอัตโนมัติ

### 3.4 อัปเดตข้อมูลโพสต์

- **Endpoint:** `PATCH /posts/:id`
- **สิทธิ์การเข้าถึง:** `admin` หรือ `employee`
- **Request Body (JSON):** ข้อมูลโพสต์และชุดภาพสไลด์/แท็ก/ไคลเอนต์ที่ต้องการแก้ไข

### 3.5 ลบโพสต์

- **Endpoint:** `DELETE /posts/:id`
- **สิทธิ์การเข้าถึง:** `admin` หรือ `employee`

### 3.6 เพิ่มจำนวนการเข้าชมโพสต์

- **Endpoint:** `POST /posts/:id/view`
- **สิทธิ์การเข้าถึง:** Public (ใช้สำหรับเพิ่มจำนวน `views` ของโพสต์ทีละ +1 เมื่อมีผู้กดอ่าน)

---

## 4. ไคลเอนต์และกลุ่มไคลเอนต์ (Clients & Client Groups)

### 4.1 กลุ่มไคลเอนต์ (Client Groups)

เส้นทาง: `/client-groups`

- **GET /client-groups**: ดึงกลุ่มไคลเอนต์ทั้งหมด (Public, มี Pagination: `page`, `limit`)
- **POST /client-groups**: สร้างกลุ่มใหม่ (ต้องมีสิทธิ์ `admin` หรือ `employee`)
- **PATCH /client-groups/:id**: แก้ไขกลุ่ม (ต้องมีสิทธิ์ `admin` หรือ `employee`)
- **DELETE /client-groups/:id**: ลบกลุ่ม (ต้องมีสิทธิ์ `admin` หรือ `employee`)

### 4.2 ไคลเอนต์ (Clients)

เส้นทาง: `/clients`

- **GET /clients**: ดึงข้อมูลไคลเอนต์ทั้งหมด (Public)
  - **Query Parameters:** `page`, `limit`, `groupId` (ใช้กรองตามกลุ่มไคลเอนต์ โดยคั่นด้วยเครื่องหมายจุลภาค เช่น `groupId=1,2`)
- **POST /clients**: สร้างไคลเอนต์ใหม่และระบุความสัมพันธ์กลุ่ม (ต้องมีสิทธิ์ `admin` หรือ `employee`)
  - **Request Body Example:** `{ "name": "Client Name", "logoMediaId": 5, "displayOrder": 1, "groupIds": [1, 2] }`
- **PATCH /clients/:id**: แก้ไขไคลเอนต์ (ต้องมีสิทธิ์ `admin` หรือ `employee`)
- **DELETE /clients/:id**: ลบไคลเอนต์ (ต้องมีสิทธิ์ `admin` หรือ `employee`)

---

## 5. การจัดการสื่อและคลังรูปภาพ (Media & Gallery)

เส้นทาง: `/media`
ใช้สำหรับอัปโหลด จัดการ และแสดงรูปภาพในแกลเลอรี พร้อมการย่อและปรับแต่งขนาดอัตโนมัติ

### 5.1 อัปโหลดไฟล์ภาพ

- **Endpoint:** `POST /media/upload`
- **สิทธิ์การเข้าถึง:** ต้องล็อกอิน
- **Request Type:** `multipart/form-data`
- **Body:** ฟอร์มข้อมูล คีย์ `file` (ระบุไฟล์รูปภาพ)
- **Response (201 Created):** ข้อมูลการอัปโหลด ประกอบด้วยลิงก์รูปภาพในขนาด Full, Thumb และ Mini พร้อมค่า BlurHash

### 5.2 แสดงรายการไฟล์สื่อทั้งหมด (แกลเลอรี)

- **Endpoint:** `GET /media`
- **สิทธิ์การเข้าถึง:** Public
- **Query Parameters:** `page` (default `1`), `limit` (default `20`)

### 5.3 ดึงข้อมูลไฟล์สื่อเดี่ยวตาม ID

- **Endpoint:** `GET /media/:id`
- **สิทธิ์การเข้าถึง:** Public

### 5.4 ลบไฟล์สื่อ

- **Endpoint:** `DELETE /media/:id`
- **สิทธิ์การเข้าถึง:** ต้องล็อกอิน

---

## 6. พาร์ทเนอร์ (Partners)

เส้นทาง: `/partners` และ `/management`

### 6.1 จัดการ Partners ผ่าน /partners (แนะนำ)

- **GET /partners**: ดึงรายชื่อพาร์ทเนอร์พร้อมโลโก้ทั้งหมด (Public, มีหน้าเพจ)
- **POST /partners**: สร้างพาร์ทเนอร์ใหม่ (ต้องการสิทธิ์ `admin` หรือ `employee`)
- **PATCH /partners/:id**: อัปเดตข้อมูลพาร์ทเนอร์ (ต้องการสิทธิ์ `admin` หรือ `employee`)
- **DELETE /partners/:id**: ลบพาร์ทเนอร์ออกจากระบบ (ต้องการสิทธิ์ `admin` หรือ `employee`)

### 6.2 การจัดการเพิ่มเติมผ่าน /management (Legacy / Utility)

- **POST /management/partners**: สร้างพาร์ทเนอร์ (ต้องการผู้ใช้งานล็อกอินทั่วไป)
- **PUT /management/partners/:id**: อัปเดตข้อมูลพาร์ทเนอร์ (ต้องการผู้ใช้งานล็อกอินทั่วไป)
- **POST /management/partner-groups**: สร้างกลุ่มพาร์ทเนอร์ (ต้องการผู้ใช้งานล็อกอินทั่วไป)

---

## 7. การจัดการตั๋วบริการ/ติดต่อสอบถาม (Tickets & Public Tickets)

### 7.1 ส่งฟอร์มติดต่อสอบถามเข้ามาใหม่ (Public Ticket)

- **Endpoint:** `POST /public/tickets`
- **สิทธิ์การเข้าถึง:** Public
- **Request Body (JSON):**
  ```json
  {
    "firstname": "ชื่อ",
    "lastname": "นามสกุล",
    "email": "customer@example.com",
    "phone": "0812345678",
    "jobTitle": "โปรแกรมเมอร์",
    "message": "สนใจสมัครงานหรือติดต่อสอบถาม..."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Ticket received",
    "id": 99,
    "notification": "Sent"
  }
  ```
  _(ระบบจะทำการบันทึกข้อมูลและส่งอีเมลแจ้งเตือนไปยังแอดมินที่มีสถานะ `isEmailActive = true` ทันที)_

### 7.2 ดูตั๋วติดต่อสอบถามทั้งหมด

- **Endpoint:** `GET /tickets`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น
- **Response (200 OK):** รายการตั๋วติดต่อสอบถามทั้งหมดเรียงจากใหม่สุดไปเก่าสุด

### 7.3 แก้ไขสถานะของตั๋ว

- **Endpoint:** `PUT /tickets/:id/status`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น
- **Request Body (JSON):**
  ```json
  {
    "status": "in_progress"
  }
  ```

### 7.4 ลบตั๋วออก

- **Endpoint:** `DELETE /tickets/:id`
- **สิทธิ์การเข้าถึง:** `admin` เท่านั้น

---

## 8. แฮชแท็ก (Hashtags)

เส้นทาง: `/hashtags`

### 8.1 ค้นหาแฮชแท็ก

- **Endpoint:** `GET /hashtags/search`
- **สิทธิ์การเข้าถึง:** Public
- **Query Parameters:** `q` (คำค้นหาแฮชแท็ก เช่น `q=Tech`)
- **Response (200 OK):** แสดงรายการแฮชแท็กที่มีคำตรงกันไม่เกิน 10 รายการ โดยเรียงตามจำนวนการถูกใช้งานยอดนิยม (`usageCount`)

---

## 9. การค้นหาบทความ (Search)

เส้นทาง: `/search`
ใช้สำหรับค้นหาโพสต์/บทความทั้งหมด โดยใช้ระบบจัดลำดับความสำคัญของผลลัพธ์ (Relevance Ranking)

### 9.1 ค้นหาโพสต์

- **Endpoint:** `GET /search`
- **สิทธิ์การเข้าถึง:** Public (หากไม่ได้ล็อกอินจะค้นหาได้เฉพาะโพสต์ที่มี `status = 1` หรือสถานะเผยแพร่เท่านั้น)
- **Query Parameters:**
  - `q` (Required): คำค้นหาหลัก (เช่น `q=Tech`)
  - `page` (default: `1`): ลำดับหน้า
  - `limit` (default: `10`): จำนวนผลลัพธ์ต่อหน้า
  - `fields` (Optional): ฟิลด์ที่ต้องการส่งกลับมา โดยคั่นด้วยเครื่องหมายจุลภาค (เช่น `fields=title,tags,clients`) เพื่อลดปริมาณข้อมูล หากไม่ส่ง ระบบจะส่งกลับทุกฟิลด์หลักโดยดีฟอลต์ (ยกเว้น `relevanceScore` และ `postId` ที่จะส่งกลับเสมอ)
    * สำหรับรูปภาพย่อ คุณสามารถกำหนดขนาดโดยใส่โคลอนคั่นตามหลัง `thumbnailMedia` ได้แก่: `thumbnailMedia:full` (รูปเต็ม), `thumbnailMedia:thumb` (รูปปกติ), `thumbnailMedia:mini` (รูปขนาดเล็ก) **และสามารถระบุร่วมกันหลายขนาดได้** เช่น `fields=title,thumbnailMedia:mini,thumbnailMedia:full`
- **เกณฑ์การเรียงลำดับความสำคัญ (Relevance Weight):**
  1. คำค้นหาตรงกับ **Title** (+4 คะแนน)
  2. คำค้นหาตรงกับ **Tags/Hashtags** (+3 คะแนน)
  3. คำค้นหาตรงกับ **Content Text** (+2 คะแนน)
  4. คำค้นหาตรงกับ **Client Name** ที่ระบุในโพสต์ (+1 คะแนน)
  - เรียงลำดับจากคะแนนสูงสุดลงมา และกรณีคะแนนเท่ากันจะเรียงจากวันที่สร้างล่าสุด (`createdAt` ใหม่สุดก่อน)
- **ข้อมูลที่จะได้รับส่งคืน (Response Fields):**
  - ฟิลด์พื้นฐาน: `postId`, `relevanceScore` (สองฟิลด์นี้ส่งกลับเสมอ) ร่วมกับฟิลด์อื่นๆ ตามที่ระบุใน parameter `fields` (เช่น `title`, `contentText`, `tags`, `createdAt`, `slug`, `status`, `thumbnailMedia` [ที่เลือกขนาดแล้ว], `clients`)
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "postId": 12,
        "title": "U44Tech Modern Web Design",
        "contentText": "เนื้อหาย่อความยาวไม่เกิน 150 ตัวอักษรที่ดึงมาจากบทความเต็ม...",
        "tags": ["Design", "Tech"],
        "createdAt": "2026-05-27T17:00:00.000Z",
        "slug": "u44tech-modern-web-design-12",
        "status": 1,
        "relevanceScore": 6,
        "thumbnailMedia": {
          "id": 1,
          "filename": "web-design.jpg",
          "urlFull": "/uploads/web-design.jpg",
          "urlThumb": "/uploads/web-design_thumb.jpg",
          "urlMini": "/uploads/web-design_mini.jpg",
          "blurHash": "L6PZ0V~q.Txu00%MofRj00WBofxu",
          "width": 1920,
          "height": 1080
        },
        "clients": [
          {
            "clientId": 5,
            "name": "Google",
            "logoMedia": {
              "id": 2,
              "filename": "google-logo.jpg",
              "urlFull": "/uploads/google-logo.jpg",
              "urlThumb": "/uploads/google-logo_thumb.jpg",
              "urlMini": "/uploads/google-logo_mini.jpg",
              "blurHash": "L6PZ0V~q.Txu00%MofRj00WBofxu",
              "width": 200,
              "height": 200
            }
          }
        ]
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "query": "Tech"
    }
  }
  ```

### 9.2 ตัวอย่างการเรียกใช้งาน (Example Usage)

#### 1. ตัวอย่าง URL รูปแบบต่างๆ (Example URLs)
- **ค้นหาแบบทั่วไป (ค่าเริ่มต้น):**
  `http://localhost:4000/search?q=NestJS`
- **ค้นหาแบบแบ่งหน้า (หน้า 1 ดึง 5 รายการ):**
  `http://localhost:4000/search?q=NestJS&page=1&limit=5`
- **ค้นหาแบบกรองเฉพาะฟิลด์ที่ต้องการ (ลดขนาด JSON):**
  `http://localhost:4000/search?q=NestJS&fields=title,tags,clients`
- **ค้นหาพร้อมเลือกขนาดรูปภาพ Thumbnail เป็นขนาดเล็กสุด (mini) ร่วมกับฟิลด์อื่นๆ:**
  `http://localhost:4000/search?q=NestJS&fields=title,thumbnailMedia:mini`
- **ค้นหาพร้อมดึงรูปภาพ Thumbnail หลายขนาดพร้อมกัน (เช่น mini และ full):**
  `http://localhost:4000/search?q=NestJS&fields=title,thumbnailMedia:mini,thumbnailMedia:full`
- **แบบผสม (หน้า 1, เอา 5 โพสต์, กรองเฉพาะเรื่องและรูปภาพขนาดเล็ก):**
  `http://localhost:4000/search?q=NestJS&page=1&limit=5&fields=title,thumbnailMedia:mini`



#### 2. ตัวอย่างการใช้ cURL
```bash
curl -X GET "http://localhost:4000/search?q=NestJS&page=1&limit=5"
```

### 9.3 คำอธิบายเพิ่มเติมเกี่ยวกับ Relevance Score (Explanation)

- **สะสมคะแนน (Cumulative Scoring)**: หากคำค้นหาตรงกับหลายช่อง คะแนนของโพสต์นั้นจะบวกสะสมรวมกัน เช่น:
  - บทความมีคำค้นหาใน **Title** (+4) และ **Tags** (+3) → **คะแนนรวม = 7 คะแนน**
  - บทความมีคำค้นหาใน **Content Text** (+2) และ **Client Name** (+1) → **คะแนนรวม = 3 คะแนน**
- **กรณีคะแนนความสำคัญเท่ากัน (Tie-breaker)**: หากมีบทความมากกว่าหนึ่งบทความที่มีคะแนน `relevanceScore` เท่ากัน ระบบจะจัดอันดับโดยนำบทความที่เขียนเสร็จล่าสุดขึ้นมาแสดงก่อน (`created_at DESC`)
- **ความปลอดภัยของฐานข้อมูล**: การค้นหาใช้ Prepared Statements ป้องกัน SQL Injection โดยการแยก Parameter คำค้นหาส่งผ่าน Drizzle ORM binding
