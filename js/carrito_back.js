const preciosDestino = {
    bariloche: 89900,
    calafate: 99900,
    cataratas: 99900,
    cordoba: 59900,
    mardelplata: 49900,
    mendoza: 59900,
    madryn: 109900,
    salta: 79900,
    usuahia: 129900
};

const multiplicadorHotel = {
    1: 1.0,
    2: 1.5,
    3: 2.5,
    4: 4.0,
};

let carrito = [];

// Cargar carrito desde localStorage
window.addEventListener('DOMContentLoaded', () => {
    const almacenado = localStorage.getItem('carritoViajes');
    if (almacenado) {
    carrito = JSON.parse(almacenado);
    mostrarCarrito();
    }
});

document.getElementById('form-viaje').addEventListener('submit', function(e) {
    e.preventDefault();

    const destinoSelect = document.getElementById('destino');
    const selectedOption = destinoSelect.selectedOptions[0];
    const destino = selectedOption.value;
    const destinoNombre = selectedOption.textContent;

    let precioBase = selectedOption.getAttribute('data-precio') || preciosDestino[destino];
    precioBase = parseFloat(precioBase);

    const hotel = document.getElementById('hotel').value;
    const fechaIda = new Date(document.getElementById('fecha-ida').value);
    const fechaVuelta = new Date(document.getElementById('fecha-vuelta').value);
    const pasajeros = parseInt(document.getElementById('pasajeros').value);
    const menores = parseInt(document.getElementById('menores').value);

    const dias = Math.ceil((fechaVuelta - fechaIda) / (1000 * 60 * 60 * 24));

    if (dias <= 0) {
    alert("La fecha de vuelta debe ser posterior a la de ida.");
    return;
    }

    if (menores > pasajeros) {
    alert("La cantidad de menores no puede ser mayor que la cantidad total de pasajeros.");
    return;
    }

    const multiplicador = multiplicadorHotel[hotel];
    const precioPorAdulto = precioBase * multiplicador * dias;
    const precioTotal = (pasajeros - menores) * precioPorAdulto + menores * (precioPorAdulto * 0.5);

    const item = {
    destino: destinoNombre,
    hotel,
    dias,
    pasajeros,
    menores,
    precio: precioTotal
    };

    carrito.push(item);
    guardarCarrito();
    mostrarCarrito();
});

function mostrarCarrito() {
    const tabla = document.getElementById('tabla-carrito');
    const tbody = tabla.querySelector('tbody');
    tbody.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
    tabla.style.display = 'none';
    document.getElementById('total').textContent = '';
    return;
    }

    tabla.style.display = 'table';

    carrito.forEach((item, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${item.destino}</td>
        <td>${item.hotel} ★</td>
        <td>${item.dias}</td>
        <td>${item.pasajeros}</td>
        <td>${item.menores}</td>
        <td>$${item.precio.toFixed(2)}</td>
        <td><button class="eliminar" onclick="eliminarItem(${index})">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
    total += item.precio;
    });

    document.getElementById('total').textContent = `Total: $${total.toFixed(2)}`;
}

function eliminarItem(index) {
    if (confirm("¿Seguro que quieres eliminar este ítem del carrito?")) {
    carrito.splice(index, 1);
    guardarCarrito();
    mostrarCarrito();
    }
}

function vaciarCarrito() {
    if (confirm("¿Seguro que deseas vaciar todo el carrito?")) {
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    document.getElementById('resumen').innerHTML = '';
    }
}

function confirmarCompra() {
    if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
    }

    const total = carrito.reduce((acc, item) => acc + item.precio, 0);
    const totalPasajeros = carrito.reduce((acc, item) => acc + item.pasajeros, 0);

    document.getElementById('resumen').innerHTML = `
    ✅ ¡Compra confirmada!<br>
    Total pasajeros: <strong>${totalPasajeros}</strong><br>
    Total pagado: <strong>$${total.toFixed(2)}</strong>
    `;

    carrito = [];
    guardarCarrito();
    mostrarCarrito();
}

function guardarCarrito() {
    localStorage.setItem('carritoViajes', JSON.stringify(carrito));
}