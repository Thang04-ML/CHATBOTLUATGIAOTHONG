# ChatBot Luật Giao Thông - Frontend 🚀

Frontend của hệ thống ChatBot Luật Giao Thông Việt Nam, được xây dựng bằng **Next.js 16** và **TypeScript**.

---

## 🛠 Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| [Next.js](https://nextjs.org/) | 16.1.2 | React Framework (App Router) |
| [React](https://react.dev/) | 19.2.3 | UI Library |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Type-safe JavaScript |
| [Ant Design](https://ant.design/) | 6.2.0 | UI Component Library |
| [Clerk](https://clerk.dev/) | ^6.36.7 | Authentication |
| [Prisma](https://www.prisma.io/) | ^5.22.0 | Database ORM |
| [React Markdown](https://github.com/remarkjs/react-markdown) | ^10.1.0 | Markdown Rendering |

---

## 📁 Cấu Trúc Thư Mục

```
fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   └── messages/       # Chat API endpoint
│   │   ├── chat/               # Chat pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React Components
│   │   ├── chat/               # Chat-related components
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                 # Reusable UI components
│   └── lib/                    # Utilities & Helpers
│       └── getConversationWindow.ts
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
│   ├── MaoMao.jpg              # Bot avatar
│   └── logoUIT.svg             # UIT logo
├── .env.local                  # Environment variables
└── package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- **Node.js** 18.x trở lên
- **npm** hoặc **yarn** hoặc **pnpm**
- **PostgreSQL** (cho Prisma database)

### Bước 1: Cài đặt Dependencies

```bash
cd fe
npm install
```

### Bước 2: Cấu hình Environment

Tạo file `.env.local` với nội dung:

```env
# Database - PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/chatbot_traffic"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Bước 3: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### Bước 4: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## 📜 Các Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server với hot-reload |
| `npm run build` | Build production bundle |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra code với ESLint |

---

## 🔧 Cấu Hình

### Next.js Config

File `next.config.ts` chứa cấu hình Next.js cơ bản.

### TypeScript Config

File `tsconfig.json` được cấu hình với strict mode và path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Cho phép import dạng: `import { Component } from '@/components/...'`

---

## 🎨 Tính Năng UI

### Chat Interface
- 💬 Real-time messaging
- 📝 Markdown support (tables, code blocks, lists)
- 🤖 Bot avatar với hình ảnh custom
- 📜 Scrollable chat history

### Sidebar
- 📂 Quản lý conversations
- ➕ Tạo chat mới
- 🗑 Xóa conversations

### Header
- 🌙 Dark/Light mode toggle
- 🌐 Language switcher (VI/EN)
- 👤 User profile (Clerk)

---

## 🔌 API Routes

### POST `/api/messages`

Gửi tin nhắn đến backend và nhận phản hồi.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "message": "Mức phạt vượt đèn đỏ là bao nhiêu?",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "Theo Nghị định 100/2019...",
  "sources": ["Điều 5, khoản 3"]
}
```

---

## 🗄 Database Schema (Prisma)

```prisma
model Conversation {
  id        String    @id @default(uuid())
  title     String?
  userId    String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(uuid())
  content        String
  role           String       // "user" | "assistant"
  conversationId String
  conversation   Conversation @relation(...)
  createdAt      DateTime     @default(now())
}
```

---

## 🐛 Troubleshooting

### Lỗi phổ biến

**1. Database connection failed**
```bash
# Kiểm tra DATABASE_URL trong .env.local
# Đảm bảo PostgreSQL đang chạy
```

**2. Clerk authentication error**
```bash
# Kiểm tra CLERK_SECRET_KEY và NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Đảm bảo đã cấu hình đúng trong Clerk Dashboard
```

**3. Cannot connect to backend API**
```bash
# Đảm bảo backend đang chạy tại http://localhost:8000
# Kiểm tra NEXT_PUBLIC_API_URL trong .env.local
```

---

## 📚 Tài Liệu Tham Khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Components](https://ant.design/components/overview)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.dev/docs)

---

## 🚀 Deploy

### Vercel (Recommended)

1. Push code lên GitHub
2. Import project vào [Vercel](https://vercel.com)
3. Cấu hình Environment Variables
4. Deploy!

### Docker

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 📄 License

MIT License - Xem file [LICENSE](../LICENSE) để biết thêm chi tiết.
