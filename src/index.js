export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const db = env.DB;

    // Fungsi bantu untuk response dengan header CORS
    function withCors(response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*"); // Bisa diganti dengan domain frontend, misal "http://localhost:5173"
      newHeaders.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Handle preflight CORS (OPTIONS)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      // GET /produk
      if (url.pathname === "/produk" && req.method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM produk ORDER BY id DESC")
          .all();
        return withCors(Response.json(results));
      }

      // POST /produk
      if (url.pathname === "/produk" && req.method === "POST") {
        const { nama, harga, stok } = await req.json();
        await db
          .prepare("INSERT INTO produk (nama, harga, stok) VALUES (?, ?, ?)")
          .bind(nama, harga, stok)
          .run();
        return withCors(new Response("Produk ditambahkan", { status: 201 }));
      }

      // PUT /produk
      if (url.pathname === "/produk" && req.method === "PUT") {
        const { id, nama, harga, stok } = await req.json();
        await db
          .prepare(
            "UPDATE produk SET nama = ?, harga = ?, stok = ? WHERE id = ?"
          )
          .bind(nama, harga, stok, id)
          .run();
        return withCors(new Response("Produk diperbarui"));
      }

      // DELETE /produk
      if (url.pathname === "/produk" && req.method === "DELETE") {
        const { id } = await req.json();
        await db.prepare("DELETE FROM produk WHERE id = ?").bind(id).run();
        return withCors(new Response("Produk dihapus"));
      }

      return withCors(new Response("Not found", { status: 404 }));
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      return withCors(
        new Response(`Internal Server Error: ${error.message}`, {
          status: 500,
        })
      );
    }
  },
};
