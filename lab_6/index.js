import Fastify from "fastify";

const fastify = Fastify({ logger: true });

let productos = [
    { id: 1, nombre: "Soda", precio: 1, categoria: "Bebidas" },
    { id: 2, nombre: "Agua", precio: 1.5, categoria: "Bebidas" },
    { id: 3, nombre: "Galletas", precio: 1.25, categoria: "Snacks" },
];

let siguienteId = 4;

function validarProductos(datos) {
    const errores = [];

    if (!datos.nombre || datos.nombre.trim() === "") {
        errores.push("El nombre es requerido");
    }

    if (!datos.precio || datos.precio < 1 || datos.precio > 1000) {
        errores.push("El precio debe estar entre 1 y 1000");
    }

    if (!datos.categoria || datos.categoria.trim() === "") {
        errores.push("La categoría es requerida");
    }

    return errores;
}

fastify.get("/", async (request, reply) => {
    return { message: "¡Hola bienvenido a la tiendita de Casti!" };
});

fastify.get("/productos", (request, reply) => {
    if (productos.length === 0) {
        return reply.send({ mensaje: "No hay productos disponibles" });
    }
    return reply.send(productos);
});

function encontrarProducto(id) {
    return productos.find((producto) => producto.id === parseInt(id));
}

fastify.get("/productos/:id", (request, reply) => {
    const { id } = request.params;
    const producto = encontrarProducto(id);

    if (!producto) {
        return reply.code(404).send({
        error: "Producto no encontrado",
        id: parseInt(id),
        status: "error",
    });
    }

    return reply.send(producto);
});

fastify.post("/productos", (request, reply) => {
    const datos = request.body;
    const errores = validarProductos(datos);
    if (errores.length > 0) {
        return reply.code(400).send({
            status: "error",
            errores,
        });
    }

const nuevoProducto = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    precio: Number(datos.precio),
    categoria: datos.categoria.trim(),
};

productos.push(nuevoProducto);

return reply.code(201).send({
    status: "success",
    mensaje: "Producto creado exitosamente",
    producto: nuevoProducto,
    });
});

fastify.put("/productos/:id", (request, reply) => {
    const { id } = request.params;
    const datos = request.body;
    const indice = productos.findIndex((p) => p.id === parseInt(id));
    if (indice === -1) {
    return reply.code(404).send({
        status: "error",
        error: "Producto no encontrado",
        id: parseInt(id),
        });
    }

const errores = validarProductos(datos);
    if (errores.length > 0) {
        return reply.code(400).send({
            status: "error",
            errores,
    });
}

productos[indice] = {
    id: parseInt(id),
    nombre: datos.nombre.trim(),
    precio: Number(datos.precio),
    categoria: datos.categoria.trim(),
};

return reply.send({
    status: "success",
    mensaje: "Producto actualizado exitosamente",
    producto: productos[indice],
    });
});

fastify.delete("/productos/:id", (request, reply) => {
    const { id } = request.params;
    const indiceProducto = productos.findIndex((e) => e.id === parseInt(id));

    if (indiceProducto === -1) {
        return reply.code(404).send({
        error: "Producto no encontrado",
        id: parseInt(id),
        status: "error",
    });
}

const productoEliminado = productos.splice(indiceProducto, 1)[0];

return reply.send({
    producto: {
        id: productoEliminado.id,
        nombre: productoEliminado.nombre,
        precio: productoEliminado.precio,
        categoria: productoEliminado.categoria,
    },
    mensaje: "Producto eliminado exitosamente",
    fechaEliminacion: new Date().toISOString(),
    status: "success",
    });
});

const iniciarServidor = async () => {
    try {
        const puerto = process.env.PORT || 3000;
        const host = process.env.HOST || "0.0.0.0";
        await fastify.listen({ port: puerto, host });

        console.log(`Servidor corriendo en http://${host}:${puerto}`);
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
};

process.on("SIGINT", async () => {
    console.log("Cerrando servidor...");
    try {
        await fastify.close();
        console.log("Servidor cerrado correctamente");
        process.exit(0);
    } catch (error) {
        console.error("Error al cerrar el servidor:", error);
        process.exit(1);
    }
});

iniciarServidor();
