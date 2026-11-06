class LibroDTO {
    constructor(datos) {
        datos = datos || {};
        this.titulo = typeof datos.titulo === 'string' ? datos.titulo.trim() : '';
        this.autor = typeof datos.autor === 'string' ? datos.autor.trim() : '';
        this.categoria = typeof datos.categoria === 'string' ? datos.categoria.trim() : '';
        this.precio = Number(datos.precio);
        this.stock = Number(datos.stock);
    }

    validar() {
        if (!this.titulo || !this.autor || !Number.isFinite(this.precio) ||
            !Number.isInteger(this.stock)) {
            return 'Título, autor, precio y stock son obligatorios y deben tener un formato válido.';
        }
        if (this.precio < 0) {
            return 'El precio no puede ser negativo.';
        }
        if (this.stock < 0) {
            return 'El stock no puede ser negativo.';
        }
        return null;
    }
}

module.exports = LibroDTO;