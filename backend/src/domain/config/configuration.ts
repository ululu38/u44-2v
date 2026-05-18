export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://u44admin:u44password@localhost:5432/u44tech_v2',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'u44supersecret',
    expiresIn: '1d',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  initialAdmin: {
    username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'password123',
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@u44tech.com',
  },
});
