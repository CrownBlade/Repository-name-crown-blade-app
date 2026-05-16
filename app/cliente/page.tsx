"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientePage() {
  const [phone, setPhone] = useState("");
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const phoneParam = params.get("phone");

  if (phoneParam) {
    setPhone(phoneParam);

   setTimeout(async () => {
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("phone", phoneParam)
    .single();

  if (data) {
    setClient(data);
    setError("");
  }
}, 500);
  }
}, []);
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState("");
const [history, setHistory] = useState<any[]>([]);
const [reservationDate, setReservationDate] = useState("");
const [reservationMessage, setReservationMessage] = useState("");
  async function searchClient() {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", phone)
      .single();

    if (!data) {
      setError("Cliente no encontrado");
      setClient(null);
      return;
    }

    setError("");
    setClient(data);
    const { data: historyData } = await supabase
  .from("history")
  .select("*")
  .eq("client_id", data.id)
  .order("created_at", { ascending: false });

if (historyData) {
  setHistory(historyData);
}
  }
async function createReservation() {

  if (!client || !reservationDate) {
    alert("Selecciona una fecha");
    return;
  }

  const { error } = await supabase
    .from("reservations")
    .insert([
      {
        client_id: client.id,
        name: client.name,
        phone: client.phone,
        date: reservationDate,
        status: "pendiente"
      }
    ]);

  if (error) {
    alert("Error al reservar");
    return;
  }

  setReservationMessage("✅ Reserva solicitada correctamente");
  setReservationDate("");

  setTimeout(() => {
    setReservationMessage("");
  }, 3000);
}
  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">

      <div className="w-full max-w-md flex flex-col gap-4">

        <h1 className="text-4xl font-bold text-center">
          Crown & Blade
        </h1>

        <p className="text-zinc-400 text-center">
          Consulta tus puntos
        </p>

        <input
          type="text"
          placeholder="Ingresa tu teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-4 rounded-xl bg-zinc-800 border border-zinc-700"
        />

        <button
          onClick={searchClient}
          className="bg-white text-black p-4 rounded-xl font-bold"
        >
          Consultar
        </button>

        {error && (
          <div className="text-red-500 text-center">
            {error}
          </div>
        )}

        {client && (
          <div className="bg-zinc-900 p-6 rounded-2xl mt-6 flex flex-col gap-4">

            <h2 className="text-2xl font-bold">
              {client.name}
            </h2>

            <p className="text-xl">
              ⭐ {client.points} puntos
            </p>

            <div className="w-full bg-zinc-700 h-4 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-4"
                style={{
                  width: `${(client.points / 10) * 100}%`
                }}
              />
            </div>

            {client.points >= 5 && client.points < 10 && (
              <p className="text-green-400 font-bold">
                🎉 Corte Gratis desbloqueado
              </p>
            )}

                        {client.points >= 10 && (
              <p className="text-yellow-400 font-bold">
                🏆 Servicio Deluxe desbloqueado
              </p>
            )}
<div className="mt-6 flex flex-col gap-3">

  <h3 className="text-xl font-bold">
    Reservar cita
  </h3>

  <input
    type="date"
    value={reservationDate}
    onChange={(e) => setReservationDate(e.target.value)}
    className="p-4 rounded-xl bg-zinc-800 border border-zinc-700"
  />

  <button
    onClick={createReservation}
    className="bg-blue-600 text-white p-4 rounded-xl font-bold"
  >
    Solicitar Reserva
  </button>

  {reservationMessage && (
    <div className="text-green-400 text-center">
      {reservationMessage}
    </div>
  )}

</div>
<div className="mt-6">
  <h3 className="text-xl font-bold mb-3">
    Historial Reciente
  </h3>

  <div className="flex flex-col gap-3">

    {history.slice(0, 5).map((item) => (

      <div
        key={item.id}
        className="bg-zinc-800 p-3 rounded-xl"
      >

        <p className="text-yellow-400 font-bold">
          +{item.points} punto
        </p>

        <p className="text-zinc-400 text-sm">
          {new Date(item.created_at).toLocaleString()}
        </p>

      </div>

    ))}

  </div>
</div>

          </div>
        )}

      </div>

    </main>
  );
}