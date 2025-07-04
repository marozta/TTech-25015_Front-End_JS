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

const nombresNivel = {
  1: 'Bronce',
  2: 'Plata',
  3: 'Oro',
  4: 'Platino'
};


const multiplicadorNivel = {
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

    const nivel = document.getElementById('nivel').value;
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

    const multiplicador = multiplicadorNivel[nivel];
    const precioPorAdulto = precioBase * multiplicador * dias;
    const precioTotal = (pasajeros - menores) * precioPorAdulto + menores * (precioPorAdulto * 0.5);

    const item = {
    destino: destinoNombre,
    nivel: parseInt(nivel),
    nivelNombre: nombresNivel[nivel],
    fechaIda: fechaIda.toISOString().split('T')[0],
    fechaVuelta: fechaVuelta.toISOString().split('T')[0],
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
        const cantidadAdultos = item.pasajeros - item.menores;
        const dias = item.dias;

        // Precios diarios calculados a partir del total
        const precioPorAdultoPorDia = (item.precio / (cantidadAdultos + item.menores * 0.5)) / dias;
        const precioPorMenorPorDia = precioPorAdultoPorDia * 0.5;

        const subtotalAdultos = cantidadAdultos * precioPorAdultoPorDia * dias;
        const subtotalMenores = item.menores * precioPorMenorPorDia * dias;

        const hayMenores = item.menores > 0;

        // Fila adultos
        const filaAdultos = document.createElement('tr');
        filaAdultos.innerHTML = `
            <td ${hayMenores ? 'rowspan="2"' : ''}>${item.destino}</td>
            <td ${hayMenores ? 'rowspan="2"' : ''}>${nombresNivel[item.nivel]}</td>
            <td ${hayMenores ? 'rowspan="2"' : ''}>${dias}</td>
            <td>${cantidadAdultos} adulto(s)</td>
            
            
            <td>$${precioPorAdultoPorDia.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${subtotalAdultos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td ${hayMenores ? 'rowspan="2"' : ''}>
                <button class="eliminar" onclick="eliminarItem(${index})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(filaAdultos);

        // Fila menores (solo si hay)
        if (hayMenores) {
            const filaMenores = document.createElement('tr');
            filaMenores.innerHTML = `
                <td>${item.menores} menor(es)</td>
                <td>$${precioPorMenorPorDia.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${subtotalMenores.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            tbody.appendChild(filaMenores);
        }

        // Fila separadora
        const filaSeparadora = document.createElement('tr');
        filaSeparadora.innerHTML = `
            <td colspan="7" style="background-color: #ddd; height: 10px;"></td>
        `;
        tbody.appendChild(filaSeparadora);

        total += subtotalAdultos + subtotalMenores;
    });

    document.getElementById('total').textContent = `Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    let total = 0;
    let totalAdultos = 0;
    let totalMenores = 0;

    let detalleViajes = '';

    carrito.forEach((item, index) => {
        total += item.precio;
        const adultos = item.pasajeros - item.menores;
        totalAdultos += adultos;
        totalMenores += item.menores;

        detalleViajes += `
            <div style="margin-bottom: 1em;">
                <strong>🧭 Destino:</strong> ${item.destino}<br>
                <strong>⭐ Nivel:</strong> ${item.nivelNombre}<br>
                <strong>📅 Fecha ida:</strong> ${item.fechaIda}<br>
                <strong>📅 Fecha vuelta:</strong> ${item.fechaVuelta}<br>
                <strong>📆 Días:</strong> ${item.dias}<br>
                <strong>👨‍👩‍👧 Pasajeros:</strong> ${item.pasajeros} (Adultos: ${adultos}, Menores: ${item.menores})<br>
                <strong>💰 Precio total:</strong> $${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        `;
    });

     document.getElementById('resumen').innerHTML = `
        ✅ <strong>¡Compra confirmada!</strong><br><br>
        ${detalleViajes}
    `;

    carrito = [];
    guardarCarrito();
    mostrarCarrito();
}



function guardarCarrito() {
    localStorage.setItem('carritoViajes', JSON.stringify(carrito));
}