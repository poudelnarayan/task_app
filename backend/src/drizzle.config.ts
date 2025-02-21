import { defineConfig } from "drizzle-kit";


export default defineConfig({
    dialect: "postgresql",
    schema: "./db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        host: "db",
        port: 5432,
        database: "mydb",
        user: "postgres",
        password: "tests123",
        ssl:false, 
    }
})