// Jiali Sheng
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
const app = new Hono();
const pokemon = [
    {
        id: 1,
        name: "Pikachu",
        species: 'Pikachu',
        health: 100,
        level: 5,
        owner: 'Ash'
    }
];
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.get('/api/pokemon', (c) => {
    return c.json(pokemon);
});
app.get('/api/pokemon/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
        return c.json({ error: 'Invalid Pokemon ID' }, 400);
    }
    const foundPokemon = pokemon.find((p) => p.id === id);
    if (!foundPokemon) {
        return c.json({ error: 'Pokemon not found' }, 404);
    }
    return c.json(foundPokemon);
});
app.post('/api/pokemon', async (c) => {
    let body;
    try {
        body = await c.req.json();
    }
    catch {
        return c.json({ error: 'Invalid JSON body' }, 400);
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return c.json({ error: 'Body must be a JSON object' }, 400);
    }
    const { id, name, species, owner, health, level } = body;
    if ('id' in body) {
        return c.json({ error: 'ID must not be provided' }, 400);
    }
    if (typeof species !== 'string' || !species.trim()) {
        return c.json({ error: 'Species is required' }, 400);
    }
    if (typeof owner !== 'string' || !owner.trim()) {
        return c.json({ error: 'Owner is required' }, 400);
    }
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return c.json({ error: 'Name must be a non-empty string' }, 400);
    }
    if (health !== undefined && (typeof health !== 'number' || !Number.isFinite(health))) {
        return c.json({ error: 'Health must be a number' }, 400);
    }
    if (level !== undefined && (typeof level !== 'number' || !Number.isFinite(level))) {
        return c.json({ error: 'Level must be a number' }, 400);
    }
    let newId;
    do {
        newId = Math.floor(Math.random() * 1000000) + 1;
    } while (pokemon.some((p) => p.id === newId));
    const newPokemon = {
        id: newId,
        name: name === undefined ? species : name,
        species,
        health: Math.floor(Math.random() * 100) + 1,
        level: Math.floor(Math.random() * 100) + 1,
        owner
    };
    pokemon.push(newPokemon);
    return c.json(newPokemon, 201);
});
app.patch('/api/pokemon/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
        return c.json({ error: 'Invalid Pokemon ID' }, 400);
    }
    const foundPokemon = pokemon.find((p) => p.id === id);
    if (!foundPokemon) {
        return c.json({ error: 'Pokemon not found' }, 404);
    }
    let body;
    try {
        body = await c.req.json();
    }
    catch {
        return c.json({ error: 'Invalid JSON body' }, 400);
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return c.json({ error: 'Body must be a JSON obejct' }, 400);
    }
    const updates = body;
    const allowedFields = ['name', 'species', 'health', 'level', 'owner'];
    for (const key of Object.keys(updates)) {
        if (!allowedFields.includes(key)) {
            return c.json({ error: `Cannot update field: ${key}` }, 400);
        }
    }
    for (const field of ['name', 'species', 'owner']) {
        if (field in updates) {
            const value = updates[field];
            if (typeof value !== 'string' || !value.trim()) {
                return c.json({ error: `${field} must be a non-empty string` }, 400);
            }
        }
    }
    for (const field of ['health', 'level']) {
        if (field in updates) {
            const value = updates[field];
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                return c.json({ error: `${field} must be a number` }, 400);
            }
        }
    }
    Object.assign(foundPokemon, updates);
    return c.json(foundPokemon, 200);
});
app.delete('/api/pokemon/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
        return c.json({ error: 'Invalid Pokemon ID' }, 400);
    }
    const index = pokemon.findIndex((p) => p.id === id);
    if (index === -1) {
        return c.json({ error: 'Pokemon not found' }, 404);
    }
    const deletedPokemon = pokemon.splice(index, 1)[0];
    return c.json(deletedPokemon, 200);
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
