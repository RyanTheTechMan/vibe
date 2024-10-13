import React from 'react';
import getPool from '../lib/db'; // Not sure why I need to go up to /app
import { Card, CardBody } from "@nextui-org/card";

type Name = {
    id: number;
    name: string;
};

async function fetchNames(): Promise<Name[]> {
    // Simulating a delayed response
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pool = getPool();
    const [rows] = await pool.query('SELECT id, name FROM ryan_testing ORDER BY id DESC');
    return rows as Name[];
}

const NamesList = async () => {
    const names = await fetchNames();

    return (
        <ul className="space-y-2">
            {names.map((person) => (
                <li key={person.id}>
                    <Card>
                        <CardBody>
                            <p>{person.name}</p>
                        </CardBody>
                    </Card>
                </li>
            ))}
        </ul>
    );
};

export default NamesList;
