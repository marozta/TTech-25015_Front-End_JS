// objeto con los precios de los destinos (reemplazan a los del HTML si no estuvieran)
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

// objeto con los niveles de los alojamientos
const nombresNivel = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  platino: 'Platino'
};

// objeto que indican el diferencial de precio de cada nivel de alojamiento
const multiplicadorNivel = {
  bronce: 1.0,
  plata: 1.5,
  oro: 2.5,
  platino: 4.0
};

// objeto que indica la latitud y la longitud de cada destino
// (Necesario para la API de pronostico del clima)
const destinos = {
  "Bariloche": { lat: -41.1335, lon: -71.3103 },
  "El Calafate": { lat: -50.3378, lon: -72.2648 },
  "Cataratas del Iguazú": { lat: -25.6953, lon: -54.4367 },
  "Córdoba": { lat: -31.4201, lon: -64.1888 },
  "Mar del Plata": { lat: -38.0055, lon: -57.5426 },
  "Mendoza": { lat: -32.8908, lon: -68.8272 },
  "Puerto Madryn": { lat: -42.7692, lon: -65.0385 },
  "Salta y Jujuy": { lat: -24.7829, lon: -65.4232 },
  "Usuahia": { lat: -54.8019, lon: -68.3030 }
};

let carrito = [];

// muetra el carrito almacenado en localStorage
window.addEventListener('DOMContentLoaded', () => {
  const almacenado = localStorage.getItem('carritoViajes');
  if (almacenado) {
    carrito = JSON.parse(almacenado);
    mostrarCarrito();
  }
});

// toma el destino de las opciones del formulario "BOOK"
document.getElementById('form-viaje').addEventListener('submit', function (e) {
  e.preventDefault();

  const destinoSelect = document.getElementById('destino');
  const selectedOption = destinoSelect.selectedOptions[0];
  const destino = selectedOption.value;
  const destinoNombre = selectedOption.textContent;

  // toma el precio base del destino del HTML o del objeto "preciosDestino" en su defecto
  let precioBase = selectedOption.getAttribute('data-precio') || preciosDestino[destino];
  precioBase = parseFloat(precioBase);

  // toma el nivel, fecha inicial y final, cantidad de pasajeros totales y menores de las opciones del formulario "BOOK"
  const nivel = document.getElementById('nivel-hotel').value;
  const fechaIda = new Date(document.getElementById('fecha-ida').value);
  const fechaVuelta = new Date(document.getElementById('fecha-regreso').value);
  const pasajeros = parseInt(document.getElementById('pasajeros').value);
  const menores = parseInt(document.getElementById('menores').value);

  // calcula la diferencia en dias entre la fecha de llegada y de regreso
  const dias = Math.ceil((fechaVuelta - fechaIda) / (1000 * 60 * 60 * 24));

  // verifica que la fecha de regreso sea posterior a la de llegada
  if (dias <= 0) {
    alert("La fecha de regreso debe ser posterior a la de ida.");
    return;
  }
  // verifica que la cantidad de pasajeros menores sea menor a la de pasajeros totales
  if (menores > pasajeros) {
    alert("La cantidad de menores no puede ser mayor que la cantidad total de pasajeros.");
    return;
  }
  // calcula el precio del viaje por pasajero en funcion del precio base, el nivel del hotel y la cantidad de dias
  // a los pasajeros menores les aplica un descuento del 50%
  const multiplicador = multiplicadorNivel[nivel];
  const precioPorAdulto = precioBase * multiplicador * dias;
  const precioTotal = (pasajeros - menores) * precioPorAdulto + menores * (precioPorAdulto * 0.5);

  // se construye un objeto "item" con todos los datos del carrito de compras
  const item = {
    destino: destinoNombre,
    nivelNombre: nombresNivel[nivel],
    fechaIda: fechaIda.toISOString().split('T')[0],
    fechaVuelta: fechaVuelta.toISOString().split('T')[0],
    dias,
    pasajeros,
    menores,
    precio: precioTotal
  };
  // se coloca el objeto "item" en el carrito y se llama a funciones de carrito
  carrito.push(item);
  guardarCarrito();
  mostrarCarrito();
});

  //  funcion que muestra el carrito en el HTML
function mostrarCarrito() {
  // se obtiene la tabla "tabla-carrito" del HTML y el tbody de la tabla
  const tabla = document.getElementById('tabla-carrito');
  const tbody = tabla.querySelector('tbody');
  tbody.innerHTML = '';
  let total = 0;

  // se verifica que el carrito tenga un objeto cargado
  if (carrito.length === 0) {
    tabla.style.display = 'none';
    document.getElementById('total').textContent = '';
    return;
  }

  tabla.style.display = 'table';
  // se cargan los elementos del objeto "item" para mostrar en el carrito 
  carrito.forEach((item, index) => {
    const cantidadAdultos = item.pasajeros - item.menores;
    const dias = item.dias;
    const precioPorAdultoPorDia = (item.precio / (cantidadAdultos + item.menores * 0.5)) / dias;
    const precioPorMenorPorDia = precioPorAdultoPorDia * 0.5; // los menores tienen un descuento del 50%

    const subtotalAdultos = cantidadAdultos * precioPorAdultoPorDia * dias;
    const subtotalMenores = item.menores * precioPorMenorPorDia * dias;
    const hayMenores = item.menores > 0;

    // se crea la tabla que configura el carrito
    const filaAdultos = document.createElement('tr');
    if (!hayMenores) {
    filaAdultos.classList.add('solo-adultos');
    }

    filaAdultos.innerHTML = `
      <td ${hayMenores ? 'rowspan="2"' : ''}>${item.destino}</td>
      <td ${hayMenores ? 'rowspan="2"' : ''}>${item.nivelNombre}</td>
      <td ${hayMenores ? 'rowspan="2"' : ''}>${dias}</td>
      <td>${cantidadAdultos} adulto(s)</td>
      <td>$${precioPorAdultoPorDia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      <td>$${subtotalAdultos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      <td class="accion-centro" ${hayMenores ? 'rowspan="2"' : ''}>
        <button class="eliminar" onclick="eliminarItem(${index})">Eliminar</button>
      </td>
    `;

    // se agrega la tabla del carrito la fila de pasajeros adultos
    tbody.appendChild(filaAdultos);

    // se verifica que haya menores para mostrarlos en una linea aparte en el carrito
    if (hayMenores) {
      const filaMenores = document.createElement('tr');
      filaMenores.innerHTML = `
        <td>${item.menores} menor(es)</td>
        <td>$${precioPorMenorPorDia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        <td>$${subtotalMenores.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      `;
      tbody.appendChild(filaMenores);
    }
    // muestra una linea de separacion al final del carrito
    const filaSeparadora = document.createElement('tr');
    filaSeparadora.innerHTML = `<td colspan="7" style="background-color: #ddd; height: 10px;"></td>`;
    tbody.appendChild(filaSeparadora);

    // se obtiene el precio total sumando el precio de los pasajeros adultos y de los menores
    total += subtotalAdultos + subtotalMenores;
  });

  // se agrega el precio total al elemento "total" en el HTML
  document.getElementById('total').textContent = `Total: $${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

// funcion que permite eliminar un viaje del carrito
function eliminarItem(index) {

  if (confirm("¿Seguro que quieres eliminar este ítem del carrito?")) {
    carrito.splice(index, 1);
    guardarCarrito();
    mostrarCarrito();
  }
}

// funcion que permite vaciar los campos del carrito
function vaciarCarrito() {
  if (confirm("¿Seguro que deseas vaciar todo el carrito?")) {
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    document.getElementById('resumen').innerHTML = '';
    document.getElementById('clima').innerHTML = '';
    document.getElementById('titulo-clima').innerHTML = 'Pronóstico del clima para su viaje';
  }
}

// funcion que permite guardar el carrito en el localStorage
function guardarCarrito() {
  localStorage.setItem('carritoViajes', JSON.stringify(carrito));
}

// funcion que permite confirmar la compra mostrando en pantalla un resumen de la misma
async function confirmarCompra() {
  // Verifica que los campos nombre, email y telefono no estén vacíos y genera una alerta
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  if (!nombre || !email || !phone) {
    alert("Por favor, complete los campos: Nombre, Email y Teléfono antes de confirmar la compra.");
    return; // Detiene la función si falta algún dato de identificacion
  }

  // verifica que el carrito no este vacio
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  // toma los datos de los campos del carrito
  let total = 0;
  let detalleViajes = '';
  const primerDestino = carrito[0];
  const destinoNombre = primerDestino.destino;
  const fechaIda = new Date(primerDestino.fechaIda);
  const fechaRegreso = new Date(primerDestino.fechaVuelta);

  // agrega cada campo del carrito al resumen de compra
  carrito.forEach((item) => {
    total += item.precio;
    const adultos = item.pasajeros - item.menores;

    // string template con los datos a mostrar
    detalleViajes += `
      <div style="margin-bottom: 1em; color: green">
        <strong>👤 Nombre:</strong> ${nombre}<br>
        <strong>📧 Email:</strong> ${email}<br>
        <strong>📞 Teléfono:</strong> ${phone}<br>
        <strong>🧭 Destino:</strong> ${item.destino}<br>
        <strong>⭐ Nivel:</strong> ${item.nivelNombre}<br>
        <strong>📅 Fecha ida:</strong> ${item.fechaIda}<br>
        <strong>📅 Fecha vuelta:</strong> ${item.fechaVuelta}<br>
        <strong>📆 Días:</strong> ${item.dias}<br>
        <strong>👨‍👩‍👧 Pasajeros:</strong> ${item.pasajeros} (Adultos: ${adultos}, Menores: ${item.menores})<br>
        <strong>💰 Precio total:</strong> $${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2})}
      </div>
    `;
  });

// string template con los datos del resumen
  const resumenHtml = `
    <h3 style="color: green; font-weight: bold; align:center">Resumen de la compra:</h3>
    ${detalleViajes}
  `;

  // muestra el resumen de la compra en pantalla
  document.getElementById('resumen').innerHTML = resumenHtml;

  // llama a la funcion obtenerClima con destino y fechas para mostrar pronóstico del clima
  obtenerClima(destinos[destinoNombre].lat, destinos[destinoNombre].lon, fechaIda, fechaRegreso, destinoNombre);
}

// funcion que asigna iconos a los datos de la API del clima
function codigoAIcono(codigo) {
  if (codigo === undefined) return '❓';
  if ([0].includes(codigo)) return '☀️';
  if ([1, 2].includes(codigo)) return '🌤️';
  if ([3].includes(codigo)) return '☁️';
  if ([45, 48].includes(codigo)) return '🌫️';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(codigo)) return '🌦️';
  if ([56, 57, 66, 67].includes(codigo)) return '🌧️';
  if ([71, 73, 75, 85, 86].includes(codigo)) return '❄️';
  if ([95, 96, 99].includes(codigo)) return '⛈️';
  return '❓';
}
// funcion que muestra convierte en texto los datos de la API del clima
function descripcionClima(codigo) {
  if (codigo === undefined) return 'Desconocido';
  const descripciones = {
    0: "Cielo despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna intensa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada intensa",
    61: "Lluvia leve",
    63: "Lluvia moderada",
    65: "Lluvia fuerte",
    66: "Lluvia helada ligera",
    67: "Lluvia helada intensa",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada fuerte",
    77: "Granos de nieve",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos fuertes",
    85: "Chubascos de nieve ligera",
    86: "Chubascos de nieve fuerte",
    95: "Tormenta",
    96: "Tormenta con granizo leve",
    99: "Tormenta con granizo fuerte"
  };
  return descripciones[codigo] || 'Desconocido';
}

// función para obtener el clima desde la API Open Meteo
// se pasan latitud, longitud del destino, las fechas de llegada y regreso del viajey el nombre del destino
async function obtenerClima(lat, lon, originalFechaIda, originalFechaRegreso, destinoNombre) {
  const container = document.getElementById('clima');
  document.getElementById('titulo-clima').innerText = `Pronóstico del clima para su viaje a ${destinoNombre}`;

  // se cargan los datos obteniddos en el HTML
  container.innerHTML = '<p>Cargando clima...</p>';

  // se determina la fecha actual 
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaMax = new Date(hoy);

  // se establece la fecha máxima del pronóstico. La extensión máxima del pronóstico de la API es de 16 dias
  fechaMax.setDate(fechaMax.getDate() + 15); // Hoy + 15 = 16 días total

  // se toman las fecha de ida y de regreso del viaje
  let fechaIda = new Date(originalFechaIda);
  let fechaRegreso = new Date(originalFechaRegreso);

  let mensajeExtra = "";

  // Caso 3: todo el viaje está fuera del rango del pronóstico, entonces advierte la situación 
  if (fechaIda > fechaMax) {
    mensajeExtra = `<p><strong>ℹ️ No se puede mostrar el pronóstico del viaje porque excede el rango posible.</strong><br>Mostramos el clima actual y de la próxima semana como referencia.</p>`;
    fechaIda = new Date(hoy);
    fechaRegreso = new Date(hoy);
    fechaRegreso.setDate(fechaRegreso.getDate() + 7);
  }
  // Caso 2: parte del viaje excede el rango de pronóstico, entonces advierte que el viaje excede la extensión del pronóstico 
  else if (fechaRegreso > fechaMax) {
    mensajeExtra = `<p><strong>ℹ️ El pronóstico solo está disponible hasta el ${fechaMax.toLocaleDateString()}.</strong><br>Se mostrarán los días posibles dentro del rango.</p>`;
    fechaRegreso = new Date(fechaMax);
  }
  // se busca el pronóstico de los dias del viaje
  // se armam fechas para la URL de la API
  const start = hoy.toISOString().split('T')[0];
  const end = fechaMax.toISOString().split('T')[0];

  // se realiza la llamada a la url de la API con los datos necesarios: latitud, longitud del destino y fecha de inicia y finalización del viaje
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${start}&end_date=${end}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en la petición de clima');

    const data = await response.json();

    const fechas = data.daily.time.map(d => {
      const [year, month, day] = d.split('-');
      return new Date(Date.UTC(year, month - 1, day));
    });

    const pronostico = fechas.map((fecha, i) => ({
      fecha,
      codigo: data.daily.weathercode[i],
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
    })).filter(p => p.fecha >= fechaIda && p.fecha <= fechaRegreso);

    if (pronostico.length === 0) {
      container.innerHTML = '<p>No hay datos de clima disponibles para las fechas seleccionadas.</p>';
      return;
    }
    // se muestran los datos de cada día del pronóstico
    let html = mensajeExtra;
    html += `<h4>Pronóstico del clima del ${fechaIda.toLocaleDateString()} al ${fechaRegreso.toLocaleDateString()}</h4>`;
    html += `<div style="display: flex; flex-wrap: wrap; gap: 1em; justify-content: flex-start;">`;

    // se colocan los iconos y el formato de salida en los datos del pronóstico
    for (const dia of pronostico) {
      const icono = codigoAIcono(dia.codigo); 
      html += `
        <div style="border: 1px solid #ccc; padding: 0.3em; border-radius: 8px; width: 160px; text-align: center; background: #f9f9f9;">
          <strong>${dia.fecha.toLocaleDateString()}</strong><br>
          <span style="font-size: 1.8em;">${icono}</span><br>
          <span style="color: #555;">${descripcionClima(dia.codigo)}</span><br>
          <small>Max: ${dia.max.toFixed(1)}°C</small><br>
          <small>Min: ${dia.min.toFixed(1)}°C</small>
        </div>
      `;
    }
    // se coloca la respuesta en el HTML para mostrar por pantalla
    html += `</div>`;
    container.innerHTML = html;

  } catch (error) {
    container.innerHTML = `<p>Error al obtener el clima: ${error.message}</p>`;
  }
}


