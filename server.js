import 'dotenv/config';
import express from "express"
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import req from 'express/lib/request';
import res from 'express/lib/response';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3000;

app.use(express.json())


// ==================== USERS ====================

// Créer un user
app.post("/users", async (req, res) => {
    const { email, name } = req.body;

    const user = await prisma.user.create({
        data: { email, name }
    })

    res.json(user)
})

// Créer un user avec ses posts en même temps (nested create)
app.post("/users/with-posts", async (req, res) => {
    const { email, name } = req.body;
    const user = await prisma.user.create({
        data: {
            email,
            name,
            posts: {
                create: posts
            }
        },
        include: { posts: true }
    })

    res.json(user)
})

// Récuperer tous les users
app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
        include: { posts: true }
    })

    res.json(users)
})

// Récuperer un user par ID
app.get("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id)

    const user = await prisma.user.findUnique({
        where: { id },
        include: { posts: true }
    })

    res.json(user)
})

// Modifier un user
app.put("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const { name } = req.body

    const user = await prisma.user.update({
        where: { id },
        data: { name }
    })

    res.json(user)
})

// Upsert user (créer s'il n'existe pas, modifier s'il existe)
app.post("/users/upsert", async (req, res) => {
    const { email, name } = req.body;

    const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: { email, name }
    })

    res.json(user)
})

// Supprimer un user
app.delete("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id)

    const user = await prisma.user.delete({
        where: { id }
    })

    res.json(user)
})


// ==================== POSTS ====================

// Créer un post
app.post("/posts", async (req, res) => {
    const { title, content, userId } = req.body;

    const post = await prisma.post.create({
        data: { title, content, userId }
    })

    res.json(post)
})

// Récuperer tous les posts (pagination + tri)
app.get("/posts", async (req, res) => {

    const page = parseInt(req.query.page) || 1
    const limit = 5
    const sort = req.query.sort || "asc"

    const posts = await prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: sort },
        include: { user: true }
    })

    res.json(posts)
})


// Récuperer les posts d'un user
app.get("users/:id/posts", async (req, res) => {
    const userId = parseInt(req.params.id)

    const posts = await prisma.post.findMany({
        where: { userId }
    })

    res.json(posts)
})

// Recherche dans les posts
app.get("/search", async (req, res) => {

    const q = req.query.q

    const posts = await prisma.post.findMany({
        where: {
            title: {
                contains: q,
                mode: "insensitive" // insensible à la casse
            }
        }
    })

    res.json(posts)
})

// Modifier un post
app.put("posts/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const { title, content } = req.body;

    const posts = await prisma.post.update({
        where: { id },
        data: { title, content }
    })

    res.json(posts)
})

// Supprimer un post
app.delete("/posts/:id", async (req, res) => {
    const id = parseInt(req.params.id)

    const post = await prisma.post.delete({
        where: { id }
    })
    res.json(post)
})

// ==================== AGREGATIONS ====================

// Compter tous les posts
app.get("/stats/posts/count", async (req, res) => {
    const count = await prisma.post.count()
    res.json({ count })
})

// Compter les posts par user
app.get("/stats/posts/by-user", async (req, res) => {
    const result = await prisma.post.groupBy({
        by: ["userId"],
        _count: { id: true }
    })

    res.json(result)
})


// ==================== TRANSACTIONS ====================

// Créer un user et son premier post en même temps (atomique)
app.post("/users/with-first-post", async (req, res) => {
    const { email, name, title, content } = req.body;

    const [user, post] = await prisma.$transaction([
        prisma.user.create({
            data: { email, name }
        }),
        prisma.post.create({
            data: { title, content, user: { connect: { email } } }
        })
    ])

    res.json({ user, post })
})

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
})