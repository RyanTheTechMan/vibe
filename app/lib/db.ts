import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    return pool;
};

export default getPool;