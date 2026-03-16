import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const VALID_TOKEN = "auro-parts-secret-token-123";

  // Auth Middleware
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${VALID_TOKEN}`) {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized: Token expired or invalid" });
    }
  };

  // Public Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    // Dummy validation
    if (email === "admin@auroparts.com" && password === "admin123") {
      res.json({ 
        success: true, 
        user: { email, name: "Admin User" },
        token: VALID_TOKEN 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });

  // Protected Routes - Apply middleware to all /api routes after this
  app.use("/api", (req, res, next) => {
    if (req.path === "/login") return next();
    authMiddleware(req, res, next);
  });

  // API Routes
  app.get("/api/sidebar", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/sidebar.json"), "utf-8"));
    res.json(data);
  });

  app.get("/api/schema", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/schema.json"), "utf-8"));
    res.json(data);
  });

  app.get("/api/routes", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/routes.json"), "utf-8"));
    res.json(data);
  });

  app.get("/api/products", (req, res) => {
    const { page = 1, limit = 10, search = "", status = "all", parentId = "all" } = req.query;
    const allProducts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/products.json"), "utf-8"));
    
    let filteredProducts = [...allProducts];

    // Search
    if (search) {
      const query = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.identifier.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (status !== "all") {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }

    // Filter by parentId
    if (parentId !== "all") {
      filteredProducts = filteredProducts.filter(p => p.parent_id === parentId);
    }

    // Pagination
    const total = filteredProducts.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + Number(limit));

    res.json({
      products: paginatedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  });

  app.get("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const allProducts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/products.json"), "utf-8"));
    const product = allProducts.find((p: any) => p.id === id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.post("/api/products", (req, res) => {
    const newProduct = req.body;
    const productsPath = path.join(process.cwd(), "server/data/products.json");
    const allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    
    const productWithId = {
      ...newProduct,
      id: `PRD-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    
    allProducts.unshift(productWithId);
    fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 4));
    res.status(201).json(productWithId);
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const productsPath = path.join(process.cwd(), "server/data/products.json");
    const allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    
    const index = allProducts.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      allProducts[index] = { ...allProducts[index], ...updatedData };
      fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 4));
      res.json(allProducts[index]);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const productsPath = path.join(process.cwd(), "server/data/products.json");
    let allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    
    const initialLength = allProducts.length;
    allProducts = allProducts.filter((p: any) => p.id !== id);
    
    if (allProducts.length < initialLength) {
      fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 4));
      res.json({ success: true, message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.post("/api/products/bulk-delete", (req, res) => {
    const { ids } = req.body;
    const productsPath = path.join(process.cwd(), "server/data/products.json");
    let allProducts = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    
    allProducts = allProducts.filter((p: any) => !ids.includes(p.id));
    fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 4));
    res.json({ success: true, message: `${ids.length} products deleted` });
  });

  app.get("/api/dashboard", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/dashboard.json"), "utf-8"));
    res.json(data);
  });

  app.get("/api/settings", (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "server/data/settings.json"), "utf-8"));
    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
