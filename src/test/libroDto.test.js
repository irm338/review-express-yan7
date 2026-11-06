const test = require('node:test');
const assert = require('node:assert/strict');
const LibroDTO = require('../dtos/libretoDto');

test('acepta los datos correctos de un libro', () => {
    const libro = new LibroDTO({
        titulo: ' Cien años de soledad ',
        autor: ' Gabriel García Márquez ',
        categoria: 'Novela',
        precio: '25.50',
        stock: '3'
    });

    assert.equal(libro.validar(), null);
    assert.equal(libro.titulo, 'Cien años de soledad');
    assert.equal(libro.precio, 25.5);
    assert.equal(libro.stock, 3);
});

test('rechaza datos incompletos y cantidades negativas o fraccionarias', () => {
    assert.match(new LibroDTO({}).validar(), /obligatorios/);
    assert.match(new LibroDTO({
        titulo: 'Libro',
        autor: 'Autora',
        precio: 10,
        stock: -1
    }).validar(), /negativo/);
    assert.match(new LibroDTO({
        titulo: 'Libro',
        autor: 'Autora',
        precio: 10,
        stock: 1.5
    }).validar(), /formato válido/);
});
