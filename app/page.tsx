"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Phone,
  Trash2,
  Pencil
} from "lucide-react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {

  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const today = new Date()
  .toISOString()
  .split("T")[0];

const todayReservations =
  reservations.filter(
    (r) =>
      r.date.startsWith(
        today
      )
  );

const pendingToday =
  todayReservations.filter(
    (r) =>
      r.status ===
      "pendiente"
  );

const confirmedToday =
  todayReservations.filter(
    (r) =>
      r.status ===
      "confirmado"
  );
  const completedReservations =
  reservations.filter(
    (r) =>
      r.status ===
      "completado"
  );

const pendingReservations =
  reservations.filter(
    (r) =>
      r.status ===
      "pendiente"
  );

const confirmedReservations =
  reservations.filter(
    (r) =>
      r.status ===
      "confirmado"
  );

const cancelledReservations =
  reservations.filter(
    (r) =>
      r.status ===
      "cancelado"
  );
  const attendanceRate =
  completedReservations.length +
    cancelledReservations.length >
  0
    ? Math.round(
        (
          completedReservations.length /
          (
            completedReservations.length +
            cancelledReservations.length
          )
        ) * 100
      )
    : 0;
    const completedByClient =
  completedReservations.reduce(
    (acc: any, reservation: any) => {

      acc[reservation.client_id] =
        (acc[reservation.client_id] || 0) + 1;

      return acc;

    },
    {}
  );

const topCompletedClientId =
  Object.keys(completedByClient).length > 0
    ? Object.keys(
        completedByClient
      ).reduce((a, b) =>
        completedByClient[a] >
        completedByClient[b]
          ? a
          : b
      )
    : null;

const topCompletedClient =
  clients.find(
    (client) =>
      client.id ==
      topCompletedClientId
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [logged, setLogged] = useState(false);

  const totalPoints = history.reduce(
  (acc, item) => acc + item.points,
  0
);
const topClientId = history.reduce((acc: any, item: any) => {

  acc[item.client_id] = (acc[item.client_id] || 0) + 1;

  return acc;

}, {});

const mostFrequentClientId =
  Object.keys(topClientId).length > 0
    ? Object.keys(topClientId).reduce(
        (a, b) =>
          topClientId[a] > topClientId[b]
            ? a
            : b
      )
    : null;

const mostFrequentClient = clients.find(
  (client) => client.id == mostFrequentClientId
);
async function getClients() {

  const { data } = await supabase
    .from("clients")
    .select("*");

  if (data) {
    setClients(data);
  }

}
  async function createClient() {


    if (!name || !phone) {
      alert("Completa los campos");
      return;
    }

    const { error } = await supabase
  .from("clients")
  .insert([
    {
      name,
      phone: phone.replace(/\D/g, "").slice(-9),
      points: 0
    }
  ]);

if (error) {
  console.log(error);
  alert(error.message);
  return;
}

    setName("");
    setPhone("");

    getClients();

    setMessage("✅ Cliente creado correctamente");

setTimeout(() => {
  setMessage("");
}, 3000);

  }

async function editClient(client: any) {

  const newName = prompt(
    "Nuevo nombre",
    client.name
  );

  const newPhone = prompt(
    "Nuevo teléfono",
    client.phone
  );

  if (!newName || !newPhone) return;

  await supabase
    .from("clients")
    .update({
      name: newName,
      phone: newPhone
    })
    .eq("id", client.id);

  getClients();

}
  async function addPoint(client: any) {

  const newPoints = client.points + 1;

  await supabase
    .from("clients")
    .update({
      points: newPoints
    })
    .eq("id", client.id);

  await supabase
    .from("history")
    .insert([
      {
        client_id: client.id,
        points: 1
      }
    ]);

  getClients();
getHistory();
getReservations();
}
async function getHistory() {

  const { data } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false });

  if (data) {
    setHistory(data);
  }

}
async function getReservations() {

  const { data } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (data) {
    setReservations(data);
  }

}
async function login() {

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {

    alert("Credenciales incorrectas");

  } else {

    setLogged(true);

  }

}

useEffect(() => {

  supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    setLogged(true);
  }
});

  getClients();
  getHistory();
getReservations();

}, []);

  if (!logged) {

  return (

    <div style={{
      minHeight: "100vh",
      background: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#18181b",
        padding: 30,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>

        <h1 style={{
  color: "white",
  fontSize: 32,
  fontWeight: "bold",
  textAlign: "center"
}}>
  Crown & Blade Secure Admin
</h1>

<p style={{
  color: "#aaa",
  textAlign: "center"
}}>
  Ingreso con correo empresarial
</p>
<input
  type="email"
  placeholder="Correo administrador"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    padding: 16,
    borderRadius: 12,
    border: "1px solid #333",
    background: "#27272a",
    color: "white"
  }}
/>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {

  if (e.key === "Enter") {
    login();
  }

}}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#27272a",
            color: "white"
          }}
        />

        <button
          onClick={login}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: "white",
            color: "black",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Entrar
        </button>

      </div>

    </div>

  );

}

return (

  <main className="min-h-screen bg-black text-white p-4">

    <div className="max-w-xl mx-auto">

<div className="bg-zinc-900 p-6 rounded-2xl mb-8">

  <h2 className="text-3xl font-bold mb-6">
    📅 Resumen de Hoy
  </h2>

  <div className="grid grid-cols-3 gap-4">

    <div className="bg-zinc-800 p-4 rounded-xl text-center">
      <p className="text-zinc-400">
        Citas
      </p>
      <p className="text-3xl font-bold">
        {todayReservations.length}
      </p>
    </div>

    <div className="bg-yellow-600 p-4 rounded-xl text-center">
      <p>Pendientes</p>
      <p className="text-3xl font-bold">
        {pendingToday.length}
      </p>
    </div>

    <div className="bg-green-600 p-4 rounded-xl text-center">
      <p>Confirmadas</p>
      <p className="text-3xl font-bold">
        {confirmedToday.length}
      </p>
    </div>

  </div>

</div>
<div className="bg-zinc-900 p-6 rounded-2xl mb-8">

  <h2 className="text-3xl font-bold mb-6">
    📊 Estadísticas Generales
  </h2>

  <div className="grid grid-cols-2 gap-4">

    <div className="bg-zinc-800 p-4 rounded-xl">
      Clientes: {clients.length}
    </div>

    <div className="bg-zinc-800 p-4 rounded-xl">
      Reservas: {reservations.length}
    </div>

    <div className="bg-green-600 p-4 rounded-xl">
      Completadas: {completedReservations.length}
    </div>

    <div className="bg-yellow-600 p-4 rounded-xl">
      Confirmadas: {confirmedReservations.length}
    </div>

    <div className="bg-orange-600 p-4 rounded-xl">
      Pendientes: {pendingReservations.length}
    </div>

    <div className="bg-red-600 p-4 rounded-xl">
      Canceladas: {cancelledReservations.length}
    </div>
<div className="bg-blue-600 p-4 rounded-xl col-span-2">
  Asistencia: {attendanceRate}%
</div>

<div className="bg-purple-600 p-4 rounded-xl col-span-2">
  🏆 Cliente más activo:
  {" "}
  {topCompletedClient?.name ||
    "Sin datos"}
</div>

  </div>

</div>
<div className="bg-zinc-900 p-6 rounded-2xl mb-8">

  <h2 className="text-3xl font-bold mb-6">
    📅 Agenda de Hoy
  </h2>

  <div className="flex flex-col gap-4">

    {todayReservations.length === 0 && (

      <div className="text-zinc-400">
        No hay citas para hoy
      </div>

    )}

    {todayReservations.map((reservation) => (

      <div
        key={reservation.id}
        className="bg-zinc-800 p-4 rounded-xl"
      >

        <p className="text-blue-400 font-bold">
          {reservation.date.split("|")[1]?.trim()}
        </p>

        <p className="text-white font-bold mt-1">
          {reservation.name}
        </p>

        <p
          className={
            reservation.status === "confirmado"
              ? "text-green-400"
              : "text-yellow-400"
          }
        >
          {reservation.status}
        </p>

      </div>

    ))}

  </div>

</div>
      <div className="flex flex-col items-center mb-10">

        <Image
          src="/logo.png"
          alt="Crown Blade"
          width={180}
          height={180}
          priority
          className="rounded-3xl overflow-hidden"
        />

        <h1 className="text-4xl font-bold text-center mt-4">
          Crown & Blade
        </h1>

        <p className="text-zinc-400 mt-2 text-center">
          Barber Studio Loyalty System
        </p>

      </div>

      <div className="flex flex-col gap-4 mb-10 relative z-[9999]">

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 relative z-[9999]"
        />

        <input
          type="text"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 relative z-[9999]"
        />

        <button
          onClick={createClient}
          className="bg-white text-black p-4 rounded-xl font-bold relative z-[9999] touch-manipulation"
        >
          Crear Cliente
        </button>

        <button
  onClick={async () => {

    await supabase.auth.signOut();

setLogged(false);

  }}
  className="bg-red-600 text-white p-3 rounded-xl font-bold"
>
  Cerrar Sesión
</button>

{message && (

  <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl text-center">

    {message}

  </div>

)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Clientes
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {clients.length}
    </h2>

  </div>

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Puntos Entregados
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {totalPoints}
    </h2>

  </div>

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Cliente Frecuente
    </p>

    <h2 className="text-xl font-bold mt-2">
      {mostFrequentClient?.name || "Ninguno"}
    </h2>

  </div>

</div>
<input
  type="text"
  placeholder="Buscar cliente..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 w-full mb-6"
/>
      <div className="flex flex-col gap-6 pb-32">

        {clients
  .filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((client) => (

          <div
            key={client.id}
            className="bg-zinc-900 p-6 rounded-2xl"
          >

            <h2 className="text-2xl font-bold">
              {client.name}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-zinc-300">
              <Phone size={18} />
              {client.phone}
            </div>

            <div className="flex items-center gap-2 mt-3 text-xl">
              <Star size={20} />
              {client.points} puntos
            </div>

            <div className="w-full bg-zinc-700 h-4 rounded-full mt-4 overflow-hidden">

              <div
                className="bg-yellow-400 h-4"
                style={{
                  width: `${(client.points / 10) * 100}%`
                }}
              />

            </div>

            <p className="mt-2 text-sm text-zinc-400">
              Progreso hacia Servicio Deluxe
            </p>

            {client.points >= 5 && client.points < 10 && (

              <div className="flex items-center gap-2 mt-3 text-green-400 font-bold">
                <Trophy size={20} />
                Corte Gratis Desbloqueado
              </div>

            )}

            {client.points >= 10 && (

              <div className="flex items-center gap-2 mt-3 text-yellow-400 font-bold">
                <Trophy size={20} />
                Servicio Deluxe Desbloqueado
              </div>

            )}

            <div className="flex flex-col gap-3 mt-5">
<button
  onClick={() => editClient(client)}
  className="bg-blue-600 p-3 rounded-xl"
>

  <div className="flex items-center justify-center gap-2">
    <Pencil size={18} />
    Editar
  </div>

</button>
              <button
                onClick={() => addPoint(client)}
                className="bg-yellow-400 text-black p-3 rounded-xl font-bold"
              >
                +1 Punto
              </button>

              <button
                onClick={async () => {

                  await supabase
                    .from("clients")
                    .delete()
                    .eq("id", client.id);

                  getClients();

                }}
                className="bg-red-600 p-3 rounded-xl"
              >

                <div className="flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  Eliminar
                </div>

</button>

<div className="bg-white p-4 rounded-xl flex justify-center mt-4">
  <QRCodeCanvas
  value={`https://repository-name-crown-blade-app.vercel.app/cliente?phone=${client.phone}`}
  size={150}
  bgColor={"#FFFFFF"}
  fgColor={"#000000"}
/>
</div>
<a
  href={`https://wa.me/51${client.phone.replace(/\D/g, "").slice(-9)}?text=Consulta%20tus%20puntos%20en%20Crown%20%26%20Blade:%20https://repository-name-crown-blade-app.vercel.app/cliente?phone=${client.phone}`}
  target="_blank"
  className="bg-green-500 text-white p-3 rounded-xl font-bold text-center mt-4 block"
>
  Compartir por WhatsApp
</a>

<button
  onClick={() => {
    const canvas = document.querySelector("canvas");
    const url = canvas?.toDataURL("image/png");

    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${client.name}-qr.png`;
      link.click();
    }
  }}
  className="bg-blue-600 text-white p-3 rounded-xl font-bold text-center mt-3 w-full"
>
  Descargar QR
</button>
            </div>

          </div>

        ))}

      </div>
<div className="mt-16">

  <h2 className="text-3xl font-bold mb-6">
    Historial Reciente
  </h2>

  <div className="flex flex-col gap-4">

    {history.slice(0, 10).map((item) => (

      <div
        key={item.id}
        className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
      >

        <p className="text-yellow-400 font-bold">
          +{item.points} punto
        </p>

        <p className="text-zinc-400 text-sm mt-1">
          Cliente:
          {
            clients.find(
              (client) => client.id === item.client_id
            )?.name
          }
        </p>

        <p className="text-zinc-500 text-xs mt-1">
          {new Date(item.created_at).toLocaleString()}
        </p>

      </div>

    ))}

  </div>
<div className="mt-16">

  <h2 className="text-3xl font-bold mb-6">
  📅 Agenda Activa
</h2>
<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 w-full mb-6"
/>
  <div className="flex flex-col gap-4">

    {reservations
  .filter((reservation) => {

    const dateMatch =
      selectedDate
        ? reservation.date.startsWith(
            selectedDate
          )
        : true;

    const visibleStatus =
      reservation.status !== "completado" &&
      reservation.status !== "cancelado";

    return (
      dateMatch &&
      visibleStatus
    );

  })
  .map((reservation) => (

      <div
        key={reservation.id}
        className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
      >

        <p className="text-white font-bold">
          {reservation.name}
        </p>

        <p className="text-zinc-400">
          📞 {reservation.phone}
        </p>

        <p className="text-blue-400">
          📅 {reservation.date}
        </p>
<a
  href={`https://wa.me/51${reservation.phone.replace(/\D/g, "").slice(-9)}?text=Hola%20${reservation.name}%20👋%20Te%20recordamos%20tu%20cita%20en%20Crown%20%26%20Blade.%20📅%20${reservation.date}`}
  target="_blank"
  className="bg-green-600 p-3 rounded-xl text-center font-bold block mt-4"
>

Enviar Recordatorio

</a>
        <p className="text-yellow-400 font-bold">
          Estado: {reservation.status}
        </p>
<div className="flex gap-3 mt-4">

  <button
    onClick={async () => {

      await supabase
        .from("reservations")
        .update({ status: "confirmado" })
        .eq("id", reservation.id);

      getReservations();

    }}
    className="bg-green-600 p-3 rounded-xl font-bold"
  >
    Confirmar
  </button>

<button
  onClick={async () => {

    await supabase
      .from("reservations")
      .update({
        status: "completado"
      })
      .eq(
        "id",
        reservation.id
      );

    getReservations();

  }}
  className="bg-blue-600 p-3 rounded-xl font-bold"
>
  Completado
</button>

  <button
    onClick={async () => {

      await supabase
        .from("reservations")
        .update({ status: "cancelado" })
        .eq("id", reservation.id);

      getReservations();

    }}
    className="bg-red-600 p-3 rounded-xl font-bold"
  >
    Cancelar
  </button>

</div>
      </div>

    ))}

  </div>
<div className="mt-16">

  <h2 className="text-3xl font-bold mb-6">
    📚 Historial de Servicios
  </h2>

  <div className="flex flex-col gap-4">

    {reservations
      .filter(
        (reservation) =>
          reservation.status === "completado" ||
          reservation.status === "cancelado"
      )
      .map((reservation) => (

        <div
          key={reservation.id}
          className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
        >

          <p className="text-white font-bold">
            {reservation.name}
          </p>

          <p className="text-blue-400">
            📅 {reservation.date}
          </p>

          <p
            className={
              reservation.status === "completado"
                ? "text-blue-400 font-bold"
                : "text-red-400 font-bold"
            }
          >
            {reservation.status}
          </p>

        </div>

      ))}

  </div>

</div>
</div>
</div>

    </div>

  </main>

);

}