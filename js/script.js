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


document.getElementById('carrito').addEventListener('confirmar', async (e) => {
  e.preventDefault();

  const destino = document.getElementById('destino').value;
  const fechaIda = new Date(document.getElementById('fecha-ida').value);
  const fechaRegreso = new Date(document.getElementById('fecha-regreso').value);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const maxFechaPermitida = new Date(hoy);
  maxFechaPermitida.setDate(hoy.getDate() + 15); // 16 días en total

  const coords = destinos[destino];
  if (!coords || isNaN(fechaIda) || isNaN(fechaRegreso) || fechaIda > fechaRegreso) {
    alert("Por favor, completá correctamente las fechas del viaje.");
    return;
  }

  let startDate, endDate;
  let mensajeExtra = '';

  // Caso 1: Todo el viaje está fuera del rango permitible
  if (fechaIda > maxFechaPermitida) {
    startDate = hoy.toISOString().split('T')[0];
    endDate = new Date(hoy);
    endDate.setDate(hoy.getDate() + 7);
    endDate = endDate.toISOString().split('T')[0];
    mensajeExtra = "El viaje está fuera del rango máximo de pronóstico. Se muestra el clima desde hoy por 7 días.";
  }
  // Caso 2: Parte del viaje es pronosticable
  else {
    startDate = fechaIda.toISOString().split('T')[0];

    // Si la fecha de regreso excede los 16 días máximos
    let fechaLimite = maxFechaPermitida < fechaRegreso ? maxFechaPermitida : fechaRegreso;
    endDate = fechaLimite.toISOString().split('T')[0];

    if (fechaRegreso > maxFechaPermitida) {
      mensajeExtra = "El pronóstico del clima solo cubre hasta 16 días desde hoy. Se muestra el clima disponible.";
    }
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=America%2FArgentina%2FBuenos_Aires`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    mostrarClima(data, destino, mensajeExtra);
  } catch (err) {
    console.error('Error al obtener clima:', err);
    document.getElementById('clima').innerHTML = '<p>Error al obtener el pronóstico del clima.</p>';
  }
});

function weatherCodeToIcon(code) {
  if (code === 0) return 'wi-day-sunny';
  if ([1, 2, 3].includes(code)) return 'wi-day-cloudy';
  if ([45, 48].includes(code)) return 'wi-fog';
  if ([51, 53, 55, 61, 63, 65].includes(code)) return 'wi-rain';
  if ([71, 73, 75, 85, 86].includes(code)) return 'wi-snow';
  if ([95, 96, 99].includes(code)) return 'wi-thunderstorm';
  return 'wi-na';
}

function getColorByWeatherCode(code) {
  if (code === 0) return '#f1c40f'; // Soleado
  if ([1, 2, 3].includes(code)) return '#95a5a6'; // Nublado
  if ([45, 48].includes(code)) return '#7f8c8d'; // Niebla
  if ([51, 53, 55, 61, 63, 65].includes(code)) return '#3498db'; // Lluvia
  if ([71, 73, 75, 85, 86].includes(code)) return '#5dade2'; // Nieve
  if ([95, 96, 99].includes(code)) return '#8e44ad'; // Tormenta
  return '#bdc3c7'; // Otro
}

function mostrarClima(data, destino, mensajeExtra = '') {
  const container = document.getElementById('clima');
  container.innerHTML = `<h2>Pronóstico para ${destino}</h2>`;

  if (mensajeExtra) {
    container.innerHTML += `<p style="color: #e67e22;"><strong>⚠️ ${mensajeExtra}</strong></p>`;
  }

  data.daily.time.forEach((fecha, i) => {
    const code = data.daily.weathercode[i];
    const iconClass = weatherCodeToIcon(code);
    const iconColor = getColorByWeatherCode(code);
    const max = data.daily.temperature_2m_max[i];
    const min = data.daily.temperature_2m_min[i];

    container.innerHTML += `
      <div class="forecast-day">
        <i class="wi ${iconClass}" style="color: ${iconColor};"></i>
        <div>
          <strong>${fecha}</strong><br>
          Máx: ${max}°C | Mín: ${min}°C
        </div>
      </div>
    `;
  });
}

  // ... resto del código ...

