"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientePage() {

  const [phone, setPhone] = useState("");
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [occupiedHours, setOccupiedHours] = useState<string[]>([]);
  const [sundayFull, setSundayFull] = useState(false);

  const [reservationDate, setReservationDate] = useState("");
  const [reservationHour, setReservationHour] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");
useEffect(() => {

  if (client) {

    loadData(
      client.id
    );

  }

}, [reservationDate]);

  useEffect(() => {

    const params = new URLSearchParams(
      window.location.search
    );

    const phoneParam =
      params.get("phone");

    if (phoneParam) {

      setPhone(phoneParam);

      setTimeout(async () => {

        const cleanPhone = phone.replace(/\D/g, "").slice(-9);

const { data } = await supabase
  .from("clients")
  .select("*")
  .eq("phone", cleanPhone)
  .single();

        if (data) {

          setClient(data);

          loadData(data.id);

        }

      }, 500);

    }

  }, []);

  async function loadData(
    clientId: number
  ) {

    const {
      data: historyData
    } = await supabase
      .from("history")
      .select("*")
      .eq(
        "client_id",
        clientId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (historyData) {
      setHistory(historyData);
    }

    const {
  data: reservationData
} = await supabase
  .from("reservations")
  .select("*")
  .order(
    "created_at",
    {
      ascending: false
    }
  );

    if (reservationData) {
      setReservations(
        reservationData
      );
    }
const hours = reservationData
?.filter((r) => {

const sameDate =
  reservationDate &&
  r.date.startsWith(
    reservationDate
  );

const active =
r.status !==
"cancelado";

return (
sameDate &&
active
);

})

.map((r)=>

r.date
.split("|")[1]
?.trim()

);

setOccupiedHours(
hours || []
);
if (
reservationDate &&
new Date(
reservationDate +
"T00:00:00"
).getDay() === 0
) {

setSundayFull(
(hours || [])
.length >= 3
);

}
else {

setSundayFull(
false
);

}

}

async function searchClient() {

  const cleanPhone =
    phone
      .replace(/\D/g, "")
      .slice(-9);

  const { data } =
    await supabase
      .from("clients")
      .select("*")
      .eq(
        "phone",
        cleanPhone
      )
      .single();

  if (!data) {

    setError(
      "Cliente no encontrado"
    );

    setClient(null);

    return;

  }

  setError("");

  setClient(data);

  loadData(data.id);

}

  async function createReservation() {

    if (
      !client ||
      !reservationDate ||
      !reservationHour
    ) {

      alert(
        "Selecciona fecha y hora"
      );

      return;

    }
const reservationDateTime =
  `${reservationDate} | ${reservationHour}`;

const {
  data: existingReservation
} = await supabase
  .from("reservations")
  .select("*")
  .eq(
    "date",
    reservationDateTime
  )
  .neq(
    "status",
    "cancelado"
  );

if (
  existingReservation &&
  existingReservation.length > 0
) {

  alert(
    "Esta hora ya está ocupada"
  );

  return;

}
    const { error } =
      await supabase
        .from("reservations")
        .insert([
          {
            client_id:
              client.id,

            name:
              client.name,

            phone:
              client.phone,

            date:
              `${reservationDate} | ${reservationHour}`,

            status:
              "pendiente"
          }
        ]);

    if (error) {

      alert(
        error.message
      );

      return;

    }

    setReservationMessage(
      "✅ Reserva creada"
    );

    setReservationDate("");
    setReservationHour("");

    loadData(client.id);

    setTimeout(() => {

      setReservationMessage("");

    }, 3000);

  }

  return (

<main className="min-h-screen bg-black text-white p-6">

<div className="max-w-md mx-auto flex flex-col gap-4">

<h1 className="text-4xl font-bold text-center">
Crown & Blade
</h1>

<p className="text-center text-zinc-400">
Consulta tus puntos
</p>

<input
type="text"
placeholder="Ingresa tu teléfono"
value={phone}
onChange={(e)=>
setPhone(
e.target.value
)}
className="p-4 rounded-xl bg-zinc-800"
/>

<button
onClick={searchClient}
className="bg-white text-black p-4 rounded-xl font-bold"
>
Consultar
</button>

{error && (
<div className="text-red-500">
{error}
</div>
)}

{client && (

<div className="bg-zinc-900 p-6 rounded-2xl flex flex-col gap-4">

<h2 className="text-2xl font-bold">
{client.name}
</h2>

<p>
⭐ {client.points} puntos
</p>

<div className="mt-6 flex flex-col gap-3">

<h3 className="text-xl font-bold">
Reservar cita
</h3>

<input
  type="date"
  min={
    new Date()
      .toISOString()
      .split("T")[0]
  }
  value={reservationDate}
  onChange={(e)=>{

setReservationDate(
e.target.value
);

setReservationHour(
""
);


}}
  className="p-4 rounded-xl bg-zinc-800"
/>

<select
value={reservationHour}
onChange={(e)=>
setReservationHour(
e.target.value
)}
className="p-4 rounded-xl bg-white text-black rounded-xl"
>

<option value="">
Selecciona hora
</option>

{(
reservationDate &&
new Date(
reservationDate +
"T00:00:00"
).getDay() === 0

?

[
"10:00",
"12:00",
"14:00"
]

:

[
"09:00",
"11:00",
"13:00",
"15:00",
"17:00",
"19:00"
]

).map((hour)=>(

<option
key={hour}
value={hour}
disabled={
occupiedHours.includes(
hour
)
}
>

{
occupiedHours.includes(
hour
)
? `${hour} (ocupada)`
: hour
}

</option>

))}
</select>

{!sundayFull && (

<button
  onClick={
    createReservation
  }
  className="
  bg-blue-600
  p-4
  rounded-xl
  "
>

Solicitar Reserva

</button>

)}

{sundayFull && (

<div
className="
bg-red-600
p-4
rounded-xl
text-center
font-bold
"
>

Domingo completo

</div>

)}

{reservationMessage && (

<div className="text-green-400">

{reservationMessage}

</div>

)}

</div>

<div>

<h3 className="font-bold text-xl">
Mis Reservas
</h3>

<div className="flex flex-col gap-3">

{reservations.map(
(reservation)=>(

<div
key={
reservation.id
}
className="bg-zinc-800 p-3 rounded-xl"
>

<p>
📅 {reservation.date}
</p>

<p>
Estado:
{" "}
{reservation.status}
</p>

</div>

)

)}

</div>

</div>

<div>

<h3 className="font-bold text-xl">
Historial
</h3>

<div className="flex flex-col gap-3">

{history.map(
(item)=>(

<div
key={
item.id
}
className="bg-zinc-800 p-3 rounded-xl"
>

+{item.points}

</div>

)

)}

</div>

</div>

</div>

)}

</div>

</main>

);

}